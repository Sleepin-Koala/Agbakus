import numpy as np 
import math

#Maillage cylindre on retourne les différents points

def maillage_noeuds(rayon,hauteur,n_theta,nz):
    noeuds=[]
    for k in range(nz+1):
        z=hauteur*k/nz#
        for m in range(n_theta):
            angle=m*2*math.pi/n_theta #on determine l'angle en radian 
            X=rayon*math.cos(angle) #coordonné X
            Y=rayon*math.sin(angle) #Y
            noeuds.append([X,Y,z])
    noeuds.append([0,0,0]) #centre du bas
    noeuds.append([0,0,hauteur])#centre du haut
    return noeuds

#fonction numéro qui retourne le numéro d'un point(noeud)
def num_cyl(k,m,n_theta):
    return k*n_theta+m

#fonction pour construire la face du coté du cylindre
def faces_cote(n_theta,nz):
    faces=[]
    for k in range(nz):
        for m in range(n_theta):
            m1=(m+1)%n_theta #le cyclindre se ferme dc à un certain moment on revient sur le point de départ, on utilise le reste pour ne pas avoir de numero qui n'existe pas
            a=num_cyl(k,m,n_theta)
            b=num_cyl(k,m1,n_theta)
            c=num_cyl(k+1,m1,n_theta)
            d=num_cyl(k+1,m,n_theta)
            faces.append([a,b,c,d])
    return faces

#faces du bas
def faces_dubas(n_theta,nz):
    centre=n_theta*(nz+1) #le centre de la face
    faces=[]
    for m in range(n_theta):
        m1=(m+1) % n_theta
        a=num_cyl(0,m,n_theta)#k=0 car on se trouve sur la face du bas
        b=num_cyl(0,m1,n_theta)#le point qui suit
        faces.append([centre,b,a])
    return faces

#faces du haut du cylindre
def faces_duhaut(n_theta,nz):
    centre=n_theta*(nz+1)+1
    faces=[]
    for m in range(n_theta):
        m1=(m+1) % n_theta
        a=num_cyl(nz,m,n_theta)
        b=num_cyl(nz,m1,n_theta)
        faces.append([centre,a,b])
    return faces

#vérification des entrées
def verifier_entrees_cyl(rayon, hauteur, n_theta, nz):
    if rayon <= 0:
        raise ValueError("Le rayon doit être strictement positif.")
    if hauteur <= 0:
        raise ValueError("La hauteur doit être strictement positive.")
    if not isinstance(n_theta, int) or n_theta < 3:
        raise ValueError("Le nombre de divisions n_theta doit être un entier au moins égal à 3.")
    if not isinstance(nz, int) or nz < 1:
        raise ValueError("Le nombre de divisions nz doit être un entier au moins égal à 1.")

#Assemblage des faces
def cyl_maillage(rayon,hauteur,n_theta=20,nz=10):
    verifier_entrees_cyl(rayon, hauteur, n_theta, nz)
    noeuds= maillage_noeuds(rayon,hauteur,n_theta,nz)
    faces=faces_cote(n_theta,nz) + faces_dubas(n_theta,nz) +  faces_duhaut(n_theta,nz)
    return noeuds,faces

#réponses réunies dans un dictionnaire
def cylindre(rayon,hauteur,n_theta=20,nz=10):
    noeuds,faces=cyl_maillage(rayon,hauteur,n_theta,nz)
    return {
        "noeuds":noeuds,
        "faces":faces,
        "nb_noeuds":len(noeuds),
        "nb_faces":len(faces)
    }
    
    
#maillage volumique

def numero_rangee(j, p, nc):
#Numéro, dans une couche, du point p de la rangée j (j = 0 : carré, j = n_r : cercle)
    n_int = (nc - 1) ** 2
    return n_int + j * 4 * nc + p

