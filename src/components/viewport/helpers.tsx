import React, { useEffect, useState } from 'react';
import { ActionButton, Modal } from './components/index.tsx';
import useCalculs from '../../hooks/useCalculs.tsx';
import { useModel } from '../../store/models.ts';

// Types d'interface attendus
export interface Vector3D { x: number; y: number; z: number; }
export interface Boundary { type: "encastrement"; target: string; }
export interface Load { type: "force"; value: number; target: string; }
export interface Material { type: string; eModulus: number; poisson: number; }

export function SimulationToolbar() {
  // États de visibilité des overlays
  const [activeModal, setActiveModal] = useState<'part' | 'material' | 'bc' | 'force' | 'mesh' | null>(null);

  const { materiaux, isLoading, getMateriaux, resetErreur } = useCalculs();
  console.log(typeof materiaux)

  // Données de simulation basiques (pour l'exemple)
  const [boundary, setBoundary] = useState<Boundary | null>(null);
  const [isBCactive, setIsBCactive] = useState(false);

  // Form États temporaires pour les modales
  const [partType, setPartType] = useState<'pave' | 'cylindre'>('pave');
  const [partDim, setPartDim] = useState({ x: 3, y: 3, z: 3, r: 1.5, h: 3 });
  const [selectedMaterial, setSelectedMaterial] = useState('Acier');
  const [bcFace, setBcFace] = useState('Face_Z-');
  const [forceVal, setForceVal] = useState(40);
  const [forceFace, setForceFace] = useState('Face_Z+');
  const [meshDensity, setMeshDensity] = useState({ x: 12, y: 12, z: 12 });
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>('Acier');


  //effective
  const setMateriau = useModel((s) => s.setMateriau);


  // Fonctions de soumission fictives (remplacez par votre logique métier / Three.js)


  const handleMaterialSubmit = () => {
    // On retrouve l'objet complet correspondant au nom sélectionné
    const materiauComplet = materiaux.find((m) => m.nom === selectedMaterialName);

    if (materiauComplet) {
      setMateriau(materiauComplet); // Mise à jour du store global avec l'interface attendue
      console.log("Matériau appliqué dans le store :", materiauComplet);
    }

    setActiveModal(null);
  };

  const handleBCSubmit = () => {
    // setBoundary({ type: "encastrement", target: bcFace });
    // setIsBCactive(true);
    // setActiveModal(null);
    return
  };

  const handleForceSubmit = () => {
    // console.log("Set Load:", { type: "force", value: forceVal, target: forceFace });
    // setActiveModal(null);
    return
  };

  const handleMeshSubmit = () => {
    // console.log("Request Maillage:", meshDensity);
    // setActiveModal(null);
    return
  };


  useEffect(() => {
    getMateriaux()
  }, [])

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 shadow-xl">
      {/* Barre d'outils principale */}
      <div className="flex flex-wrap gap-3 items-center">
        <ActionButton onClick={() => setActiveModal('part')}>
          📦 Pièce Geometry
        </ActionButton>

        <ActionButton onClick={() => setActiveModal('material')}>
          💎 Matériau
        </ActionButton>

        <ActionButton
          variant={isBCactive ? 'success' : 'primary'}
          onClick={() => setActiveModal('bc')}
        >
          🔒 Conditions Limites {isBCactive && `(${boundary?.target})`}
        </ActionButton>

        <ActionButton onClick={() => setActiveModal('mesh')}>
          🕸️ Maillage
        </ActionButton>

        <ActionButton
          disabled={!isBCactive}
          onClick={() => setActiveModal('force')}
        >
          💥 Add Force
        </ActionButton>

        <ActionButton
          disabled={!isBCactive}
          onClick={() => console.log("Lancement simulation...")}
        >
          🚀 Simulation
        </ActionButton>
      </div>

      {/* --- OVERLAY 1: GÉOMÉTRIE DE LA PIÈCE --- */}
      <Modal isOpen={activeModal === 'part'} onClose={() => setActiveModal(null)} title="Configuration de la géométrie">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Forme</label>
            <div className="grid grid-cols-2 gap-2">
              <button className={`p-2 rounded-lg border text-sm font-medium ${partType === 'pave' ? 'bg-amber-900/30 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`} onClick={() => setPartType('pave')}>Pavé Droit</button>
              <button className={`p-2 rounded-lg border text-sm font-medium ${partType === 'cylindre' ? 'bg-amber-900/30 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`} onClick={() => setPartType('cylindre')}>Cylindre</button>
            </div>
          </div>
          {partType === 'pave' ? (
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs text-slate-400">Largeur (X)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={partDim.x} onChange={e => setPartDim({ ...partDim, x: +e.target.value })} /></div>
              <div><label className="text-xs text-slate-400">Hauteur (Y)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={partDim.y} onChange={e => setPartDim({ ...partDim, y: +e.target.value })} /></div>
              <div><label className="text-xs text-slate-400">Profondeur (Z)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={partDim.z} onChange={e => setPartDim({ ...partDim, z: +e.target.value })} /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-slate-400">Rayon (R)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={partDim.r} onChange={e => setPartDim({ ...partDim, r: +e.target.value })} /></div>
              <div><label className="text-xs text-slate-400">Hauteur (H)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={partDim.h} onChange={e => setPartDim({ ...partDim, h: +e.target.value })} /></div>
            </div>
          )}
          <ActionButton className="w-full mt-2" onClick={handlePartSubmit}>Générer la forme</ActionButton>
        </div>
      </Modal>

      {/* --- OVERLAY 2: LOADING --- */}

      <Modal isOpen={activeModal === 'material'} onClose={() => setActiveModal(null)} title="Propriétés du Matériau">
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase text-slate-400">
          Sélectionner un matériau
        </label>
        
        {/* 2. On peut utiliser isLoading pour bloquer la sélection pendant le fetch */}
        <select 
          value={selectedMaterialName} 
          onChange={e => setSelectedMaterialName(e.target.value)} 
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-slate-200 disabled:opacity-50"
        >
          {isLoading ? (
            <option>Chargement des matériaux...</option>
          ) : (
            materiaux.map((mat) => (
              <option key={mat.nom} value={mat.nom}>
                {mat.nom === "Autre" 
                  ? "Autre (Saisie personnalisée...)" 
                  : `${mat.nom} (E = ${mat.module_young / 1000} GPa, ν = ${mat.coefficient_poisson})`
                }
              </option>
            ))
          )}
        </select>

        <ActionButton 
          className="w-full" 
          onClick={handleMaterialSubmit}
          disabled={isLoading || materiaux.length === 0}
        >
          Appliquer le matériau
        </ActionButton>
      </div>
    </Modal>

      {/* --- OVERLAY 3: CONDITIONS AUX LIMITES --- */}
      <Modal isOpen={activeModal === 'bc'} onClose={() => setActiveModal(null)} title="Fixation Mécanique (Encastrement)">
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase text-slate-400">Choisir la face à encastrer</label>
          <select value={bcFace} onChange={e => setBcFace(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-slate-200">
            <option value="Face_Z-">Face Inférieure (Z-)</option>
            <option value="Face_Z+">Face Supérieure (Z+)</option>
            <option value="Face_X-">Face Gauche (X-)</option>
            <option value="Face_X+">Face Droite (X+)</option>
          </select>
          <ActionButton variant="success" className="w-full" onClick={handleBCSubmit}>Appliquer l'encastrement</ActionButton>
        </div>
      </Modal>

      {/* --- OVERLAY 4: CHARGEMENT / FORCE --- */}
      <Modal isOpen={activeModal === 'force'} onClose={() => setActiveModal(null)} title="Appliquer une Force Ponctuelle / Surfacique">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Valeur de la force (N)</label>
            <input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={forceVal} onChange={e => setForceVal(+e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Face cible de la force</label>
            <select value={forceFace} onChange={e => setForceFace(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-slate-200">
              <option value="Face_Z+">Face Opposée (Z+)</option>
              <option value="Face_X+">Face Latérale (X+)</option>
            </select>
          </div>
          <ActionButton className="w-full" onClick={handleForceSubmit}>Injecter la Force</ActionButton>
        </div>
      </Modal>

      {/* --- OVERLAY 5: MAILLAGE (MESH) --- */}
      <Modal isOpen={activeModal === 'mesh'} onClose={() => setActiveModal(null)} title="Paramètres du Maillage EF">
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase text-slate-400.">Densité de discrétisation (Noeuds)</label>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-slate-500">Divisions X</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={meshDensity.x} onChange={e => setMeshDensity({ ...meshDensity, x: +e.target.value })} /></div>
            <div><label className="text-xs text-slate-500">Divisions Y</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm" value={meshDensity.y} onChange={e => setMeshDensity({ ...meshDensity, y: +e.target.value })} /></div>
          </div>
        </div>
      </Modal>
    </div>
  )
};
