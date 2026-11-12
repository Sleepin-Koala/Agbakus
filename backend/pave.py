import numpy as np


#Maillage pave/on retourne les différents points


def maillage_pave(longueur,largeur,hauteur,nx,ny,nz):
    noeuds=[]
    #nbcellule=nx*ny*nz
    #nbnoeud=(nx+1)*(ny+1)*(nz+1)
    " nx : nombre de segment selon l'axe x (la longueur ) , ny :nombre de segment selon l'axe y (la largeur ) "
    "nz : nombre de segment selon l'axe z (hauteur )"
    for k in range(nz+1):
        for j in range(ny+1):
            for i in range(nx+1):
                x=longueur*i/nx
                y=largeur*j/ny
                z=hauteur*k/nz
                noeuds.append([x,y,z]) #nx*ny*nz : represente le nombre de cellule ; (nx+1)(ny+1)(nz+1) nombre de neoud 
    return noeuds  # on retourne les coordonnées de chaque points possible 

#fonction numéro qui retourne le numéro d'un point(noeud)
def numero(i,j,k,nx,ny):
    return i + (nx+1)*j + (nx+1)*(ny+1)*k

#fonction qui construit automatiquement tous les carrés du fond, pour n’importe quelle taille de pavé.
def faces_bas(nx,ny):
    faces=[]
    for j in range(ny):
        for i in range(nx):
            a = numero(i,j,0, nx, ny)#on est sur la face du bas dc k=0
            b = numero(i+1,j,0, nx, ny)
            c = numero(i+1,j+1,0, nx, ny)
            d = numero(i,j+1, 0, nx, ny)
            faces.append([a, d, c, b])
    return faces


def faces_haut(nx, ny, nz):
#Côté du haut : k = nz, i et j varient 
    faces = []
    for j in range(ny):
        for i in range(nx):
            a = numero(i,   j,   nz, nx, ny)
            b = numero(i+1, j,   nz, nx, ny)
            c = numero(i+1, j+1, nz, nx, ny)
            d = numero(i,   j+1, nz, nx, ny)
            faces.append([a, b, c, d])
    return faces

def faces_avant(nx, ny, nz):
#Côté de l'avant : j = 0, i et k varient
    faces = []
    for k in range(nz):
        for i in range(nx):
            a = numero(i,   0, k,   nx, ny)
            b = numero(i+1, 0, k,   nx, ny)
            c = numero(i+1, 0, k+1, nx, ny)
            d = numero(i,   0, k+1, nx, ny)
            faces.append([a, b, c, d])
    return faces

def faces_arriere(nx, ny, nz):
#Côté de l'arrière : j = ny, i et k varient
    faces = []
    for k in range(nz):
        for i in range(nx):
            a = numero(i,   ny, k,   nx, ny)
            b = numero(i+1, ny, k,   nx, ny)
            c = numero(i+1, ny, k+1, nx, ny)
            d = numero(i,   ny, k+1, nx, ny)
            faces.append([a, d, c, b])
    return faces


def faces_gauche(nx, ny, nz):
#Côté de gauche : i = 0, j et k varient
    faces = []
    for k in range(nz):
        for j in range(ny):
            a = numero(0, j,   k,   nx, ny)
            b = numero(0, j+1, k,   nx, ny)
            c = numero(0, j+1, k+1, nx, ny)
            d = numero(0, j,   k+1, nx, ny)
            faces.append([a, d, c, b])
    return faces

def faces_droite(nx, ny, nz):
   #Côté de droite : i = nx, j et k varient
    faces = []
    for k in range(nz):
        for j in range(ny):
            a = numero(nx, j,   k,   nx, ny)
            b = numero(nx, j+1, k,   nx, ny)
            c = numero(nx, j+1, k+1, nx, ny)
            d = numero(nx, j,   k+1, nx, ny)
            faces.append([a, b, c, d])
    return faces

#foncition qui réunit toutes les faces
def pave_mailler(longueur,largeur,hauteur,nx=12,ny=12,nz=12):
    verifier_entrees(longueur,largeur,hauteur,nx,ny,nz)
    noeuds=maillage_pave(longueur,largeur,hauteur,nx,ny,nz)
    faces=faces_bas(nx,ny)+faces_haut(nx, ny, nz)+faces_avant(nx, ny, nz)+faces_arriere(nx,ny,nz)+faces_gauche(nx, ny, nz)+faces_droite(nx, ny, nz)
    return noeuds,faces

