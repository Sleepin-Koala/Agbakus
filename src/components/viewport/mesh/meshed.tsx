import { Point } from "@react-three/drei";
import { useMemo } from "react";
import { DoubleSide } from "three"
import type { Mesh } from "../../../types/mesh";





export function Meshed({ faces, noeuds }: Mesh) {
    // 1) Les nœuds à plat : [[x,y,z],[x,y,z]] -> [x,y,z,x,y,z,...]
    const positions = useMemo(() => new Float32Array(noeuds.flat()), [noeuds])

    // 2) Faces -> triangles (quad [a,b,c,d] => [a,b,c] + [a,c,d])
    const indexTriangles = useMemo(() => {
        const idx: number[] = []
        for (const f of faces) {
            idx.push(f[0], f[1], f[2])
            if (f.length === 4) idx.push(f[0], f[2], f[3])
        }
        return new Uint32Array(idx)
    }, [faces])

    // 3) Faces -> arêtes (chaque côté = une paire d'indices)
    const indexAretes = useMemo(() => {
        const idx: number[] = []
        for (const f of faces) {
            for (let i = 0; i < f.length; i++) {
                idx.push(f[i], f[(i + 1) % f.length]) // le % referme la face
            }
        }
        console.log(idx)
        return new Uint32Array(idx)
    }, [faces])

    return (
        <group>
            {/* Couche 1 : les points */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial color="red" size={0.01} />
            </points>

            {/* Couche 2 : les faces */}
            <mesh>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="index" args={[indexTriangles, 1]} />
                </bufferGeometry>
                <meshStandardMaterial
                    color="#bdbdbd"
                    depthWrite={true}
                    polygonOffsetFactor={1}
                    side={DoubleSide}
                />
            </mesh>


            {/* Couche 3 : les bords noirs */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="index" args={[indexAretes, 1]} />
                </bufferGeometry>
                <lineBasicMaterial color="black" />
            </lineSegments>
        </group>
    )

}

