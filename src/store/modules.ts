import { create } from "zustand/react";

export interface Module {
  currentModule : currentModule
  setCurrentModule : (currentModule : currentModule) => void
}

type currentModule = "part" | "material" | "step" |"BC" |"Load" | "Mesh" | "Job" 

export const usetype = create<Module>((set)=>({
  currentModule : "part",
  setCurrentModule : (currentModule : currentModule)=> set({currentModule})
}));


