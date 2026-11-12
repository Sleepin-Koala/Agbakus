"""Tests du backend .


Les requêtes de test utilisent les unités mm, N, MPa (E et Re en MPa).
Si le contrat d'API impose des mètres, adapter pave_geo / cyl_geo / la charge,
et la valeur attendue dans test_traction_acier_deformation_analytique.

À la fin, le test test_exporter_exemples écrit des fichiers JSON dans le
dossier exemples/ : ce sont les vraies réponses du serveur, à donner au front.
"""
import copy
import json
import math
from collections import Counter
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from electron.backend.App import app
import electron.backend.pave as modpave
import electron.backend.cylindre as modcyl
from electron.backend.maillage import generer_maillage
from electron.backend.materiaux import MATERIAUX

# raise_server_exceptions=False : une erreur 500 est renvoyée comme réponse
# (au lieu de faire planter le test), on peut donc la lire et l'afficher.
client = TestClient(app, raise_server_exceptions=False)


# =====================================================================
# Utilitaires (sans numpy)
# =====================================================================
def sub(a, b):
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]


def cross(a, b):
    return [a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]]


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def norme(a):
    return math.sqrt(dot(a, a))


def moyenne(points):
    n = len(points)
    return [sum(p[i] for p in points) / n for i in range(3)]


def normale(P):
    """Normale (non normalisée) d'une face de 3 ou 4 sommets."""
    if len(P) == 4:
        return cross(sub(P[1], P[0]), sub(P[3], P[0]))
    return cross(sub(P[1], P[0]), sub(P[2], P[0]))


def aire(P):
    if len(P) == 4:
        return 0.5 * norme(cross(sub(P[2], P[0]), sub(P[3], P[1])))
    return 0.5 * norme(cross(sub(P[1], P[0]), sub(P[2], P[0])))


def pave_geo(L=100, l=10, h=10):
    return {"type": "pave", "longueur": L, "largeur": l, "hauteur": h}


def cyl_geo(R=5, h=100):
    return {"type": "cylindre", "rayon": R, "hauteur": h}


def requete(**surcharges):
    """Requête valide de référence (pavé en acier, traction, encastré en x min)."""
    corps = {
        "geometrie": pave_geo(),
        "materiau": {"nom": "Acier"},
        "sollicitation": "traction",
        "charge": {"valeur": 1000},
        "encastrement": {"axe": "x", "cote": "min"},
        "maillage": {"nx": 4, "ny": 2, "nz": 2},
    }
    corps.update(surcharges)
    return corps


def retirer(corps, *chemin):
    """Copie du corps avec la clé désignée par le chemin supprimée."""
    c = copy.deepcopy(corps)
    cible = c
    for cle in chemin[:-1]:
        cible = cible[cle]
    del cible[chemin[-1]]
    return c


def envoyer(corps):
    return client.post("/simulation", json=corps)


def verifier_erreur(r, status, code, champ=None):
    assert r.status_code == status, f"statut {r.status_code} au lieu de {status} : {r.text}"
    e = r.json()["erreur"]
    assert e["code"] == code, e
    assert e["message"]
    if champ is not None:
        assert e.get("champ") == champ, e


# =====================================================================
# PARTIE 1 : maillages seuls (sans serveur)
# =====================================================================
MAILLAGES = [
    pytest.param(pave_geo(4, 2, 1), {"nx": 4, "ny": 2, "nz": 2}, (2, 1, 0.5), id="pave 4x2x1 maille 4,2,2"),
    pytest.param(pave_geo(3, 3, 3), {"nx": 1, "ny": 1, "nz": 1}, (1.5, 1.5, 1.5), id="cube 1 cellule"),
    pytest.param(cyl_geo(1, 3), {"n_theta": 12, "nz": 3}, (0, 0, 1.5), id="cylindre 12x3"),
    pytest.param(cyl_geo(2, 5), {"n_theta": 3, "nz": 1}, (0, 0, 2.5), id="cylindre minimal 3x1"),
]


