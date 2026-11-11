import { create } from 'zustand'
import type { BoundaryConditions } from '../types/bc'
import type { Load } from '../types/load'
import type { Mesh } from '../types/mesh'
import type { Materiau } from '../types/material'
import type { GeometrySettings } from '../types/geometry'



export interface ModelStore {
    geometry: GeometrySettings | null
    boundary : BoundaryConditions | null
    load : Load | null
    mesh : Mesh | null
    materiau : Materiau | null
    setGeometry : (geometry: GeometrySettings) => void
    setMateriau : (materiau: Materiau) => void
    setBoundary : (boundary : BoundaryConditions) => void
    setLoad : (load : Load) => void
    setMesh: (mesh : Mesh) => void
    clean : () => void
}


export const useModel = create<ModelStore>((set) => ({
  geometry: null,
  materiau : null,
  boundary : null,
  load : null,
  mesh : null,
  setGeometry : (geometry) => set({geometry , mesh: null}),
  setMateriau : (materiau) => set({materiau}),
  setBoundary : (boundary) => set({boundary}),
  setLoad : (load) => set({load}),
  setMesh : (mesh) => set({mesh}),
  clean: ()=>set({geometry: null , boundary: null , load : null , mesh : null , materiau: null})
}))






// pour le moment quand on fixe sur une face on applique sur lautre