def verifier_entrees(longueur, largeur, hauteur, nx, ny, nz):
#Arrête avec un message clair si une valeur est invalide
    if longueur <= 0:
        raise ValueError("Longueur strictement positive")
    if largeur <= 0:
        raise ValueError("Largeur strictement positive")
    if hauteur <= 0:
        raise ValueError("Hauteur strictement positive")
    if not isinstance(nx, int) or nx < 1:
        raise ValueError("Nombre entier au moins égal à 1")
    if not isinstance(ny, int) or ny < 1:
        raise ValueError("Nombre entier au moins égal à 1")
    if not isinstance(nz, int) or nz < 1:
        raise ValueError("Nombre entier au moins égal à 1")

#Assemblage en un seul bloc
def pave(longueur,largeur,hauteur,nx=12,ny=12,nz=12):
    noeuds,faces=pave_mailler(longueur,largeur,hauteur,nx,ny,nz)
    return{
        "noeuds":noeuds,
        "faces":faces,
        "nb_noeuds":len(noeuds),
        "nb_faces":len(faces)
    }
    
    #maillage volumique
def element(nx,ny,nz):
    v=[]
    #8 coins par bloc
    for k in range(nz):
        for j in range(ny):
            for i in range(nx):
                # 4 coins du bat de la gauche vers la droite sens direct
                a=numero(i,j,k,nx,ny)
                b=numero(i+1,j,k,nx,ny)
                c=numero(i+1,j+1,k,nx,ny)
                d=numero(i,j+1,k,nx,ny)
                #4 coins du haut toujours dans le même sens
                e=numero(i,j,k+1,nx,ny)
                f=numero(i+1,j,k+1,nx,ny)
                g=numero(i+1,j+1,k+1,nx,ny)
                h=numero(i,j+1,k+1,nx,ny)
                v.append([a,b,c,d,e,f,g,h])
    return v

#Pour simuler une poutre, le solveur doit savoir quels nœuds sont encastrés (par exemple tout le côté gauche) et où appliquer une force
def noeuds_face0(nx,ny,nz):
    f0=[]
    for k in range(nz+1):
        for j in range(ny+1):
            X0=numero(0,j,k,nx,ny)#pour face x=0 du côté gauche
            f0.append(X0)
    return f0
    
#pour face x=nx, longueur qu'on veut
def noeuds_face1(nx,ny,nz):
    f1=[]
    for k in range(nz+1):
        for j in range(ny+1):
            X1=numero(nx,j,k,nx,ny)#pour x=0 du côté gauche
            f1.append(X1)
    return f1
    
#face en y=0 maintenant
def noeuds_facey0(nx,ny,nz):
    f0=[]
    for k in range(nz+1):
        for i in range(nx+1):
            X0=numero(i,0,k,nx,ny)
            f0.append(X0)
    return f0

#face y=largeur
def noeuds_facey1(nx,ny,nz):
    f1=[]
    for k in range(nz+1):
        for i in range(nx+1):
            X1=numero(i,ny,k,nx,ny)
            f1.append(X1)
    return f1

#face en z=0 
def noeuds_facez0(nx,ny,nz):
    f0=[]
    for j in range(ny+1):
        for i in range(nx+1):
            X0=numero(i,j,0,nx,ny)
            f0.append(X0)
    return f0

#face z=hauteur
def noeuds_facez1(nx,ny,nz):
    f1=[]
    for j in range(ny+1):
        for i in range(nx+1):
            X1=numero(i,j,nz,nx,ny)
            f1.append(X1)
    return f1


#maillage complet pave
def maillage_complet(longueur,largeur,hauteur,nx=12,ny=12,nz=12):
    maille=pave(longueur,largeur,hauteur,nx,ny,nz)
    maille["elements"]=element(nx,ny,nz)
    maille["nb_elements"]=len(maille["elements"])
    maille["ensembles"]={
        "face_X0":noeuds_face0(nx,ny,nz),
        "face_X1":noeuds_face1(nx,ny,nz),
        "face_Y0":noeuds_facey0(nx,ny,nz),
        "face_Y1":noeuds_facey1(nx,ny,nz),
        "face_Z0":noeuds_facez0(nx,ny,nz),
        "face_Z1":noeuds_facez1(nx,ny,nz)
    }
    return maille