def test_numero_pointe_le_bon_noeud():
    nx, ny, nz = 5, 2, 3
    noeuds = modpave.maillage_pave(10, 4, 6, nx, ny, nz)
    for k in range(nz + 1):
        for j in range(ny + 1):
            for i in range(nx + 1):
                n = modpave.numero(i, j, k, nx, ny)
                assert noeuds[n] == pytest.approx([10 * i / nx, 4 * j / ny, 6 * k / nz])
    assert modpave.numero(5, 2, 0, 5, 2) == 17


@pytest.mark.parametrize("nx,ny,nz", [(1, 1, 1), (4, 2, 2), (3, 5, 2)])
def test_pave_comptages(nx, ny, nz):
    noeuds, faces = generer_maillage(pave_geo(), {"nx": nx, "ny": ny, "nz": nz})
    assert len(noeuds) == (nx + 1) * (ny + 1) * (nz + 1)
    assert len(faces) == 2 * (nx * ny + nx * nz + ny * nz)


@pytest.mark.parametrize("n_theta,nz", [(3, 1), (12, 3), (20, 10)])
def test_cylindre_comptages(n_theta, nz):
    noeuds, faces = generer_maillage(cyl_geo(), {"n_theta": n_theta, "nz": nz})
    assert len(noeuds) == n_theta * (nz + 1) + 2
    assert len(faces) == n_theta * nz + 2 * n_theta


def test_maillage_par_defaut():
    n, f = generer_maillage(pave_geo(), None)
    assert len(n) == 13 ** 3
    n, f = generer_maillage(cyl_geo(), None)
    assert len(n) == 20 * 11 + 2 and len(f) == 20 * 10 + 2 * 20


@pytest.mark.parametrize("geo,params,centre", MAILLAGES)
def test_indices_de_faces_valides(geo, params, centre):
    noeuds, faces = generer_maillage(geo, params)
    for f in faces:
        assert len(f) in (3, 4)
        assert len(set(f)) == len(f), f"sommet répété dans la face {f}"
        assert all(isinstance(i, int) and 0 <= i < len(noeuds) for i in f), f


@pytest.mark.parametrize("geo,params,centre", MAILLAGES)
def test_surface_fermee(geo, params, centre):
    """Dans une surface fermée, chaque arête appartient à exactement 2 faces."""
    _, faces = generer_maillage(geo, params)
    aretes = Counter()
    for f in faces:
        for a, b in zip(f, f[1:] + f[:1]):
            aretes[tuple(sorted((a, b)))] += 1
    mauvaises = [a for a, c in aretes.items() if c != 2]
    assert not mauvaises, f"{len(mauvaises)} arêtes non partagées par 2 faces"


@pytest.mark.parametrize("geo,params,centre", MAILLAGES)
def test_normales_sortantes(geo, params, centre):
    """Toutes les faces doivent avoir leur normale tournée vers l'extérieur."""
    noeuds, faces = generer_maillage(geo, params)
    rentrantes = 0
    for f in faces:
        P = [noeuds[i] for i in f]
        if dot(normale(P), sub(moyenne(P), list(centre))) <= 0:
            rentrantes += 1
    assert rentrantes == 0, (
        f"{rentrantes}/{len(faces)} faces ont la normale rentrante "
        "(pavé : inverser l'ordre [a,b,c,d] -> [a,d,c,b] dans faces_bas, "
        "faces_arriere et faces_gauche)"
    )


@pytest.mark.parametrize("geo,params,centre", MAILLAGES)
def test_aire_totale(geo, params, centre):
    noeuds, faces = generer_maillage(geo, params)
    total = sum(aire([noeuds[i] for i in f]) for f in faces)
    if geo["type"] == "pave":
        L, l, h = geo["longueur"], geo["largeur"], geo["hauteur"]
        attendue = 2 * (L * l + L * h + l * h)
    else:
        R, h, n = geo["rayon"], geo["hauteur"], params["n_theta"]
        attendue = n * 2 * R * math.sin(math.pi / n) * h + n * R * R * math.sin(2 * math.pi / n)
    assert total == pytest.approx(attendue, rel=1e-9)


