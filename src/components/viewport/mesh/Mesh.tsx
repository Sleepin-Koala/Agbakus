import type { ModelStore } from "../../../store/models";
import {  CubeSimple } from "./cube";
import { RawCylinderMesh } from "./Cylinder";
import { Meshed } from "./meshed";

const NORMAL_COLOR = '#808080'; 



export function Mesh({ model }: { model: ModelStore }) {
  if (!model.geometry) return null;
  const { geometry, mesh } = model;
  if (mesh) {
    return <Meshed faces={mesh.faces} noeuds={mesh.noeuds} />;
  }
  switch (geometry.type){
    case 'pave':
      return <CubeSimple X={geometry.longueur} Y={geometry.depth} Z = {geometry.largeur} />;
    case 'cylindre':
      return <RawCylinderMesh radius={geometry.radius} hauteur={geometry.largeur} />;
    default:
      return null;
  }
}
