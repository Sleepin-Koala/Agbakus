// 1. Définition des types de formes disponibles
export type GeometryType = 'pave' | 'cylindre';

// 2. Interface globale de configuration (Sert souvent pour les formulaires / inputs)
export interface GeometrySettings {
  type: GeometryType;
  width: number;   // cube / pavé
  height: number;  // cube / cylindre
  depth: number;   // cube / pavé
  radius: number;  // cylindre / sphère
}

// 3. Spécifications strictes de chaque type de pièce (Part)
export interface CubePart {
  type: 'pave';
  width: number;
  height: number;
  depth: number;
}

export interface CylinderPart {
  type: 'cylindre';
  radius: number;
  height: number;
}


export const DEFAULT_GEOMETRY_SETTINGS: GeometrySettings = {
  type: "pave",
  width: 100,
  height: 100,
  depth: 100,
  radius: 50,
};