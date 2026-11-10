import type { ModelStore } from "../../../store/models";
import {  CubeSimple } from "./cube";
import { RawCylinderMesh } from "./Cylinder";
import { Meshed } from "./meshed";


export function Mesh({ model }: { model: ModelStore }) {
  if (!model.geometry) return null;
  const { geometry, mesh } = model;
  if (mesh) {
    return <Meshed faces={mesh.faces} noeuds={mesh.noeuds} />;
  }
  switch (geometry.type){
    case 'pave':
      // ORDRE BACKEND : x = longueur, y = largeur, z = hauteur
      // (avant : hauteur et largeur étaient inversées sur Y et Z)
      return <CubeSimple X={geometry.longueur} Y={geometry.largeur} Z={geometry.hauteur} />;
    case 'cylindre':
      return <RawCylinderMesh rayon={geometry.rayon} hauteur={geometry.hauteur} />;
    default:
      return null;
  }
}
