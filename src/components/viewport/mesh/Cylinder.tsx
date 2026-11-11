import { useEffect, useMemo, useState } from "react";
import { CylinderGeometry } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useModel } from "../../../store/models";
import { SetSelectBoundaryConditions } from "../../../store/states";
import { normalVersEncastrement } from "../../../types/core";
import { NORMAL_COLOUR } from "../../../store/core";

// Les 3 "groupes" de faces d'un CylinderGeometry de three.js
const FACE_COTE = 0; // surface latérale
const FACE_HAUT = 1; // disque z = hauteur
const FACE_BAS = 2;  // disque z = 0

export function RawCylinderMesh({ rayon, hauteur }: { rayon: number; hauteur: number }) {
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  const boundary = useModel((p) => p.boundary);
  const setBoundary = useModel((p) => p.setBoundary);
  const selection = SetSelectBoundaryConditions((p) => p);

  // Géométrie alignée sur le z BACKEND : on tourne la GÉOMÉTRIE, pas le mesh
  const geometrie = useMemo(() => {
    const g = new CylinderGeometry(rayon, rayon, hauteur, 32);
    g.rotateX(Math.PI / 2);      // axe Y -> axe Z
    g.translate(0, 0, hauteur / 2); // base à z = 0
    return g;
  }, [rayon, hauteur]);

  useEffect(() => () => geometrie.dispose(), [geometrie]);

  // Face sélectionnée DÉDUITE du store (une seule source de vérité)
  const enc = boundary ? normalVersEncastrement(boundary.target) : null;
  const selectedFace =
    enc && enc.axe === "z" ? (enc.cote === "max" ? FACE_HAUT : FACE_BAS) : null;

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (!selection.isActive || !e.face) return;

    const index = e.face.materialIndex;
    if (index === FACE_COTE) return; // le contrat n'accepte que l'axe z pour un cylindre

    setBoundary({
      type: "encastrement",
      appui: "face",
      target: { x: 0, y: 0, z: index === FACE_HAUT ? 1 : -1 },
    });
    selection.toogleActivation();
    setHoveredFace(null);
  }

  function handleMove(e: ThreeEvent<PointerEvent>) {
    const index = e.face?.materialIndex ?? null;
    setHoveredFace(index === FACE_COTE ? null : index);
  }

  const getFaceColor = (index: number) => {
    if (selection.isActive && index === hoveredFace) return "#37568c";
    if (index === selectedFace) return "#FFCCCB";
    return NORMAL_COLOUR;
  };

  return (
    <mesh
      geometry={geometrie}
      onClick={handleClick}
      onPointerMove={handleMove}
      onPointerOut={() => setHoveredFace(null)}
    >
      {[0, 1, 2].map((index) => (
        <meshStandardMaterial key={index} attach={`material-${index}`} color={getFaceColor(index)} />
      ))}
    </mesh>
  );
}