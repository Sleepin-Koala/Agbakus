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
    console.log(event.face!.materialIndex)
  }

  return (
    <mesh onClick={(e) => model.setBoundary({type: "encastrement" , "target": e.face!.normal ,"appui": "face"})}
      onPointerMove={onPointerMoves} scale={0.01}>
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