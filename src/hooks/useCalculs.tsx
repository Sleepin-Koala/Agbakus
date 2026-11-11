import { useCallback, useState } from "react";
import api from "../api";
import type { Materiau } from "../types/material";
import type { MeshSettings } from "../types/mesh";
import type { GeometrySettings } from "../types/geometry";

// ============================================================================
// TYPES D'ÉCHANGE (Basés sur le "Contrat d'échange Backend – Frontend")
// ============================================================================


export interface RequeteMaillage {
  geometrie: GeometrySettings;
  maillage?: MeshSettings;
}

export interface RequeteSimulation extends RequeteMaillage {
  materiau: Partial<Materiau> & { nom: string }; // Seul "nom" est obligatoire si c'est un matériau connu
  sollicitation: "traction" | "compression" | "cisaillement";

  charge: {
    valeur: number;
    direction?: "x" | "y" | "z";
  };

  encastrement: {
    axe: "x" | "y" | "z";
    cote: "min" | "max";
  };
}

export interface ReponseMaillage {
  noeuds: [number, number, number][];
  faces: number[][];
  nb_noeuds: number;
  nb_faces: number;
}

export interface ReponseSimulation extends ReponseMaillage {
  deplacements: [number, number, number][];
  resultats: {
    section: number;
    contrainte: number;
    deformation: number;
    allongement: number;
  };
  verifications: {
    domaine_elastique: boolean;
    coefficient_securite: number;
  };
  temps_calcul_ms: number;
}

export interface ErreurAPI {
  code: string;
  champ?: string;
  message: string;
}

// ============================================================================
// HOOK
// ============================================================================

export default function useCalculs() {
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [erreur, setErreur] = useState<ErreurAPI | null>(null);


  // 1. GET /materiaux
const getMateriaux = useCallback(async () => {
    setIsLoading(true)
    const data = await api.get<Record<"materiaux" , Materiau[]>>("/materiaux");
    
    setIsLoading(false)
    
    setMateriaux(data["materiaux"]);
    return data["materiaux"];
  }, []);




  // 2. POST /maillage
  const genererMaillage = useCallback(async (payload: RequeteMaillage) => {
    return await api.post<ReponseMaillage>("/maillage",   {...payload})
  }, []);

  // 3. POST /simulation
  const lancerSimulation = useCallback(async (payload: RequeteSimulation) => {
    return await api.post<ReponseSimulation>("/simulation", {...payload});
  }, []);

  const resetErreur = () => setErreur(null);

  return {
    materiaux,
    isLoading,
    // erreur,
    getMateriaux,
    genererMaillage,
    lancerSimulation,
    resetErreur,
  };
}