@pytest.mark.parametrize("geo,params,centre", MAILLAGES)
def test_boite_englobante(geo, params, centre):
    noeuds, _ = generer_maillage(geo, params)
    xs, ys, zs = zip(*noeuds)
    assert min(zs) == pytest.approx(0) and max(zs) == pytest.approx(geo["hauteur"])
    if geo["type"] == "pave":
        assert min(xs) == pytest.approx(0) and max(xs) == pytest.approx(geo["longueur"])
        assert min(ys) == pytest.approx(0) and max(ys) == pytest.approx(geo["largeur"])
    else:
        R = geo["rayon"]
        assert max(math.hypot(x, y) for x, y, _ in noeuds) == pytest.approx(R)
        assert max(xs) == pytest.approx(R)


@pytest.mark.parametrize("geo,params", [
    (pave_geo(), {"nx": 0}),
    (pave_geo(), {"nx": 2.5}),
    (pave_geo(), {"ny": "abc"}),
    (pave_geo(), {"nz": -1}),
    (cyl_geo(), {"n_theta": 2}),
    (cyl_geo(), {"nz": 0}),
])
def test_maillage_invalide_leve_valueerror(geo, params):
    with pytest.raises(ValueError):
        generer_maillage(geo, params)


# --- maillages volumiques (hexaèdres) ---------------------------------
def jacobiennes_bas(noeuds, hexa):
    a, b, c, d, e, f, g, h = [noeuds[i] for i in hexa]
    coins = [(a, b, d, e), (b, c, a, f), (c, d, b, g), (d, a, c, h)]
    return [dot(sub(p, o), cross(sub(q, o), sub(r, o))) for o, p, q, r in coins]


def test_pave_volumique():
    L, l, h, nx, ny, nz = 4, 2, 1, 4, 2, 2
    m = modpave.maillage_complet(L, l, h, nx, ny, nz)
    noeuds, elements = m["noeuds"], m["elements"]
    assert len(elements) == nx * ny * nz == m["nb_elements"]
    volume = 0
    for hexa in elements:
        assert len(set(hexa)) == 8
        jac = jacobiennes_bas(noeuds, hexa)
        assert all(j > 0 for j in jac), "hexaèdre retourné (volume négatif)"
        volume += jac[0]
    assert volume == pytest.approx(L * l * h)
    cibles = {"face_X0": (0, 0), "face_X1": (0, L), "face_Y0": (1, 0),
              "face_Y1": (1, l), "face_Z0": (2, 0), "face_Z1": (2, h)}
    for nom, (axe, valeur) in cibles.items():
        ens = m["ensembles"][nom]
        assert all(abs(noeuds[n][axe] - valeur) < 1e-12 for n in ens), nom
        attendu = sum(1 for p in noeuds if abs(p[axe] - valeur) < 1e-12)
        assert len(set(ens)) == attendu, nom


def test_cylindre_volumique():
    R, h, n_theta, nz = 5, 100, 8, 3
    m = modcyl.cylindre_volumique(R, h, n_theta=n_theta, nz=nz)
    nc = n_theta // 4
    nr = nc
    n2 = (nc - 1) ** 2 + (nr + 1) * 4 * nc
    nq = nc ** 2 + nr * 4 * nc
    noeuds, elements = m["noeuds"], m["elements"]
    assert len(noeuds) == n2 * (nz + 1)
    assert len(elements) == nq * nz
    for hexa in elements:
        assert all(j > 0 for j in jacobiennes_bas(noeuds, hexa)), "hexaèdre retourné"
    lateral = m["ensembles"]["lateral"]
    assert len(lateral) == (nz + 1) * 4 * nc
    assert all(math.hypot(noeuds[n][0], noeuds[n][1]) == pytest.approx(R) for n in lateral)


