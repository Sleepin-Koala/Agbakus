const NORMAL_COLOR = '#808080'; 


export function RawCylinderMesh({ rayon, hauteur }: { rayon: number; hauteur: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
      <cylinderGeometry args={[rayon, rayon, hauteur, 32]} rotateX={Math.PI / 2}/>
      <meshStandardMaterial color={NORMAL_COLOR} />
    </mesh>
  );
}