import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import { useModel } from "../../store/models";
import { Mesh } from "./mesh/Mesh";
import { ModelRoot } from "./ModelRoot.tsx";
import { AxesModele } from "./axesHelper.tsx";




export default function Viewport() {

  const currentModel = useModel((p) => p)


  const g = currentModel.geometry;
  const taille = !g
    ? 100
    : (g.type === "pave" ? Math.max(g.longueur, g.largeur, g.hauteur) : Math.max(2 * g.rayon, g.hauteur)) * 1.3;

  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      {/* Repère monde et sol : THREE.JS (Y-up), donc À L'EXTÉRIEUR du ModelRoot */}

      <gridHelper args={[8, 40]} />
      <color attach="background" args={['#181818']} />
      <ambientLight intensity={1} />
      {/* Tout le modèle passe par le ModelRoot : Z-up/mm -> Y-up/m en UN SEUL endroit */}
      <ModelRoot>
        {currentModel && <Mesh model={currentModel} />}
        <AxesModele taille={taille} />
      </ModelRoot>

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#ff3653", "#2c8fdf", "#0adb50"]}
          labels={["X", "Z", "−Y"]}
          hideNegativeAxes
        />
      </GizmoHelper>


      <OrbitControls />
    </Canvas>
  )
}