# =====================================================================
# PARTIE 2 : API, route GET /materiaux
# =====================================================================
def test_get_materiaux():
    r = client.get("/materiaux")
    assert r.status_code == 200
    liste = r.json()["materiaux"]
    noms = [m["nom"] for m in liste]
    assert len(liste) == len(MATERIAUX) > 0
    assert noms == sorted(noms), "la liste doit être triée par ordre alphabétique"
    assert "Autre" not in noms
    for m in liste:
        assert {"nom", "module_young", "coefficient_poisson",
                "masse_volumique", "limite_elastique"} <= set(m)
        assert m["module_young"] > 0 and m["masse_volumique"] > 0
        assert 0 < m["coefficient_poisson"] < 0.5
        assert m["limite_elastique"] is None or m["limite_elastique"] > 0


def test_get_materiaux_limite_elastique_nulle():
    liste = {m["nom"]: m for m in client.get("/materiaux").json()["materiaux"]}
    assert liste["Verre"]["limite_elastique"] is None
    assert liste["Acier"]["limite_elastique"] == 235


# =====================================================================
# PARTIE 3 : API, POST /simulation, cas valides
# =====================================================================
AUTRE = {"nom": "Autre", "module_young": 25000, "coefficient_poisson": 0.28,
         "masse_volumique": 1500, "limite_elastique": 120}

CAS_VALIDES = [
    pytest.param(requete(), id="pave traction"),
    pytest.param(requete(sollicitation="compression"), id="pave compression"),
    pytest.param(requete(sollicitation="cisaillement",
                         charge={"valeur": 1000, "direction": "y"}), id="pave cisaillement y"),
    pytest.param(requete(encastrement={"axe": "z", "cote": "max"}), id="pave encastre z max"),
    pytest.param(requete(encastrement={"axe": "y", "cote": "min"}), id="pave encastre y min"),
    pytest.param(retirer(requete(), "maillage"), id="pave maillage par defaut"),
    pytest.param(requete(geometrie=cyl_geo(), encastrement={"axe": "z", "cote": "min"},
                         maillage={"n_theta": 12, "nz": 3}), id="cylindre traction"),
    pytest.param(requete(geometrie=cyl_geo(), encastrement={"axe": "z", "cote": "max"},
                         sollicitation="cisaillement",
                         charge={"valeur": 500, "direction": "x"},
                         maillage={"n_theta": 8, "nz": 2}), id="cylindre cisaillement x"),
    pytest.param(retirer(requete(geometrie=cyl_geo(), encastrement={"axe": "z", "cote": "min"}),
                         "maillage"), id="cylindre maillage par defaut"),
    pytest.param(requete(materiau=AUTRE), id="materiau Autre"),
    pytest.param(requete(sollicitation="cisaillement",
                         charge={"valeur": 1000, "direction": "z"}), id="cisaillement z (axe x)"),
    pytest.param(requete(charge={"valeur": 1000, "direction": "x"}),
                 id="traction avec direction ignoree"),
]

CLES_REPONSE = {"noeuds", "faces", "deplacements", "resultats", "verifications", "temps_calcul_ms"}


def controler_reponse(r):
    assert r.status_code == 200, r.text
    d = r.json()
    assert CLES_REPONSE <= set(d), f"clés manquantes : {CLES_REPONSE - set(d)}"
    n = len(d["noeuds"])
    assert n > 0 and all(len(p) == 3 for p in d["noeuds"])
    assert len(d["faces"]) > 0
    for f in d["faces"]:
        assert len(f) in (3, 4) and all(0 <= i < n for i in f)
    if isinstance(d["deplacements"], list):
        assert len(d["deplacements"]) == n, "un déplacement par nœud attendu"
    assert isinstance(d["temps_calcul_ms"], int) and d["temps_calcul_ms"] >= 0
    assert "resultats" in d and "deformation" in d["resultats"]
    return d


@pytest.mark.parametrize("corps", CAS_VALIDES)
def test_simulation_valide(corps):
    controler_reponse(envoyer(corps))


@pytest.mark.parametrize("nom", sorted(MATERIAUX))
def test_tous_les_materiaux_fonctionnent(nom):
    """Inclut les matériaux sans limite élastique (Verre, Béton...).
    Un échec 500 ici = App.py ou modele_analytique.py ne gère pas Re = None."""
    r = envoyer(requete(materiau={"nom": nom}))
    assert r.status_code == 200, (
        f"{nom} : {r.text} (si Re est None : corriger valider_materiau dans App.py "
        "et modele_analytique.py ; détails dans le terminal du serveur)"
    )


