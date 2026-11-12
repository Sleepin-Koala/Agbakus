import numpy as np

_AXES = {'x': 0, 'y': 1, 'z': 2}

## La fonction d'aide _indice_axe
def _indice_axe(axe):
    try:
        return _AXES[str(axe).lower()]
    except KeyError:
        raise ValueError("l'axe doit etre 'x', 'y' ou 'z' .")


## La signature de calculer_deplacements
# >>> AJOUT : parametre amplification_laterale (1.0 = physique reelle, rien ne change)
# >>> CORRECTION : 'epislon' -> 'epsilon' (faute de frappe)
def calculer_deplacements(noeuds, epsilon, nu, axe='x', encastrement='min',
                          type_sollicitation='traction', gamma=0.0,
                          centre=None, tangent=None,
                          amplification_laterale=1.0):

    noeuds = np.asarray(noeuds, dtype=np.float64)
    # >>> CORRECTION : 'noeud.shape' -> 'noeuds.shape'
    if noeuds.ndim != 2 or noeuds.shape[1] != 3 or noeuds.shape[0] == 0:
        raise ValueError("le noeuds doit etre un tableau (N,3) non vide.")
    if not (0.0 < nu < 0.5):
        raise ValueError("le coefficient de Poisson doit verifier 0.0 < nu <0.5. ")
    mode = type_sollicitation.lower()

    ## l'encastrement
    # >>> CORRECTION : '.lowers()' -> '.lower()'
    cote = encastrement.lower()
    if cote not in ('min', 'max'):
        raise ValueError("L'encastrement dois etre 'min' ou 'max'. ")

    # >>> CORRECTION : ces lignes etaient DANS le 'if' juste apres le 'raise'.
    # Elles ne s'executaient donc jamais. Elles sont maintenant au bon niveau.
    idx_ax = _indice_axe(axe)
    idx_trans = [i for i in range(3) if i != idx_ax]
    coords_ax = noeuds[:, idx_ax]
    val_min, val_max = coords_ax.min(), coords_ax.max()

    s = coords_ax - val_min if cote == 'min' else coords_ax - val_max

    ## tableau des deplacements
    u = np.zeros_like(noeuds)

    ## traction et compression
    # >>> CORRECTION : 'mode (...)' -> 'mode in (...)'
    if mode in ('traction', 'compression'):
        eps = abs(epsilon) if mode == 'traction' else -abs(epsilon)

        # deplacement axial (le long de la force)
        u[:, idx_ax] = eps * s

        # >>> DEFORMATION LATERALE (effet Poisson) <<<
        # Quand la barre s'allonge (traction), sa section se RETRECIT.
        # Quand elle se raccourcit (compression), sa section GONFLE.
        # Chaque noeud se deplace perpendiculairement a l'axe, proportionnellement
        # a sa distance au centre de la section : u_lat = -nu * eps * (position - centre)
        for i in idx_trans:
            if centre is None:
                c = 0.5 * (noeuds[:, i].min() + noeuds[:, i].max())
            else:
                c = float(np.asarray(centre, dtype=float)[idx_trans.index(i)])

            # >>> AJOUT : facteur amplification_laterale (visibilite a l'ecran)
            u[:, i] = -nu * eps * amplification_laterale * (noeuds[:, i] - c)

    ## cisaillement
    elif mode == 'cisaillement':
        idx_t = idx_trans[0] if tangent is None else _indice_axe(tangent)
        if idx_t == idx_ax:
            raise ValueError("La direction tangentielle dit differer de l'axe de sollicitation.")
        u[:, idx_t] = gamma * s
    else:
        raise ValueError("Type de sollicitation non reconnu.")
    return u


##  noeuds_deformes : la position deformee
def noeuds_deformes(noeuds, u, facteur=1.0):
    return np.asarray(noeuds, float) + facteur * np.asarray(u, float)


## calculer epsilon et gamma
def epsilon_axiale(F, E_GPa, aire):
    return F / (E_GPa * 1e3 * aire)


def gamma_cisaillement(F, E_GPa, nu, aire):
    return F / ((E_GPa * 1e3 / (2.0 * (1.0 + nu))) * aire)
