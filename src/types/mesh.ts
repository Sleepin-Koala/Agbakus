

export interface Mesh {
    noeuds: number[][]   // [[x,y,z], ...]
    faces: number[][]    // [[a,b,c,d], [a,b,c], ...]
}




export interface MeshSettings {
  nx?: number;
  ny?: number;
  nz?: number;
  n_theta?: number;
  n_z?: number;
}