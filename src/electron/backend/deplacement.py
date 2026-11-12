import numpy as np
_AXES = {"x": 0, "y": 1, "z": 2}


def _indice_axe(axe):
    try:
        return _AXES[str(axe).lower()]
    except KeyError:
        raise ValueError("L'axe doit etre 'x', 'y' ou 'z'.")


def calculer_deplacements(noeuds, epsilon, coef_poisson, encastrement,
                          sollicitation, charge=None, avec_poisson=True):
    """e
    noeuds        : liste/tableau (N,3), positions initiales en mm
    epsilon       : deformation axiale (traction/compression) ou
                    angle de glissement gamma (cisaillement)
    encastrement  : {"axe": "x", "cote": "min"}
    sollicitation : "traction", "compression" ou "cisaillement"
    charge        : {"valeur": ..., "direction": "y"}  (direction : cisaillement seulement)
    Renvoie la liste des deplacements [ux, uy, uz] en mm.
    """
    noeuds = np.asarray(noeuds, dtype=np.float64)
    if noeuds.ndim != 2 or noeuds.shape[1] != 3 or noeuds.shape[0] == 0:
        raise ValueError("Les noeuds doivent former un tableau (N,3) non vide.")
    if not (0.0 < coef_poisson < 0.5):
        raise ValueError("Le coefficient de Poisson doit verifier 0 < nu < 0.5.")

    idx_ax = _indice_axe(encastrement["axe"])
    cote = str(encastrement["cote"]).lower()
    if cote not in ("min", "max"):
        raise ValueError("Le côte d'encastrement doit être 'min' ou 'max'.")
    mode = str(sollicitation).lower()

    # --- geometrie le long de l'axe d'encastrement ---
    coords_ax = noeuds[:, idx_ax]
    x_min, x_max = coords_ax.min(), coords_ax.max()
    x_fixe = x_min if cote == "min" else x_max
    L = x_max - x_min
    s = coords_ax - x_fixe      # signe : nul sur la face encastree
    dist = np.abs(s)            # distance à la face encastree

    u = np.zeros_like(noeuds)

    if mode in ("traction", "compression"):
        eps = abs(epsilon) if mode == "traction" else -abs(epsilon)
        u[:, idx_ax] = eps * s

        if avec_poisson:
            facteur = dist / L  # 0 à l'encastrement, 1 sur la face chargee
            for i in range(3):
                if i == idx_ax:
                    continue
                centre = 0.5 * (noeuds[:, i].min() + noeuds[:, i].max())
                u[:, i] = -coef_poisson * eps * (noeuds[:, i] - centre) * facteur

    elif mode == "cisaillement":
        if charge is None or "direction" not in charge:
            raise ValueError("Le cisaillement exige charge['direction'].")
        idx_t = _indice_axe(charge["direction"])
        if idx_t == idx_ax:
            raise ValueError("La direction de cisaillement doit differer de l'axe d'encastrement.")
        u[:, idx_t] = abs(epsilon) * dist  # gamma > 0 : la force pousse dans +direction

    else:
        raise ValueError("Type de sollicitation non reconnu.")

    return u.tolist()