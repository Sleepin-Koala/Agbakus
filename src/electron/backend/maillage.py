"on appelle ici le maillage du pave ou du cylindre selon le type de géométrie"

from pave import pave_mailler
from cylindre import cyl_maillage


def _entier(params, cle, defaut):
    """Lit un entier ; accepte 12.0 (JSON) et le convertit en 12."""
    valeur = params.get(cle, defaut)
    if isinstance(valeur, float) and valeur.is_integer():
        valeur = int(valeur)
    return valeur


def generer_maillage(geometrie, params=None):
    if not isinstance(params, dict):
        params = {}
    typ = geometrie["type"]

    if typ == "pave":
        return pave_mailler(
            float(geometrie["longueur"]),
            float(geometrie["largeur"]),
            float(geometrie["hauteur"]),
            nx=_entier(params, "nx", 12),
            ny=_entier(params, "ny", 12),
            nz=_entier(params, "nz", 12),
        )

    if typ == "cylindre":
        return cyl_maillage(
            float(geometrie["rayon"]),
            float(geometrie["hauteur"]),
            n_theta=_entier(params, "n_theta", 20),
            nz=_entier(params, "nz", 10),
        )

    raise ValueError(f"Type de géométrie inconnu : {typ}")