import { create } from "zustand/react";
import type { MeshSettings } from "../types/mesh";

interface BC {
    isActive : boolean
    toogleActivation : ()=>void
    desactiver : ()=>void
}

export const SetSelectBoundaryConditions = create<BC>((set)=>({
    isActive : false,
    toogleActivation : () => set((c)=> ({isActive : !c.isActive})),
    desactiver : () => set({isActive : false})
}))


//---

interface InterMeshSettings {
    MeshSettings : MeshSettings | null
    setMeshSettings : (MeshSettings : MeshSettings)=>void
}

export const StoreMeshSettings = create<InterMeshSettings>((set)=>({
    MeshSettings : null,
    setMeshSettings : (MeshSettings : MeshSettings) => set({MeshSettings})
}))
 

