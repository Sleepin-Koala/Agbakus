import type { ModelStore } from "../../../store/models";
import { CubeSimple } from "./cube";
import { RawCylinderMesh } from "./Cylinder";
import { Meshed } from "./meshed";

export function Mesh({ model }: { model: ModelStore }) {
  const { geometry, mesh } = model;

  if (!geometry) return null;                 // rien à afficher
  if (mesh) return <Meshed faces={mesh.faces} noeuds={mesh.noeuds} />;  // le maillage prime sur l'aperçu brut

  switch (geometry.type) {
    case 'pave':
      return <CubeSimple X={geometry.longueur} Y={geometry.largeur} Z={geometry.hauteur} />;
    case 'cylindre':
      return <RawCylinderMesh rayon={geometry.rayon} hauteur={geometry.hauteur} />;
    default:
      return null;
  }
}