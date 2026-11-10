// =====================================================================
// handlers.ts : simule le backend décrit dans le "Contrat d'échange"
// =====================================================================
// Un "handler" = une règle : "quand le front appelle CETTE route avec
// CETTE méthode, réponds ça". Il y en a un par route du contrat.
// 
// Ce n'est PAS le vrai calcul du backend : c'est une version simplifiée
// (barre uniforme en élasticité linéaire) qui respecte exactement le
// FORMAT du contrat. Le but : que ton front reçoive des données
// réalistes et de la bonne forme.
// =====================================================================

import { http, HttpResponse, delay } from "msw";

// Doit être la même URL que celle que ton front appellera pour le vrai backend.
const API = "http://localhost:8000";

// ---------------------------------------------------------------------
// 1. TYPES (ils reprennent mot pour mot les champs du contrat)
// ---------------------------------------------------------------------
type Vec3 = [number, number, number];
type Axe = "x" | "y" | "z";

interface Materiau {
  nom: string;
  masse_volumique: number; // kg/m³
  module_young: number; // MPa
  coefficient_poisson: number;
  limite_elastique: number; // MPa
}

// ---------------------------------------------------------------------
// 2. BASE DE MATÉRIAUX (route GET /materiaux)
// ---------------------------------------------------------------------
// E vient de ton notebook (en GPa) multiplié par 1000 -> MPa, comme le
// veut le contrat. ATTENTION : les limites élastiques sont des valeurs
// APPROXIMATIVES que j'ai mises pour le mock. Le backend aura les vraies.
const MATERIAUX: Materiau[] = [
  { nom: "Acier", masse_volumique: 7850, module_young: 210000, coefficient_poisson: 0.3, limite_elastique: 235 },
  { nom: "Aluminium", masse_volumique: 2700, module_young: 69000, coefficient_poisson: 0.346, limite_elastique: 95 },
  { nom: "Béton", masse_volumique: 2500, module_young: 50000, coefficient_poisson: 0.2, limite_elastique: 30 },
  { nom: "Cuivre", masse_volumique: 8920, module_young: 124000, coefficient_poisson: 0.33, limite_elastique: 70 },
  { nom: "Titane", masse_volumique: 4500, module_young: 114000, coefficient_poisson: 0.34, limite_elastique: 275 },
  { nom: "Verre", masse_volumique: 2320, module_young: 69000, coefficient_poisson: 0.3, limite_elastique: 50 },
].sort((a, b) => a.nom.localeCompare(b.nom)); // le contrat dit : trié alphabétiquement

// ---------------------------------------------------------------------
// 3. ERREURS : une seule forme, comme dans la section 6 du contrat
// ---------------------------------------------------------------------
// On "lance" cette erreur n'importe où dans la validation ; le handler
// l'attrape et la transforme en réponse HTTP. Ça reproduit la règle
// "le backend s'arrête à la première erreur".
class ApiError extends Error {
  
  
  public status : number
  public code : string
  public champ : string | undefined
  
  constructor(status: number,code: string,message: string,champ?: string) {
    super(message);
    this.status = status
    this.code = code
    this.champ = champ
  }
}

function reponseErreur(e: ApiError) {
  return HttpResponse.json(
    { erreur: { code: e.code, ...(e.champ ? { champ: e.champ } : {}), message: e.message } },
    { status: e.status },
  );
}

// ---------------------------------------------------------------------
// 4. VALIDATION (rôle "Backend : vérifier la validité de tous les champs")
// ---------------------------------------------------------------------
function positif(valeur: unknown, champ: string): number {
  if (valeur === undefined || valeur === null)
    throw new ApiError(400, "CHAMP_MANQUANT", `Le champ ${champ} est obligatoire.`, champ);
  if (typeof valeur !== "number" || !(valeur > 0))
    throw new ApiError(400, "PARAMETRE_INVALIDE", `${champ} doit être un nombre strictement positif.`, champ);
  return valeur;
}

function entierMin(valeur: unknown, min: number, champ: string): number {
  if (!Number.isInteger(valeur) || (valeur as number) < min)
    throw new ApiError(400, "PARAMETRE_INVALIDE", `${champ} doit être un entier ≥ ${min}.`, champ);
  return valeur as number;
}

