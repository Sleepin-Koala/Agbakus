const NORMAL_COLOR = '#808080'; 


export function RawCylinderMesh({ radius, height }: { radius: number; height: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
      <cylinderGeometry args={[radius, radius, height, 32]} rotateX={Math.PI / 2}/>
      <meshStandardMaterial color={NORMAL_COLOR} />
    </mesh>
  );
}