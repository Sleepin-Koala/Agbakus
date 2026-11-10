// 1. Définition des types de formes disponibles
export type GeometryType = 'pave' | 'cylindre';




// 2. Interface globale de configuration (Sert souvent pour les formulaires / inputs)
export interface GeometrySettings {
  type: GeometryType;
  longueur: number;   // cube / pavé
  hauteur: number;  // cube / cylindre
  largeur: number;   // cube / pavé
  rayon: number;  // cylindre / sphère
}

// 3. Spécifications strictes de chaque type de pièce (Part)
export interface CubePart {
  type: 'pave';
  longueur: number;
  hauteur: number;
  largeur: number;
}

export interface CylinderPart {
  type: 'cylindre';
  rayon: number;
  hauteur: number;
}


export const DEFAULT_GEOMETRY_SETTINGS: GeometrySettings = {
  type: "pave",
  longueur: 100,
  hauteur: 100,
  largeur: 100,
  rayon: 50,
};