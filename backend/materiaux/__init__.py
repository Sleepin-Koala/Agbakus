"""Interface entre la base de matériaux 
et App.py, qui fait : from materiaux import MATERIAUX"""

from .base import lister_materiaux, get_materiau


def _construire():
    materiaux = {}
    for nom in lister_materiaux():
        fiche = get_materiau(nom)
        materiaux[nom] = {
            "module_young": fiche["E"],
            "coefficient_poisson": fiche["nu"],
            "masse_volumique": fiche["rho"],
            "limite_elastique": fiche["Re"],
        }
    return materiaux


MATERIAUX = _construire()