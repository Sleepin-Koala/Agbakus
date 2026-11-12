import logging
import time

import argparse
import multiprocessing
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from materiaux import MATERIAUX
from modele_analytique import resultat_verification
from deplacement import calculer_deplacements
from maillage import generer_maillage  

app = FastAPI(title="Backend Modélisation 2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


PORT = 9888

logger = logging.getLogger("uvicorn.error")

AXES = ("x", "y", "z")
CHAMPS_MATERIAU = ("module_young", "coefficient_poisson", "masse_volumique", "limite_elastique")



class ErreurAPI(Exception):
    def __init__(self, code, http, message, champ=None):
        self.code, self.http, self.message, self.champ = code, http, message, champ


@app.exception_handler(ErreurAPI)
async def gerer_erreur_api(request: Request, e: ErreurAPI):
    corps = {"code": e.code, "message": e.message}
    if e.champ:                       # "champ" absent si aucun champ précis
        corps["champ"] = e.champ
    return JSONResponse(status_code=e.http, content={"erreur": corps})


@app.exception_handler(StarletteHTTPException)
async def gerer_erreur_http(request: Request, e: StarletteHTTPException):
    # 404 (route inconnue), 405 (mauvaise méthode)
    return JSONResponse(status_code=e.status_code,
                        content={"erreur": {"code": "ERREUR_HTTP","message": str(e.detail)}})


@app.exception_handler(Exception)
async def gerer_erreur_inattendue(request: Request, e: Exception):
    logger.exception("Erreur interne")
    return JSONResponse(status_code=500,
                        content={"erreur": {"code": "ERREUR_INTERNE", "message": "Erreur interne du serveur."}})


# =====================================================================
# 2. OUTILS DE VALIDATION 
# =====================================================================
def lire(obj, cle, chemin=""):
    """Lit obj[cle] ou lève CHAMP_MANQUANT."""
    if not isinstance(obj, dict) or cle not in obj:
        champ = f"{chemin}.{cle}" if chemin else cle
        raise ErreurAPI("CHAMP_MANQUANT", 400,
                        f"Le champ « {champ} » est obligatoire.", champ)
    return obj[cle]


def positif(valeur, champ):
    """Vérifie qu'on a un nombre strictement positif."""
    if isinstance(valeur, bool) or not isinstance(valeur, (int, float)) or valeur <= 0:
        raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                        f"« {champ} » doit être un nombre strictement positif.", champ)
    return float(valeur)


def valider_geometrie(geo):
    typ = lire(geo, "type", "geometrie")
    if typ == "pave":
        for k in ("longueur", "largeur", "hauteur"):
            positif(lire(geo, k, "geometrie"), f"geometrie.{k}")
    elif typ == "cylindre":
        for k in ("rayon", "hauteur"):
            positif(lire(geo, k, "geometrie"), f"geometrie.{k}")
    else:
        raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                        "Le type doit être « pave » ou « cylindre ».", "geometrie.type")
    return typ


def valider_materiau(mat):
    """Renvoie (module_young, coef_poisson, limite_elastique)."""
    nom = lire(mat, "nom", "materiau")
    if nom == "Autre":
        for c in CHAMPS_MATERIAU:
            positif(lire(mat, c, "materiau"), f"materiau.{c}")
        nu = mat["coefficient_poisson"]
        if not 0 < nu < 0.5:
            raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                            "ν doit être strictement compris entre 0 et 0,5.",
                            "materiau.coefficient_poisson")
        donnees = mat
    else:
        donnees = MATERIAUX.get(nom)
        if donnees is None:
            raise ErreurAPI("MATERIAU_INCONNU", 404,f"Le matériau « {nom} » est inconnu.", "materiau.nom")
    re_ = donnees["limite_elastique"]
    return (float(donnees["module_young"]),
            float(donnees["coefficient_poisson"]),
            None if re_ is None else float(re_))


# =====================================================================
# 3. ROUTE GET /materiaux
# =====================================================================
@app.get("/materiaux")
async def liste_materiaux():
    # Triée par ordre alphabétique, avec "nom" dans chaque objet (contrat)
    liste = [{"nom": nom, **donnees} for nom, donnees in sorted(MATERIAUX.items())]
    return {"materiaux": liste}


