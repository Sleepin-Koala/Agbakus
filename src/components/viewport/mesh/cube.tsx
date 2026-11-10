import { useState } from "react";
import type { CubePart } from "../../../types/geometry";
import { useModel } from "../../../store/models";
import { NORMAL_COLOUR } from "../../../store/core";
import { SetSelectBoundaryConditions } from "../../../store/states";
import type { ThreeEvent } from "@react-three/fiber";



export function CubeSimple({ X , Y , Z }: { X : number , Y : number ,Z: number}) {
  const [hoveredFace, setHoveredFace] = useState<number|null>(null);
  

  const model = useModel((p)=>p)
  const BoundaryConditionState = SetSelectBoundaryConditions((p)=>p)


  function onPointerMoves(event: ThreeEvent<PointerEvent>){
    setHoveredFace(event.face!.materialIndex)
  }

  return (
    // X, Y, Z = coordonnées BACKEND (longueur, largeur, hauteur), en mm.
    // Plus de scale ici : l'échelle vit dans ModelRoot.
    // Le mesh est décalé de la moitié car three.js CENTRE la boxGeometry,
    // alors que le backend place un sommet à l'origine (x,y,z de 0 à dim).
    // Aucune rotation sur ce mesh : e.face.normal est donc déjà exprimée
    // dans le repère backend (utilisable directement pour l'encastrement).
    <mesh
      position={[X / 2, Y / 2, Z / 2]} //origine
      onClick={(e) => model.setBoundary({type: "encastrement" , "target": e.face!.normal ,"appui": "face"})}
      onPointerMove={onPointerMoves}>
      <boxGeometry args={[X, Y, Z]} />

      {[0, 1, 2, 3, 4, 5].map((index) => (
        
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          color={(BoundaryConditionState.isActive && index == hoveredFace) ? "#37568c" : NORMAL_COLOUR}
        />
      ))}
    </mesh>
  )
}
