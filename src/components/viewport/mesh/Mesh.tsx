import type { ModelStore } from "../../../store/models";
import { CubeSimple } from "./cube";
import { RawCylinderMesh } from "./Cylinder";
import { Meshed } from "./meshed";

// Facteur auto : le déplacement max amplifié vaut ~10 % de la taille du solide
function calculerFacteur(noeuds: number[][], deplacements: number[][]): number {
  let maxDepl = 0;
  for (const d of deplacements) maxDepl = Math.max(maxDepl, Math.hypot(d[0], d[1], d[2]));
  if (maxDepl === 0) return 1;

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const n of noeuds) {
    for (let c = 0; c < 3; c++) {
      min[c] = Math.min(min[c], n[c]);
      max[c] = Math.max(max[c], n[c]);
    }
  }
  const taille = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  return (0.1 * taille) / maxDepl;
}

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