def noeuds_couche(rayon, nc, nr):
    a = rayon / 2 # demi-côté du carré central
    nper = 4 * nc # points sur le périmètre du carré
    P = [] # périmètre du carré
    for p in range(nper):
        cote = p // nc
        f = (p % nc) / nc
        if cote == 0:
            x, y = -a + 2*a*f, -a
        elif cote == 1:
            x, y = a, -a + 2*a*f
        elif cote == 2:
            x, y = a - 2*a*f, a
        else:
            x, y = -a, a - 2*a*f
        P.append([x, y])
    C = [] # points du cercle, à angles réguliers
    for p in range(nper):
        angle = -0.75*math.pi + 2*math.pi*p/nper
        C.append([rayon*math.cos(angle), rayon*math.sin(angle)])
    noeuds = []                   # intérieur du carré
    for j in range(1, nc):
        for i in range(1, nc):
            noeuds.append([-a + 2*a*i/nc, -a + 2*a*j/nc])
    for j in range(nr + 1):       # rangées entre le carré et le cercle
        t = j / nr
        for p in range(nper):
            noeuds.append([(1-t)*P[p][0] + t*C[p][0], (1-t)*P[p][1] + t*C[p][1]])
    return noeuds


def quads_couche(nc, nr):
    nper = 4 * nc
# table (i, j)=numéro du nœud, pour la grille (nc+1) x (nc+1) du carré central
    ident = [[0] * (nc + 1) for _ in range(nc + 1)]
    c = 0
    for j in range(1, nc): # nœuds intérieurs
        for i in range(1, nc):
            ident[i][j] = c
            c += 1
    for t in range(nc): # les 4 côtés du carré = rangée 0
        ident[t][0]= numero_rangee(0, t, nc) # bas
        ident[nc][t]= numero_rangee(0, nc + t, nc) # droite
        ident[nc - t][nc]= numero_rangee(0, 2 * nc + t, nc) # haut
        ident[0][nc - t]= numero_rangee(0, 3 * nc + t, nc) # gauche
    quads= []
    for j in range(nc): # cases du carré central
        for i in range(nc):
            quads.append([ident[i][j], ident[i + 1][j], ident[i + 1][j + 1], ident[i][j + 1]])
    for j in range(nr): # cases des 4 secteurs
        for p in range(nper):
            p1 = (p + 1) % nper
            quads.append([numero_rangee(j, p, nc), numero_rangee(j + 1, p, nc),
                          numero_rangee(j + 1, p1, nc), numero_rangee(j, p1, nc)])
    return quads


def verifier_entrees_cyl_vol(rayon, hauteur, n_theta, nz, n_r):
    if rayon <= 0:
        raise ValueError("Le rayon doit être strictement positif.")
    if hauteur <= 0:
        raise ValueError("La hauteur doit être strictement positive.")
    if not isinstance(n_theta, int) or n_theta < 4 or n_theta % 4 != 0:
        raise ValueError("Pour le maillage volumique, n_theta doit être un entier multiple de 4.")
    if not isinstance(nz, int) or nz < 1:
        raise ValueError("Le nombre de divisions nz doit être un entier au moins égal à 1.")
    if n_r is not None and (not isinstance(n_r, int) or n_r < 1):
        raise ValueError("Le nombre de divisions radiales n_r doit être un entier au moins égal à 1.")


def cylindre_volumique(rayon, hauteur, n_theta=20, nz=10, n_r=None):
    verifier_entrees_cyl_vol(rayon, hauteur, n_theta, nz, n_r)
    nc = n_theta // 4
    if n_r is None:
        n_r = nc
    nper = 4 * nc
    couche = noeuds_couche(rayon, nc, n_r) # nœuds 2D d'une couche
    n2 = len(couche)
    quads = quads_couche(nc, n_r) # cases 2D d'une couche
    noeuds = [] # on empile les couches
    for k in range(nz + 1):
        z = hauteur * k / nz
        for x, y in couche:
            noeuds.append([x, y, z])
    elements = [] # chaque case devient un hexaèdre à 8 coins
    for k in range(nz):
        for q in quads:
            bas = [k * n2 + v for v in q]
            haut = [(k + 1) * n2 + v for v in q]
            elements.append(bas + haut)
    lateral = [] # la paroi,le cercle de chaque couche
    for k in range(nz + 1):
        for p in range(nper):
            lateral.append(k * n2 + numero_rangee(n_r, p, nc))
    return {
        "noeuds": noeuds,
        "elements": elements,
        "nb_noeuds": len(noeuds),
        "nb_elements": len(elements),
        "ensembles": {
            "face_z0": list(range(n2)),
            "face_z1": list(range(nz * n2, (nz + 1) * n2)),
            "lateral": sorted(lateral),
        },
    }