// Lit et vérifie le bloc "geometrie" + "maillage" (communs à /maillage et /simulation)
function lireGeometrie(body: any) {
  console.log(body)
  const g = body?.geometrie;
  if (!g) throw new ApiError(400, "CHAMP_MANQUANT", "Le champ geometrie est obligatoire.", "geometrie");

  const m = body.maillage ?? {}; // maillage facultatif -> valeurs par défaut du contrat

  if (g.type === "pave") {
    return {
      type: "pave" as const,
      longueur: positif(g.longueur, "geometrie.longueur"),
      largeur: positif(g.largeur, "geometrie.largeur"),
      hauteur: positif(g.hauteur, "geometrie.hauteur"),
      nx: entierMin(m.nx ?? 12, 1, "maillage.nx"),
      ny: entierMin(m.ny ?? 12, 1, "maillage.ny"),
      nz: entierMin(m.nz ?? 12, 1, "maillage.nz"),
    };
  }
  if (g.type === "cylindre") {
    return {
      type: "cylindre" as const,
      rayon: positif(g.rayon, "geometrie.rayon"),
      hauteur: positif(g.hauteur, "geometrie.hauteur"),
      n_theta: entierMin(m.n_theta ?? 20, 3, "maillage.n_theta"),
      n_z: entierMin(m.n_z ?? 10, 1, "maillage.n_z"),
    };
  }
  throw new ApiError(400, "PARAMETRE_INVALIDE", 'geometrie.type doit valoir "pave" ou "cylindre".', "geometrie.type");
}
type Geometrie = ReturnType<typeof lireGeometrie>;

// ---------------------------------------------------------------------
// 5. MAILLAGE : génère `noeuds` et `faces` (surface extérieure seulement)
// ---------------------------------------------------------------------
function mailler(g: Geometrie): { noeuds: Vec3[]; faces: number[][] } {
  const noeuds: Vec3[] = [];
  const faces: number[][] = [];

  if (g.type === "pave") {
    const { nx, ny, nz, longueur, largeur, hauteur } = g;

    // Nœuds : trois boucles imbriquées, x varie le plus vite.
    // Donc le nœud (i, j, k) a pour numéro  i + j*(nx+1) + k*(nx+1)*(ny+1).
    for (let k = 0; k <= nz; k++)
      for (let j = 0; j <= ny; j++)
        for (let i = 0; i <= nx; i++)
          noeuds.push([(i * longueur) / nx, (j * largeur) / ny, (k * hauteur) / nz]);

    const id = (i: number, j: number, k: number) => i + j * (nx + 1) + k * (nx + 1) * (ny + 1);

    // Faces : on ne garde que les 6 côtés du pavé. Chaque quad est donné
    // "en tournant" autour de la face (n1 -> n2 -> n3 -> n4).
    for (let k = 0; k < nz; k++)
      for (let i = 0; i < nx; i++) {
        faces.push([id(i, 0, k), id(i + 1, 0, k), id(i + 1, 0, k + 1), id(i, 0, k + 1)]); // y = 0
        faces.push([id(i, ny, k), id(i + 1, ny, k), id(i + 1, ny, k + 1), id(i, ny, k + 1)]); // y = largeur
      }
    for (let k = 0; k < nz; k++)
      for (let j = 0; j < ny; j++) {
        faces.push([id(0, j, k), id(0, j + 1, k), id(0, j + 1, k + 1), id(0, j, k + 1)]); // x = 0
        faces.push([id(nx, j, k), id(nx, j + 1, k), id(nx, j + 1, k + 1), id(nx, j, k + 1)]); // x = longueur
      }
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        faces.push([id(i, j, 0), id(i + 1, j, 0), id(i + 1, j + 1, 0), id(i, j + 1, 0)]); // z = 0
        faces.push([id(i, j, nz), id(i + 1, j, nz), id(i + 1, j + 1, nz), id(i, j + 1, nz)]); // z = hauteur
      }
  } else {
    const { n_theta, n_z, rayon, hauteur } = g;

    // Nœuds de la surface latérale : "anneaux" empilés selon z.
    // Le nœud (i, k) a pour numéro  k*n_theta + i.
    for (let k = 0; k <= n_z; k++)
      for (let i = 0; i < n_theta; i++) {
        const theta = (2 * Math.PI * i) / n_theta;
        noeuds.push([rayon * Math.cos(theta), rayon * Math.sin(theta), (k * hauteur) / n_z]);
      }

    // Deux nœuds de plus : le centre du disque du bas et celui du haut.
    const centreBas = noeuds.length;
    noeuds.push([0, 0, 0]);
    const centreHaut = noeuds.length;
    noeuds.push([0, 0, hauteur]);

    // Côté : des quadrilatères (4 indices)
    for (let k = 0; k < n_z; k++)
      for (let i = 0; i < n_theta; i++) {
        const i2 = (i + 1) % n_theta; // le dernier se reboucle sur le premier
        faces.push([k * n_theta + i, k * n_theta + i2, (k + 1) * n_theta + i2, (k + 1) * n_theta + i]);
      }

    // Disques : des triangles (3 indices) centre -> deux points du bord
    for (let i = 0; i < n_theta; i++) {
      const i2 = (i + 1) % n_theta;
      faces.push([centreBas, i, i2]);
      faces.push([centreHaut, n_z * n_theta + i2, n_z * n_theta + i]);
    }
  }
  return { noeuds, faces };
}

