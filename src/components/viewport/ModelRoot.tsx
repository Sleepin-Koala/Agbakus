import type { ReactNode } from "react";

/**
 * ModelRoot — POINT UNIQUE de conversion de repère.
 *
 * À l'intérieur de ce groupe  : coordonnées BACKEND (Z-up, mm), telles que
 *                              dans le contrat d'échange.
 * À l'extérieur de ce groupe   : coordonnées THREE.JS (Y-up, m).
 *
 * - rotation -PI/2 sur X : le "z up" du backend devient le "y up" de three.js
 *   (le modèle se dresse), le y backend devient le -z three.
 * - scale 0.01           : les millimètres du backend deviennent des mètres.
 *
 * RÈGLE D'OR : ne JAMAIS convertir les axes ailleurs dans le code.
 * Les noeuds, déplacements et normales reçus du backend s'utilisent
 * TELS QUELS à l'intérieur de ce groupe.
 */
export function ModelRoot({ children }: { children: ReactNode }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={0.01}>
      {children}
    </group>
  );
}
