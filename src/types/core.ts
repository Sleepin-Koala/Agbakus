export type Vector3D = { x: number; y: number; z: number };


export const getOppositeFace = (normal: Vector3D): Vector3D => {
  return {
    x: normal.x === 0 ? 0 : -normal.x, // Le === 0 évite les -0 inutiles
    y: normal.y === 0 ? 0 : -normal.y,
    z: normal.z === 0 ? 0 : -normal.z,
  };
};


// ----------------------------------------------------------------------------
// Conversion "normale de face" -> encastrement au format du contrat backend.
//
// IMPORTANT : cette fonction suppose que la normale est exprimée dans le
// repère BACKEND. C'est automatiquement le cas pour toute face cliquée à
// l'intérieur du ModelRoot, tant qu'aucune rotation n'est appliquée sur le
// mesh lui-même (les rotations éventuelles doivent être dans la géométrie,
// pas sur le mesh — voir Cylinder.tsx).
// ----------------------------------------------------------------------------

export type Axe = "x" | "y" | "z";
export type Cote = "min" | "max";

export interface Encastrement {
  axe: Axe;
  cote: Cote;
}

export function normalVersEncastrement(normal: Vector3D): Encastrement {
  // Valeur absolue pour comparer : une normale vaut toujours exactement
  // 1 ou -1 sur un seul axe pour les faces du pavé et du cylindre.
  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);

  if (ax >= ay && ax >= az) return { axe: "x", cote: normal.x > 0 ? "max" : "min" };
  if (ay >= az)             return { axe: "y", cote: normal.y > 0 ? "max" : "min" };
  return                          { axe: "z", cote: normal.z > 0 ? "max" : "min" };
}
