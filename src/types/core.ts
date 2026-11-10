export type Vector3D = { x: number; y: number; z: number };


export const getOppositeFace = (normal: Vector3D): Vector3D => {
  return {
    x: normal.x === 0 ? 0 : -normal.x, // Le === 0 évite les -0 inutiles
    y: normal.y === 0 ? 0 : -normal.y,
    z: normal.z === 0 ? 0 : -normal.z,
  };
};