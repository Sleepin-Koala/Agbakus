import { create } from 'zustand'
import type { BoundaryConditions } from '../types/bc'
import type { Load } from '../types/load'
import type { Mesh } from '../types/mesh'
import type { Materiau } from '../types/material'
import type { GeometrySettings } from '../types/geometry'
import type { ReponseSimulation } from '../hooks/useCalculs'



export interface ModelStore {
    geometry: GeometrySettings | null
    boundary : BoundaryConditions | null
    load : Load | null
    mesh : Mesh | null
    materiau : Materiau | null
    result : ReponseSimulation | null
    setGeometry : (geometry: GeometrySettings) => void
    setMateriau : (materiau: Materiau) => void
    setBoundary : (boundary : BoundaryConditions) => void
    setLoad : (load : Load) => void
    setMesh: (mesh : Mesh) => void
    setResult: (result : ReponseSimulation) => void
    clean : () => void
}


export const useModel = create<ModelStore>((set) => ({
  geometry: null,
  materiau : null,
  boundary : null,
  load : null,
  mesh : null,
  result : null,
  setGeometry : (geometry) => set({geometry , mesh: null,result: null}),
  setMateriau : (materiau) => set({materiau ,result: null }),
  setBoundary : (boundary) => set({boundary,result: null}),
  setLoad : (load) => set({load,result: null}),
  setMesh : (mesh) => set({mesh,result: null}),
  setResult : (result) => set({result}),
  clean: ()=>set({geometry: null , boundary: null , load : null , mesh : null ,result: null , materiau: null})
}))
