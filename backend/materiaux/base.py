"""Base de matériaux 
Unites : rho en kg/m3 ; E et Re en MPa ; nu sans unite.
"""

from pathlib import Path
import unicodedata
import re
from .mat_base import MATERIAUX

DOSSIER = Path(__file__).resolve().parent

class ErreurMateriau(ValueError):
    """Erreur liée à la recherche ou à la validation d'un matériau."""

def _normaliser(nom):
    """Normalise les accents, espaces et majuscules pour faciliter la recherche."""
    if not isinstance(nom, str):
        raise TypeError("Le nom du matériau doit être une chaîne de caractères.")
    texte = unicodedata.normalize("NFKD", nom.strip().casefold())
    texte = "".join(c for c in texte if not unicodedata.combining(c))
    return re.sub(r"[\s_\-]+", "", texte)

def _charger_base():
    """Charge le fichier JSON situé dans le même dossier que base.py.
    if not FICHIER_JSON.exists():
        raise FileNotFoundError(
            f"Base introuvable : {FICHIER_JSON}. "
            "Placez materiaux.json dans le même dossier que base.py."
        )
    with FICHIER_JSON.open("r", encoding="utf-8") as fichier:
        donnees = json.load(fichier)
    if not isinstance(donnees, dict) or "materiaux" not in donnees:
        raise ErreurMateriau("Structure du fichier materiaux.json invalide.")"""

    return MATERIAUX["materiaux"]

def lister_materiaux():
    """Retourne la liste triée des noms de matériaux disponibles."""
    return sorted(_charger_base().keys(), key=str.casefold)

def get_materiau(nom):
    """
    Retourne la fiche complète d'un matériau.
    Lève ErreurMateriau si le matériau n'existe pas.
    """
    base = _charger_base()
    index = {_normaliser(cle): cle for cle in base}
    alias = {
        "fonte": "Fontes",
        "fontes": "Fontes",
        "laiton": "Laiton(Cu+Zn)",
        "laitoncu zn": "Laiton(Cu+Zn)",
        "aluminium6061t6": "Aluminium",
        "caoutchoucnaturel": "Caoutchouc",
    }
    cle_recherche = _normaliser(nom)
    cle_recherche = _normaliser(alias.get(cle_recherche, nom))
    cle = index.get(cle_recherche)
    if cle is None:
        raise ErreurMateriau(
            f"MATERIAU_INCONNU : '{nom}'. "
            f"Matériaux disponibles : {', '.join(lister_materiaux())}"
        )
    fiche = dict(base[cle])
    fiche["nom"] = cle
    return fiche

def get_proprietes(nom):
    """Retourne uniquement les propriétés attendues par le modèle analytique."""
    fiche = get_materiau(nom)
    return {cle: fiche[cle] for cle in ("E", "nu", "rho", "Re")}

def valider_materiau_personnalise(nom, rho, E, nu, Re=None):
    """
    Valide un matériau saisi par l'utilisateur (« Autre »).
    Conditions : nom non vide ; rho > 0 ; E > 0 ; 0 <= nu < 0.5 ;
    Re > 0 si une limite élastique est fournie, sinon None.
    """
    if not isinstance(nom, str) or not nom.strip():
        raise ErreurMateriau("Le nom du matériau est obligatoire.")
    for valeur, etiquette in ((rho, "rho"), (E, "E"), (nu, "nu")):
        if isinstance(valeur, bool) or not isinstance(valeur, (int, float)):
            raise ErreurMateriau(f"{etiquette} doit être un nombre.")
        if not __import__("math").isfinite(valeur):
            raise ErreurMateriau(f"{etiquette} doit être fini.")
    if rho <= 0:
        raise ErreurMateriau("rho doit être strictement positif (kg/m3).")
    if E <= 0:
        raise ErreurMateriau("E doit être strictement positif (MPa).")
    if not 0 <= nu < 0.5:
        raise ErreurMateriau("Le coefficient de Poisson doit vérifier 0 <= nu < 0.5.")
    if Re is not None:
        if isinstance(Re, bool) or not isinstance(Re, (int, float)):
            raise ErreurMateriau("Re doit être un nombre positif ou None.")
        if not __import__("math").isfinite(Re) or Re <= 0:
            raise ErreurMateriau("Re doit être strictement positif ou None.")
    return {"nom": nom.strip(), "rho": float(rho), "E": float(E),
            "nu": float(nu), "Re": None if Re is None else float(Re)}

def obtenir_limite_elastique(nom):
    """
    Retourne Re en MPa, ou None si elle n'est pas définie.
    L'appelant doit alors indiquer que la vérification élastique est indisponible.
    """
    return get_materiau(nom)["Re"]