import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import { SimulationToolbar } from "./helpers";
import { useEffect, useState } from "react";
import { Meshed } from "./mesh/meshed";
import { useModel, type ModelStore } from "../../store/models";
import { NORMAL_COLOUR } from "../../store/core";
import api from "../../api";
import { Mesh } from "./mesh/Mesh";




export default function Viewport() {

  const currentModel = useModel((p) => p)


  return (
    // <SimulationToolbar />
    <Canvas camera={{ position: [5, 5, 5], up: [0, 0, 1] }}>
      <axesHelper />
      <color attach="background" args={['#181818']} />
      <ambientLight intensity={1} />
      {currentModel && <Mesh model={currentModel} />}
      <OrbitControls />
    </Canvas>
  )
}