def test_verification_selon_limite_elastique():
    """Avec limite élastique : booléen + nombre. Sans (Verre) : null + null."""
    avec = envoyer(requete(materiau={"nom": "Acier"})).json()["verifications"]
    assert avec["domaine_elastique"] is True
    assert avec["coefficient_securite"] == pytest.approx(235 / 10)   # Re / sigma
    hors = envoyer(requete(charge={"valeur": 100000})).json()["verifications"]
    assert hors["domaine_elastique"] is False                          # sigma = 1000 MPa > Re
    assert hors["coefficient_securite"] == pytest.approx(235 / 1000)
    sans = envoyer(requete(materiau={"nom": "Verre"})).json()["verifications"]
    assert sans["domaine_elastique"] is None
    assert sans["coefficient_securite"] is None


def test_maillage_demande_respecte():
    d = controler_reponse(envoyer(requete(maillage={"nx": 3, "ny": 2, "nz": 1})))
    assert len(d["noeuds"]) == 4 * 3 * 2
    assert len(d["faces"]) == 2 * (3 * 2 + 3 * 1 + 2 * 1)
    d = controler_reponse(envoyer(requete(geometrie=cyl_geo(),
                                          encastrement={"axe": "z", "cote": "min"},
                                          maillage={"n_theta": 10, "nz": 4})))
    assert len(d["noeuds"]) == 10 * 5 + 2
    assert len(d["faces"]) == 10 * 4 + 2 * 10


def test_traction_acier_deformation_analytique():
    """Test de cohérence des unités : traction d'une barre 100x10x10 mm,
    F = 1000 N -> sigma = F/S = 10 MPa -> epsilon = sigma/E (E = 210000 MPa)."""
    d = controler_reponse(envoyer(requete()))
    sigma = 1000 / (10 * 10)
    attendu = sigma / MATERIAUX["Acier"]["module_young"]
    obtenu = d["resultats"]["deformation"]
    rapport = obtenu / attendu if attendu else float("nan")
    assert obtenu == pytest.approx(attendu, rel=1e-6), (
        f"déformation obtenue {obtenu}, attendue {attendu} (rapport {rapport}). "
        "Un rapport proche de 1e6 ou 1e-6 indique un problème d'unités "
        "(m ou mm, Pa ou MPa)."
    )


def test_compression_meme_amplitude_que_traction():
    t = envoyer(requete()).json()["resultats"]["deformation"]
    c = envoyer(requete(sollicitation="compression")).json()["resultats"]["deformation"]
    assert abs(c) == pytest.approx(abs(t), rel=1e-9)


def test_materiau_plus_rigide_deforme_moins():
    acier = envoyer(requete(materiau={"nom": "Acier"})).json()["resultats"]["deformation"]
    alu = envoyer(requete(materiau={"nom": "Aluminium"})).json()["resultats"]["deformation"]
    assert abs(alu) > abs(acier)


def test_gros_maillage_reste_rapide():
    r = envoyer(requete(maillage={"nx": 30, "ny": 30, "nz": 30}))
    assert r.status_code == 200, r.text
    assert r.json()["temps_calcul_ms"] < 10000


# =====================================================================
# PARTIE 4 : API, erreurs (le front doit les recevoir au format du contrat)
# =====================================================================
def b(**kw):
    return requete(**kw)


