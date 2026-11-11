import { useMemo } from "react";
import { Color, DoubleSide } from "three"; // NOUVEAU : Color
import type { Mesh } from "../../../types/mesh";

// NOUVEAU : on étend ton type Mesh avec deux infos optionnelles
type MeshedProps = Mesh & {
    deplacements?: number[][]; // [[ux,uy,uz], ...] venant de /simulation
    facteur?: number;          // amplification d'affichage
};

export function Meshed({ faces, noeuds, deplacements, facteur = 1 }: MeshedProps) {
    // 1) Positions INITIALES (ton code d'origine, juste renommé)
    const positionsInitiales = useMemo(() => new Float32Array(noeuds.flat()), [noeuds]);

    // NOUVEAU : positions DÉFORMÉES = noeud + facteur × déplacement
    const positionsDeformees = useMemo(() => {
        if (!deplacements) return positionsInitiales; // pas de simulation : rien ne change
        const out = new Float32Array(noeuds.length * 3);
        for (let i = 0; i < noeuds.length; i++) {
            for (let c = 0; c < 3; c++) {
                out[3 * i + c] = noeuds[i][c] + facteur * deplacements[i][c];
            }
        }
        return out;
    }, [noeuds, deplacements, facteur, positionsInitiales]);

    // NOUVEAU : une couleur par nœud (heatmap)
    const couleurs = useMemo(() => {
        if (!deplacements) return null;
        const normes = deplacements.map((d) => Math.hypot(d[0], d[1], d[2]));
        const max = Math.max(...normes);
        const arr = new Float32Array(noeuds.length * 3);
        const couleur = new Color();
        normes.forEach((n, i) => {
            const t = max > 0 ? n / max : 0;      // normalisation : 0 → 1
            couleur.setHSL((1 - t) * 0.33, 1, 0.5); // t=0 vert (0.33), t=1 rouge (0)
            arr[3 * i] = couleur.r;
            arr[3 * i + 1] = couleur.g;
            arr[3 * i + 2] = couleur.b;
        });
        return arr;
    }, [deplacements, noeuds.length]);

    // 2) Faces -> triangles (inchangé)
    const indexTriangles = useMemo(() => {
        const idx: number[] = [];
        for (const f of faces) {
            idx.push(f[0], f[1], f[2]);
            if (f.length === 4) idx.push(f[0], f[2], f[3]);
        }
        return new Uint32Array(idx);
    }, [faces]);

    // 3) Faces -> arêtes (inchangé, j'ai retiré le console.log)
    const indexAretes = useMemo(() => {
        const idx: number[] = [];
        for (const f of faces) {
            for (let i = 0; i < f.length; i++) {
                idx.push(f[i], f[(i + 1) % f.length]);
            }
        }
        return new Uint32Array(idx);
    }, [faces]);

    const simule = !!deplacements; // NOUVEAU : raccourci lisible

    return (
        <group>
            {/* NOUVEAU : fantôme du solide initial, uniquement après simulation */}
            {simule && (
                <mesh>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[positionsInitiales, 3]} />
                        <bufferAttribute attach="index" args={[indexTriangles, 1]} />
                    </bufferGeometry>
                    <meshStandardMaterial
                        color="#bdbdbd"
                        transparent
                        opacity={0.15}
                        depthWrite={false}
                        side={DoubleSide}
                    />
                </mesh>
            )}

            {/* Couche 1 : les points (sur la position déformée) */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positionsDeformees, 3]} />
                </bufferGeometry>
                <pointsMaterial color="red" size={0.01} />
            </points>

            {/* Couche 2 : les faces, colorées si simulation */}
            <mesh key={couleurs ? "heatmap" : "plain"}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positionsDeformees, 3]} />
                    <bufferAttribute attach="index" args={[indexTriangles, 1]} />
                    {/* NOUVEAU : couleur par nœud */}
                    {couleurs && (
                        <bufferAttribute attach="attributes-color" args={[couleurs, 3]} />
                    )}
                </bufferGeometry>
                <meshStandardMaterial
                    color={couleurs ? "white" : "#bdbdbd"} // blanc = ne teinte pas les vertex colors
                    vertexColors={!!couleurs}              // NOUVEAU : active la lecture des couleurs
                    depthWrite={true}
                    polygonOffsetFactor={1}
                    side={DoubleSide}
                />
            </mesh>

            {/* Couche 3 : les bords noirs (sur la position déformée) */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positionsDeformees, 3]} />
                    <bufferAttribute attach="index" args={[indexAretes, 1]} />
                </bufferGeometry>
                <lineBasicMaterial color="black" />
            </lineSegments>
        </group>
    );
}