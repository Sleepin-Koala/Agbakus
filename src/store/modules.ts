import { create } from "zustand/react";

export interface Module {
  currentWorkState : WorkState
  SetCurrentWorkState : (currentModule : WorkState) => void
}



export type WorkState = "geometry" | "material" | "support" |"mesh" | "job" | "job" 

export const useWorkState = create<Module>((set)=>({
  currentWorkState : "geometry",
  SetCurrentWorkState : (currentWorkState : WorkState)=> set({currentWorkState})
}));