CAS_ERREURS = [
    # (id, corps, statut, code, champ)
    ("geometrie absente", retirer(b(), "geometrie"), 400, "CHAMP_MANQUANT", "geometrie"),
    ("geometrie.type absent", retirer(b(), "geometrie", "type"), 400, "CHAMP_MANQUANT", "geometrie.type"),
    ("type inconnu", b(geometrie={"type": "sphere", "rayon": 1}), 400, "PARAMETRE_INVALIDE", "geometrie.type"),
    ("longueur absente", retirer(b(), "geometrie", "longueur"), 400, "CHAMP_MANQUANT", "geometrie.longueur"),
    ("longueur negative", b(geometrie=pave_geo(L=-1)), 400, "PARAMETRE_INVALIDE", "geometrie.longueur"),
    ("longueur nulle", b(geometrie=pave_geo(L=0)), 400, "PARAMETRE_INVALIDE", "geometrie.longueur"),
    ("longueur texte", b(geometrie=pave_geo(L="abc")), 400, "PARAMETRE_INVALIDE", "geometrie.longueur"),
    ("longueur booleen", b(geometrie=pave_geo(L=True)), 400, "PARAMETRE_INVALIDE", "geometrie.longueur"),
    ("rayon absent", b(geometrie={"type": "cylindre", "hauteur": 10}, encastrement={"axe": "z", "cote": "min"}),
     400, "CHAMP_MANQUANT", "geometrie.rayon"),
    ("materiau absent", retirer(b(), "materiau"), 400, "CHAMP_MANQUANT", "materiau"),
    ("materiau.nom absent", b(materiau={}), 400, "CHAMP_MANQUANT", "materiau.nom"),
    ("materiau inconnu", b(materiau={"nom": "Unobtainium"}), 404, "MATERIAU_INCONNU", "materiau.nom"),
    ("Autre sans E", b(materiau={k: v for k, v in AUTRE.items() if k != "module_young"}),
     400, "CHAMP_MANQUANT", "materiau.module_young"),
    ("Autre nu = 0,5", b(materiau={**AUTRE, "coefficient_poisson": 0.5}),
     400, "PARAMETRE_INVALIDE", "materiau.coefficient_poisson"),
    ("Autre nu = 0", b(materiau={**AUTRE, "coefficient_poisson": 0}),
     400, "PARAMETRE_INVALIDE", "materiau.coefficient_poisson"),
    ("Autre E negatif", b(materiau={**AUTRE, "module_young": -5}),
     400, "PARAMETRE_INVALIDE", "materiau.module_young"),
    ("sollicitation absente", retirer(b(), "sollicitation"), 400, "CHAMP_MANQUANT", "sollicitation"),
    ("sollicitation inconnue", b(sollicitation="torsion"), 400, "PARAMETRE_INVALIDE", "sollicitation"),
    ("charge absente", retirer(b(), "charge"), 400, "CHAMP_MANQUANT", "charge"),
    ("charge.valeur absente", b(charge={}), 400, "CHAMP_MANQUANT", "charge.valeur"),
    ("charge nulle", b(charge={"valeur": 0}), 400, "PARAMETRE_INVALIDE", "charge.valeur"),
    ("charge negative", b(charge={"valeur": -10}), 400, "PARAMETRE_INVALIDE", "charge.valeur"),
    ("encastrement absent", retirer(b(), "encastrement"), 400, "CHAMP_MANQUANT", "encastrement"),
    ("axe invalide", b(encastrement={"axe": "w", "cote": "min"}), 400, "PARAMETRE_INVALIDE", "encastrement.axe"),
    ("cote invalide", b(encastrement={"axe": "x", "cote": "milieu"}), 400, "PARAMETRE_INVALIDE", "encastrement.cote"),
    ("cylindre encastre en x", b(geometrie=cyl_geo(), encastrement={"axe": "x", "cote": "min"},
                                 maillage={"n_theta": 8, "nz": 2}), 400, "COMBINAISON_INVALIDE", "encastrement.axe"),
    ("cisaillement sans direction", b(sollicitation="cisaillement"), 400, "CHAMP_MANQUANT", "charge.direction"),
    ("cisaillement direction invalide", b(sollicitation="cisaillement", charge={"valeur": 1, "direction": "w"}),
     400, "PARAMETRE_INVALIDE", "charge.direction"),
    ("cisaillement direction = axe", b(sollicitation="cisaillement", charge={"valeur": 1, "direction": "x"}),
     400, "COMBINAISON_INVALIDE", "charge.direction"),
    # Erreurs de maillage : exigent la capture de ValueError dans App.py (étape 4)
    ("maillage nx = 0", b(maillage={"nx": 0, "ny": 2, "nz": 2}), 400, "PARAMETRE_INVALIDE", None),
    ("maillage nx decimal", b(maillage={"nx": 2.5, "ny": 2, "nz": 2}), 400, "PARAMETRE_INVALIDE", None),
    ("maillage texte", b(maillage={"nx": "abc"}), 400, "PARAMETRE_INVALIDE", None),
    ("cylindre n_theta = 2", b(geometrie=cyl_geo(), encastrement={"axe": "z", "cote": "min"},
                               maillage={"n_theta": 2, "nz": 2}), 400, "PARAMETRE_INVALIDE", None),
]