# =====================================================================
# 4. ROUTE POST /simulation
# =====================================================================
@app.post("/simulation")
async def simulation(request: Request):
    t0 = time.perf_counter()   # pour temps_calcul_ms

    #  Étape 1 : lire le JSON 
    try:
        corps = await request.json()
    except Exception:
        raise ErreurAPI("JSON_INVALIDE", 400,
                        "Le corps de la requête n'est pas un JSON lisible.")
    if not isinstance(corps, dict):
        raise ErreurAPI("JSON_INVALIDE", 400,
                        "Le corps de la requête n'est pas un JSON lisible.")

    # Étape 2 : valider chaque bloc (on s'arrête à la 1re erreur) 
    geometrie = lire(corps, "geometrie")
    typ = valider_geometrie(geometrie)

    module_young, coef_poisson, limite_elastique = valider_materiau(
        lire(corps, "materiau"))

    sollicitation = lire(corps, "sollicitation")
    if sollicitation not in ("traction", "compression", "cisaillement"):
        raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                        "Sollicitation inconnue.", "sollicitation")

    charge = lire(corps, "charge")
    positif(lire(charge, "valeur", "charge"), "charge.valeur")

    encastrement = lire(corps, "encastrement")
    axe = lire(encastrement, "axe", "encastrement")
    cote = lire(encastrement, "cote", "encastrement")
    if axe not in AXES:
        raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                        "L'axe doit être x, y ou z.", "encastrement.axe")
    if cote not in ("min", "max"):
        raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                        "Le côté doit être « min » ou « max ».", "encastrement.cote")

    # --- Étape 3 : validations croisées (COMBINAISON_INVALIDE) ---
    if typ == "cylindre" and axe != "z":
        raise ErreurAPI("COMBINAISON_INVALIDE", 400,
                        "Un cylindre ne peut être encastré que selon z.",
                        "encastrement.axe")

    if sollicitation == "cisaillement":
        direction = lire(charge, "direction", "charge")
        if direction not in AXES:
            raise ErreurAPI("PARAMETRE_INVALIDE", 400,
                            "La direction doit être x, y ou z.", "charge.direction")
        if direction == axe:
            raise ErreurAPI("COMBINAISON_INVALIDE", 400,
                            "La direction de cisaillement doit différer de "
                            "l'axe d'encastrement.", "charge.direction")
    # En traction/compression, une "direction" éventuelle est ignorée.

    #Étape 4 : maillage
    try:
        noeuds, faces = generer_maillage(geometrie, corps.get("maillage"))
    except ValueError as e:
        raise ErreurAPI("PARAMETRE_INVALIDE", 400, str(e), "maillage")

    #Étape 5 : calcul analytique 
    res = resultat_verification(geometrie, encastrement, charge, sollicitation,
                                module_young, coef_poisson, limite_elastique)

    

    # Étape 6 : déplacements des nœuds 
    deplacements = calculer_deplacements(
        noeuds,
        res["resultats"]["deformation"],
        coef_poisson,
        encastrement,
        sollicitation,
        charge,
    )

    #  Étape 7 : réponse au format du contrat 
    temps_ms = round((time.perf_counter() - t0) * 1000)
    return {
        "noeuds": noeuds,
        "faces": faces,
        "deplacements": deplacements,
        "resultats": res["resultats"],
        "verifications": res["verifications"],
        "temps_calcul_ms": temps_ms,
    }


@app.post("/maillage")
async def maillage(request: Request):
    # 1. Lecture du JSON
    try:
        corps = await request.json()
    except Exception:
        raise ErreurAPI("JSON_INVALIDE", 400,
                        "Le corps de la requête n'est pas un JSON lisible.")
    if not isinstance(corps, dict):
        raise ErreurAPI("JSON_INVALIDE", 400,
                        "Le corps de la requête n'est pas un JSON lisible.")

    # 2. Validation de la géométrie
    geometrie = lire(corps, "geometrie")
    valider_geometrie(geometrie)

    # 3. Génération du maillage
    try:
        noeuds, faces = generer_maillage(geometrie, corps.get("maillage"))
    except ValueError as e:
        raise ErreurAPI("PARAMETRE_INVALIDE", 400, str(e), "maillage")

    # 4. Réponse au format du contrat
    return {
        "noeuds": noeuds,
        "faces": faces,
        "nb_noeuds": len(noeuds),
        "nb_faces": len(faces),
    }

if __name__ == "__main__":
    multiprocessing.freeze_support()  # nécessaire pour un exécutable PyInstaller sous Windows
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=8000)
    a = p.parse_args()
    uvicorn.run(app, host="127.0.0.1", port=a.port)