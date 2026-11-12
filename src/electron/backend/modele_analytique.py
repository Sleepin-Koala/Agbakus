import numpy as np


def cal_geometrie(geometrie,encastrement): #renvoie la longueur L et la surface A
    if geometrie["type"] == "cylindre" :
        L = geometrie["hauteur"]
        r = geometrie["rayon"]
        A = np.pi * r**2
        return(A,L)
    elif geometrie["type"] == "pave" :
        dimensions_axe = {"x":geometrie["longueur"],
                         "y":geometrie["largeur"],
                         "z":geometrie["hauteur"]}
        volume = dimensions_axe["x"]*dimensions_axe["y"]*dimensions_axe["z"]
        
        L = dimensions_axe[encastrement["axe"]]
        A = volume/L
        
        return(A,L)

def cal_contrainte(A,charge,sollicitation):
    signe = 1
    if sollicitation == "compression" : signe = -1
    F = signe*charge["valeur"]
    sigma = F/A
    return sigma

def cal_deformation(sigma,module_young): # calcul d'epsilon la deformation
    return sigma/module_young

def cal_deformation_trans(epsilon,coef_poisson):
    return -coef_poisson*epsilon

def cal_allongement(epsilon,L):
    return epsilon*L

def cal_allongement_trans(epsilon_trans,d):
    return epsilon_trans*d

def verification(limite_elastique,sigma): #b repond à la question de savoir si nous somme dans le dommaine elastique et cs designe le coefficient de securité
    # Limite élastique inconnue (verre, béton...) : vérification non évaluable
    if limite_elastique is None:
        return None, None
    b = bool(abs(sigma) < limite_elastique)
    cs = float(limite_elastique / abs(sigma))
    return b, cs

def cal_deformation_cisail(module_young,coef_poisson,sigma):
    G = module_young/(2*(1+coef_poisson))
    return sigma/G

def resultat_verification(geometrie,encastrement,charge,sollicitation,module_young,coef_poisson,limite_elastique): #renvoie ce qui est attendu par le contrat
    #module_young,coef_poisson,limite_elastique sont obtenu dans le dictionnaire materiau
    A,L = cal_geometrie(geometrie,encastrement)
    sigma = cal_contrainte(A,charge,sollicitation)
    if sollicitation in ("compression","traction"):
        epsilon = cal_deformation(sigma,module_young)
    elif sollicitation == "cisaillement" :
        epsilon = cal_deformation_cisail(module_young,coef_poisson,sigma)
        
    allongement = cal_allongement(epsilon,L)
    
    veri = verification(limite_elastique,sigma)
    
    return {"resultats":{
        "section":A,
        "contrainte":sigma,
        "deformation":epsilon,
        "allongement":allongement
        },
        "verifications":{
            "domaine_elastique": veri[0],
            "coefficient_securite": veri[1]
        }}