@pytest.mark.parametrize("corps,statut,code,champ",
                         [pytest.param(c, s, k, f, id=i) for i, c, s, k, f in CAS_ERREURS])
def test_erreur_attendue(corps, statut, code, champ):
    verifier_erreur(envoyer(corps), statut, code, champ)


def test_json_illisible():
    r = client.post("/simulation", content="ceci n'est pas du json",
                    headers={"Content-Type": "application/json"})
    verifier_erreur(r, 400, "JSON_INVALIDE")


def test_json_pas_un_objet():
    verifier_erreur(client.post("/simulation", json=[1, 2, 3]), 400, "JSON_INVALIDE")


def test_corps_vide():
    verifier_erreur(client.post("/simulation"), 400, "JSON_INVALIDE")


def test_route_inconnue():
    verifier_erreur(client.get("/nimporte/quoi"), 404, "ERREUR_HTTP")


def test_mauvaise_methode():
    verifier_erreur(client.get("/simulation"), 405, "ERREUR_HTTP")
    verifier_erreur(client.post("/materiaux", json={}), 405, "ERREUR_HTTP")


# =====================================================================
# PARTIE 5 : CORS (indispensable pour que le navigateur du front accepte)
# =====================================================================
def test_cors_requete_preflight():
    r = client.options("/simulation", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") in ("*", "http://localhost:3000")


def test_cors_en_tete_sur_les_reponses():
    ok = client.get("/materiaux", headers={"Origin": "http://localhost:3000"})
    assert ok.headers.get("access-control-allow-origin") in ("*", "http://localhost:3000")
    ko = client.post("/simulation", json={}, headers={"Origin": "http://localhost:3000"})
    assert ko.status_code == 400
    assert ko.headers.get("access-control-allow-origin") in ("*", "http://localhost:3000")


# =====================================================================
# PARTIE 6 : exemples de vraies réponses pour l'équipe front
# =====================================================================
def test_exporter_exemples():
    dossier = Path(__file__).resolve().parent / "exemples"
    dossier.mkdir(exist_ok=True)

    def ecrire(nom, contenu):
        (dossier / nom).write_text(json.dumps(contenu, ensure_ascii=False, indent=2),
                                   encoding="utf-8")

    req_pave = requete(maillage={"nx": 2, "ny": 1, "nz": 1})
    req_cyl = requete(geometrie=cyl_geo(), encastrement={"axe": "z", "cote": "min"},
                      maillage={"n_theta": 6, "nz": 1})
    req_verre = requete(materiau={"nom": "Verre"}, maillage={"nx": 1, "ny": 1, "nz": 1})
    req_erreur = requete(sollicitation="torsion")

    ecrire("requete_pave.json", req_pave)
    ecrire("reponse_pave.json", controler_reponse(envoyer(req_pave)))
    ecrire("requete_cylindre.json", req_cyl)
    ecrire("reponse_cylindre.json", controler_reponse(envoyer(req_cyl)))
    ecrire("requete_materiau_sans_limite.json", req_verre)
    ecrire("reponse_materiau_sans_limite.json", controler_reponse(envoyer(req_verre)))
    ecrire("requete_erreur.json", req_erreur)
    ecrire("reponse_erreur.json", envoyer(req_erreur).json())
    ecrire("reponse_materiaux.json", client.get("/materiaux").json())


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))