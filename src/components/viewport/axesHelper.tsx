import { GizmoHelper, GizmoViewport, Html, OrbitControls } from "@react-three/drei";

export function AxesModele({ taille }: { taille: number }) {
  return (
    <group>
      <axesHelper args={[taille]} />
      <Html position={[taille, 0, 0]} center>
        <span className="pointer-events-none select-none font-mono text-sm font-bold text-red-400">X</span>
      </Html>
      <Html position={[0, taille, 0]} center>
        <span className="pointer-events-none select-none font-mono text-sm font-bold text-green-400">Y</span>
      </Html>
      <Html position={[0, 0, taille]} center>
        <span className="pointer-events-none select-none font-mono text-sm font-bold text-blue-400">Z</span>
      </Html>
    </group>
  );
}