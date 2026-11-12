# API Backend — Modélisation 2 (guide pour l'équipe front-end)

Le backend reçoit une description de pièce (pavé ou cylindre), un matériau et une sollicitation, et renvoie le **maillage 3D**, les **déplacements** de chaque nœud et les **résultats** du calcul analytique.

## 1. Démarrer le serveur

```
python -m pip install fastapi uvicorn
python App.py
```

- Adresse : `http://127.0.0.1:5000`
- Documentation interactive (tester sans écrire de code) : `http://127.0.0.1:5000/docs`
- CORS ouvert à toutes les origines : le navigateur accepte les appels depuis n'importe quelle page.
- Pour qu'un autre ordinateur du réseau puisse appeler le serveur, remplacer `host="127.0.0.1"` par `host="0.0.0.0"` à la dernière ligne d'`App.py`.

Deux routes seulement, toutes deux en JSON.

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/materiaux` | liste des matériaux disponibles |
| POST | `/simulation` | lance un calcul complet |

## 2. Unités

- `module_young` et `limite_elastique` : **MPa**
- `masse_volumique` : **kg/m³**
- `coefficient_poisson` : sans unité

**Jeu d'unités cohérent du projet : longueurs en mm, charge en N.** Les contraintes sortent alors en MPa, les sections en mm² et les déplacements en mm. Le serveur ne convertit rien : envoyer des mètres donnerait des résultats faux sans message d'erreur.

## 3. GET `/materiaux`

Réponse (liste triée par ordre alphabétique) :

```json
{
  "materiaux": [
    {"nom": "Acier", "module_young": 210000, "coefficient_poisson": 0.3,
     "masse_volumique": 7850, "limite_elastique": 235},
    {"nom": "Verre", "module_young": 70000, "coefficient_poisson": 0.22,
     "masse_volumique": 2500, "limite_elastique": null}
  ]
}
```

Matériaux : Acier, Aluminium, Béton, Caoutchouc, Cuivre, Diamant, Fer, Fontes, Laiton(Cu+Zn), Magnésium, Or, Plomb, Polystyrène, Silicium, Titane, Verre, Zinc.

**`limite_elastique` vaut `null`** pour Béton, Caoutchouc, Diamant, Or, Polystyrène, Silicium et Verre (matériaux fragiles ou sans limite élastique définie). Dans ce cas, la réponse de `/simulation` contient `"domaine_elastique": null` et `"coefficient_securite": null` (voir section 4) : l'interface doit afficher « non évaluable » et ne rien calculer.

Le nom **`Autre`** est réservé (matériau saisi par l'utilisateur) : il n'apparaît pas dans cette liste.

## 4. POST `/simulation`

### Requête

```json
{
  "geometrie":     {"type": "pave", "longueur": 100, "largeur": 10, "hauteur": 10},
  "materiau":      {"nom": "Acier"},
  "sollicitation": "traction",
  "charge":        {"valeur": 1000},
  "encastrement":  {"axe": "x", "cote": "min"},
  "maillage":      {"nx": 4, "ny": 2, "nz": 2}
}
```

| Champ | Valeurs | Remarques |
|---|---|---|
| `geometrie.type` | `"pave"` ou `"cylindre"` | |
| pavé | `longueur`, `largeur`, `hauteur` | nombres strictement positifs |
| cylindre | `rayon`, `hauteur` | nombres strictement positifs |
| `materiau.nom` | un nom de `/materiaux`, ou `"Autre"` | |
| matériau `Autre` | + `module_young`, `coefficient_poisson`, `masse_volumique`, `limite_elastique` | tous strictement positifs ; ν strictement entre 0 et 0,5 |
| `sollicitation` | `"traction"`, `"compression"`, `"cisaillement"` | |
| `charge.valeur` | nombre strictement positif | |
| `charge.direction` | `"x"`, `"y"`, `"z"` | **obligatoire seulement pour le cisaillement**, et différente de `encastrement.axe` ; ignorée sinon |
| `encastrement.axe` | `"x"`, `"y"`, `"z"` | un **cylindre** ne peut être encastré que selon `"z"` |
| `encastrement.cote` | `"min"` ou `"max"` | |
| `maillage` | optionnel | voir ci-dessous |

**Maillage (optionnel)** — plus il est fin, plus la réponse est lourde.

| Géométrie | Clés | Contraintes | Défaut |
|---|---|---|---|
| pavé | `nx`, `ny`, `nz` (cellules selon x, y, z) | entiers ≥ 1 | 12, 12, 12 |
| cylindre | `n_theta` (divisions autour), `nz` (divisions en hauteur) | `n_theta` entier ≥ 3, `nz` entier ≥ 1 | 20, 10 |

Nombre de nœuds : pavé `(nx+1)(ny+1)(nz+1)` ; cylindre `n_theta·(nz+1) + 2`.

### Réponse (200)

Exemple réel : pavé 100 × 10 × 10 mm en acier, traction de 1000 N, encastré en x min, maillage 2 × 1 × 1 (nœuds, faces et déplacements abrégés) :

```json
{
  "noeuds": [[0.0, 0.0, 0.0], [50.0, 0.0, 0.0], [100.0, 0.0, 0.0], "..."],
  "faces": [[0, 3, 4, 1], [1, 4, 5, 2], "..."],
  "deplacements": [[0.0, 0.0, 0.0], [0.00238, 0.0000357, 0.0000357], "..."],
  "resultats": {
    "section": 100.0,
    "contrainte": 10.0,
    "deformation": 4.761904761904762e-05,
    "allongement": 0.004761904761904762
  },
  "verifications": {"domaine_elastique": true, "coefficient_securite": 23.5},
  "temps_calcul_ms": 0
}
```

| Clé | Contenu | Unité |
|---|---|---|
| `noeuds` | liste de points `[x, y, z]` ; l'indice d'un nœud dans la liste est son numéro | mm |
| `faces` | listes de **3 ou 4 indices** (à partir de 0) pointant dans `noeuds` | — |
| `deplacements` | un vecteur `[dx, dy, dz]` par nœud, **dans le même ordre que `noeuds`** ; nul sur la face encastrée | mm |
| `resultats.section` | aire de la section perpendiculaire à l'axe d'encastrement | mm² |
| `resultats.contrainte` | σ = F / section ; **négative en compression** | MPa |
| `resultats.deformation` | ε = σ / E (traction, compression) ; en cisaillement, distorsion γ = τ / G | sans unité |
| `resultats.allongement` | déformation × longueur selon l'axe d'encastrement ; négatif en compression ; en cisaillement, décalage transversal | mm |
| `verifications.domaine_elastique` | `true` si \|σ\| < limite élastique | — |
| `verifications.coefficient_securite` | limite élastique / \|σ\| (plus il est grand, plus la marge est grande) | — |
| `temps_calcul_ms` | durée du calcul côté serveur | ms |

**Matériau sans limite élastique** (Verre, Béton...) : `domaine_elastique` et `coefficient_securite` valent `null`. Afficher « non évaluable » : ne pas les traiter comme `false` ou `0`, ce qui laisserait croire que la pièce est hors limite.

**Déplacements à amplifier pour l'affichage.** Ce sont les vraies valeurs, minuscules devant les dimensions (ici 0,005 mm pour une barre de 100 mm). Pour rendre la déformation visible, multiplier les déplacements par un facteur d'amplification (par exemple réglable par l'utilisateur) et l'indiquer à l'écran : `position affichée = noeud + facteur × déplacement`.

### Repère et maillage

**Pavé** : x = longueur, y = largeur, z = hauteur. Il occupe `[0, longueur] × [0, largeur] × [0, hauteur]`.
Toutes les faces sont des **quadrilatères** (4 sommets). La liste `noeuds` contient aussi des nœuds **intérieurs** qui n'apparaissent dans aucune face : ils ne servent pas à dessiner la surface.

**Cylindre** : axe z, de `z = 0` à `z = hauteur`, centré sur `(0, 0)`.
La paroi est faite de **quadrilatères**, les deux bases de **triangles** en éventail autour d'un nœud central (les deux derniers nœuds de la liste : centre de la base basse, puis centre de la base haute).

**Orientation** : les sommets de chaque face sont ordonnés dans le sens trigonométrique vu de l'extérieur, donc les normales pointent vers l'extérieur (faces avant visibles avec le rendu par défaut de Three.js). Pour afficher un quadrilatère `[a, b, c, d]` avec des triangles : `(a, b, c)` et `(a, c, d)`.

## 5. Erreurs

Toute erreur renvoie le même format. Le champ `champ` indique le paramètre fautif (chemin avec des points) ; il est absent quand il n'y en a pas.

```json
{"erreur": {"code": "PARAMETRE_INVALIDE",
            "message": "« geometrie.longueur » doit être un nombre strictement positif.",
            "champ": "geometrie.longueur"}}