// ---------------------------------------------------------------------
// 6. CALCUL MÉCANIQUE SIMPLIFIÉ (barre uniforme, élasticité linéaire)
// ---------------------------------------------------------------------
const INDEX: Record<Axe, number> = { x: 0, y: 1, z: 2 };

function simuler(body: any) {
  const t0 = performance.now();

  // --- Lecture de tout ce que le contrat impose
  const g = lireGeometrie(body);
  const mat = lireMateriau(body.materiau);

  const sollicitation = body.sollicitation;
  if (!sollicitation) throw new ApiError(400, "CHAMP_MANQUANT", "Le champ sollicitation est obligatoire.", "sollicitation");
  if (!["traction", "compression", "cisaillement"].includes(sollicitation))
    throw new ApiError(400, "PARAMETRE_INVALIDE", "Sollicitation inconnue.", "sollicitation");

  const F = positif(body.charge?.valeur, "charge.valeur");

  const enc = body.encastrement;
  if (!enc) throw new ApiError(400, "CHAMP_MANQUANT", "Le champ encastrement est obligatoire.", "encastrement");
  if (!["x", "y", "z"].includes(enc.axe))
    throw new ApiError(400, "PARAMETRE_INVALIDE", 'encastrement.axe doit valoir "x", "y" ou "z".', "encastrement.axe");
  if (!["min", "max"].includes(enc.cote))
    throw new ApiError(400, "PARAMETRE_INVALIDE", 'encastrement.cote doit valoir "min" ou "max".', "encastrement.cote");

  // Règles de COMBINAISON (valides séparément, invalides ensemble)
  if (g.type === "cylindre" && enc.axe !== "z")
    throw new ApiError(400, "COMBINAISON_INVALIDE", "Un cylindre ne peut être encastré que selon z.", "encastrement.axe");

  let direction: Axe | null = null;
  if (sollicitation === "cisaillement") {
    direction = body.charge?.direction;
    if (!direction) throw new ApiError(400, "CHAMP_MANQUANT", "charge.direction est obligatoire en cisaillement.", "charge.direction");
    if (!["x", "y", "z"].includes(direction))
      throw new ApiError(400, "PARAMETRE_INVALIDE", 'charge.direction doit valoir "x", "y" ou "z".', "charge.direction");
    if (direction === enc.axe)
      throw new ApiError(400, "COMBINAISON_INVALIDE", "La direction de cisaillement doit différer de l'axe d'encastrement.", "charge.direction");
  }
  // (en traction/compression, une direction envoyée par erreur est simplement ignorée)

  // --- Maillage
  const { noeuds, faces } = mailler(g);
  const a = INDEX[enc.axe as Axe]; // indice de l'axe d'encastrement dans [x,y,z]

  // --- Dimensions du solide selon l'axe d'encastrement
  const coordsAxe = noeuds.map((n) => n[a]);
  const xMin = Math.min(...coordsAxe);
  const xMax = Math.max(...coordsAxe);
  const L = xMax - xMin; // longueur de la "barre" dans le sens de l'effort
  const xFixe = enc.cote === "min" ? xMin : xMax; // position de la face encastrée

  // --- Section : aire de la face PERPENDICULAIRE à l'axe d'encastrement
  let section: number;
  if (g.type === "cylindre") section = Math.PI * g.rayon ** 2;
  else if (enc.axe === "x") section = g.largeur * g.hauteur;
  else if (enc.axe === "y") section = g.longueur * g.hauteur;
  else section = g.longueur * g.largeur;

  // --- Contrainte, déformation, allongement
  // contrainte = F / S (MPa car F en N et S en mm²)
  const signe = sollicitation === "compression" ? -1 : 1;
  const contrainte = (signe * F) / section;

  let deformation: number; // ε (traction/compression) ou γ (cisaillement)
  if (sollicitation === "cisaillement") {
    const G = mat.module_young / (2 * (1 + mat.coefficient_poisson)); // module de cisaillement
    deformation = contrainte / G; // γ = τ / G
  } else {
    deformation = contrainte / mat.module_young; // ε = σ / E (loi de Hooke)
  }
  const allongement = deformation * L; // ΔL (ou déplacement latéral en cisaillement)

  // --- Déplacements de chaque nœud (réels, NON amplifiés)
  // Centre du solide, pour la contraction latérale (effet Poisson)
  const centre: Vec3 = [0, 1, 2].map((d) => {
    const v = noeuds.map((n) => n[d]);
    return (Math.min(...v) + Math.max(...v)) / 2;
  }) as Vec3;

  const deplacements: Vec3[] = noeuds.map((n) => {
    const u: Vec3 = [0, 0, 0];
    const dist = n[a] - xFixe; // distance (signée) à la face encastrée

    if (sollicitation === "cisaillement") {
      // La face encastrée ne bouge pas ; plus on s'en éloigne, plus le
      // nœud glisse dans la direction de la charge.
      u[INDEX[direction!]] = deformation * Math.abs(dist);
    } else {
      // Axe de la charge : u = ε × distance à la face fixe
      u[a] = deformation * dist;
      // Axes transverses : le solide se contracte (traction) ou gonfle (compression)
      for (let d = 0; d < 3; d++) if (d !== a) u[d] = -mat.coefficient_poisson * deformation * (n[d] - centre[d]);
    }
    return u;
  });

  // --- Vérifications
  const verifications = {
    domaine_elastique: Math.abs(contrainte) <= mat.limite_elastique,
    coefficient_securite: mat.limite_elastique / Math.abs(contrainte),
  };

  return {
    noeuds,
    faces,
    deplacements,
    resultats: { section, contrainte, deformation, allongement },
    verifications,
    temps_calcul_ms: Math.round(performance.now() - t0),
  };
}

