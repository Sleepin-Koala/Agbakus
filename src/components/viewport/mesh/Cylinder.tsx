const NORMAL_COLOR = '#808080'; 


export function RawCylinderMesh({ rayon, hauteur }: { rayon: number; hauteur: number }) {
  return (

    <mesh position={[0, 0, hauteur / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[rayon, rayon, hauteur, 32]} />
      <meshStandardMaterial color={NORMAL_COLOR} />
    </mesh>
  );
}


    // Le cylindre three.js est construit aligné sur Y ; on tourne la
    // GÉOMÉTRIE de PI/2 pour aligner son axe sur le z BACKEND.
    // Plus AUCUNE rotation sur le mesh (avant il y en avait deux, qui se
    // composaient en PI et rendaient le cylindre à l'envers).
    // La géométrie reste centrée sur sa hauteur, donc on la translate de
    // hauteur/2 : le backend veut la base centrée à l'origine, z de 0 à hauteur.