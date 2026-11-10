import { create } from "zustand/react";



interface BC {
    isActive : boolean
    toogleActivation : ()=>void


}


export const SetSelectBoundaryConditions = create<BC>((set)=>({
    isActive : false,
    toogleActivation : () => set((c)=> ({isActive : !c.isActive}))
}))