```

| Code | HTTP | Cause |
|---|---|---|
| `JSON_INVALIDE` | 400 | corps illisible, vide, ou qui n'est pas un objet JSON |
| `CHAMP_MANQUANT` | 400 | un champ obligatoire est absent |
| `PARAMETRE_INVALIDE` | 400 | valeur hors des plages autorisées, mauvais type, maillage invalide |
| `COMBINAISON_INVALIDE` | 400 | combinaison interdite (cylindre non encastré en z ; direction de cisaillement égale à l'axe d'encastrement) |
| `MATERIAU_INCONNU` | 404 | nom de matériau absent de la base |
| `ERREUR_HTTP` | 404 / 405 | route inconnue ou mauvaise méthode |
| `ERREUR_INTERNE` | 500 | bug côté serveur (à signaler à l'équipe backend) |

Le serveur s'arrête à la **première** erreur trouvée : corriger, renvoyer, et une éventuelle erreur suivante apparaîtra.

## 6. Exemple d'appel (JavaScript)

```js
const reponse = await fetch("http://127.0.0.1:5000/simulation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    geometrie: { type: "cylindre", rayon: 5, hauteur: 100 },
    materiau: { nom: "Aluminium" },
    sollicitation: "traction",
    charge: { valeur: 1000 },
    encastrement: { axe: "z", cote: "min" },
    maillage: { n_theta: 16, nz: 6 },
  }),
});
const donnees = await reponse.json();
if (!reponse.ok) {
  const { code, message, champ } = donnees.erreur;   // afficher message, surligner champ
} else {
  const { noeuds, faces, deplacements, resultats, verifications } = donnees;
}
```

## 7. Fichiers d'exemple

Le dossier `exemples/` contient de vraies requêtes et réponses du serveur (petits maillages, lisibles) : `requete_pave.json` / `reponse_pave.json`, `requete_cylindre.json` / `reponse_cylindre.json`, `requete_materiau_sans_limite.json` / `reponse_materiau_sans_limite.json`, `requete_erreur.json` / `reponse_erreur.json`, `reponse_materiaux.json`.

Ils sont générés par `python -m pytest test_backend.py` : relancer les tests les met à jour.
