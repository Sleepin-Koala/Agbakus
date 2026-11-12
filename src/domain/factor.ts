export function calculerFacteur(noeuds: number[][], deplacements: number[][]): number {
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