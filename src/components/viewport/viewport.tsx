import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import { useModel } from "../../store/models";
import { Mesh } from "./mesh/Mesh";
import { ModelRoot } from "./ModelRoot.tsx";




export default function Viewport() {

  const currentModel = useModel((p) => p)


  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      {/* Repère monde et sol : THREE.JS (Y-up), donc À L'EXTÉRIEUR du ModelRoot */}
      <axesHelper args={[1]} />
      <gridHelper args={[4, 40]} />
      <color attach="background" args={['#181818']} />
      <ambientLight intensity={1} />
      {/* Tout le modèle passe par le ModelRoot : Z-up/mm -> Y-up/m en UN SEUL endroit */}
      <ModelRoot>
        {currentModel && <Mesh model={currentModel} />}
      </ModelRoot>
      <OrbitControls />
    </Canvas>
  )
}