// Matériau : soit un nom de la base, soit "Autre" avec les 4 caractéristiques
function lireMateriau(m: any): Materiau {
  if (!m?.nom) throw new ApiError(400, "CHAMP_MANQUANT", "Le champ materiau.nom est obligatoire.", "materiau.nom");

  if (m.nom === "Autre") {
    const nu = m.coefficient_poisson;
    if (typeof nu !== "number" || !(nu > 0 && nu < 0.5))
      throw new ApiError(400, "PARAMETRE_INVALIDE", "Le coefficient de Poisson doit être strictement entre 0 et 0,5.", "materiau.coefficient_poisson");
    return {
      nom: "Autre",
      module_young: positif(m.module_young, "materiau.module_young"),
      masse_volumique: positif(m.masse_volumique, "materiau.masse_volumique"),
      limite_elastique: positif(m.limite_elastique, "materiau.limite_elastique"),
      coefficient_poisson: nu,
    };
  }

  const trouve = MATERIAUX.find((x) => x.nom === m.nom);
  if (!trouve) throw new ApiError(404, "MATERIAU_INCONNU", `Le matériau « ${m.nom} » n'existe pas.`, "materiau.nom");
  return trouve;
}

// ---------------------------------------------------------------------
// 7. LES HANDLERS : relient les routes aux fonctions ci-dessus
// ---------------------------------------------------------------------
// Pour les POST, on lit le corps JSON. S'il est illisible -> JSON_INVALIDE.
async function lireCorps(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "JSON_INVALIDE", "Le corps de la requête n'est pas du JSON lisible.");
  }
}

export const handlers = [
  // GET /materiaux : aucun corps, on renvoie la liste
  http.get(`${API}/materiaux`, async () => {
    await delay(150); // simule un temps réseau, pour tester tes états "loading"
    return HttpResponse.json({ materiaux: MATERIAUX });
  }),

  // POST /maillage : maillage seul, sans mécanique
  http.post(`${API}/maillage`, async ({ request }) => {
    try {
      const body = await lireCorps(request);
      const g = lireGeometrie(body);
      const { noeuds, faces } = mailler(g);
      await delay(150);
      return HttpResponse.json({ noeuds, faces, nb_noeuds: noeuds.length, nb_faces: faces.length });
    } catch (e) {
      if (e instanceof ApiError) return reponseErreur(e);
      return reponseErreur(new ApiError(500, "ERREUR_INTERNE", "Erreur interne du serveur."));
    }
  }),

  // POST /simulation : maillage + déplacements + résultats
  http.post(`${API}/simulation`, async ({ request }) => {
    try {
      const body = await lireCorps(request);
      const resultat = simuler(body);
      await delay(300);
      return HttpResponse.json(resultat);
    } catch (e) {
      if (e instanceof ApiError) return reponseErreur(e);
      return reponseErreur(new ApiError(500, "ERREUR_INTERNE", "Erreur interne du serveur."));
    }
  }),
];
