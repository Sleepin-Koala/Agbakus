import { calculerFacteur } from "../../../domain/factor";
import type { ModelStore } from "../../../store/models";
import { CubeSimple } from "./cube";
import { RawCylinderMesh } from "./Cylinder";
import { Meshed } from "./meshed";

// Facteur auto : le déplacement max amplifié vaut ~10 % de la taille du solide


export function Mesh({ model }: { model: ModelStore }) {
  const { geometry, mesh, result } = model;

  if (!geometry) return null;

  // Priorité 1 : résultat de simulation (noeuds, faces, deplacements cohérents entre eux)
  if (result) {
    return (
      <Meshed
        faces={result.faces}
        noeuds={result.noeuds}
        deplacements={result.deplacements}
        facteur={calculerFacteur(result.noeuds, result.deplacements)}
      />
    );
  }

  // Priorité 2 : maillage seul
  if (mesh) return <Meshed faces={mesh.faces} noeuds={mesh.noeuds} />;

  // Priorité 3 : aperçu brut
  switch (geometry.type) {
    case 'pave':
      return <CubeSimple X={geometry.longueur} Y={geometry.largeur} Z={geometry.hauteur} />;
    case 'cylindre':
      return <RawCylinderMesh rayon={geometry.rayon} hauteur={geometry.hauteur} />;
    default:
      return null;
  }
}