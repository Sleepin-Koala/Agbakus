import  { useState, useEffect, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdGridView, MdExpandMore, MdCheckCircle } from "react-icons/md";
import useCalculs, { type RequeteMaillage } from "../../../../hooks/useCalculs";
import { useModel } from "../../../../store/models";
import { StoreMeshSettings } from "../../../../store/states";
import type { MeshSettings } from "../../../../types/mesh";
import  { ActionButton } from "../../components/actionInput";
import { PanelShell } from "./components/PanelShell";
import  { CollapsibleCard } from "./components/CollapsibleCard";
import  { Field } from "./components/Field";
import  { InfoRow } from "./components/InfoRow";
import  { NumberField } from "./components/NumberField";


/* ========================================================================== *
 * TYPES & CONSTANTES
 * ========================================================================== */




export interface MeshQuality {
  jacobianMin: number;
  aspectRatioMax: number;
}


/* ========================================================================== *
 * COMPOSANTS UI INTÉGRÉS (PANEL KIT)
 * ========================================================================== */













/* ========================================================================== *
 * COMPOSANT PRINCIPAL (MeshPanel)
 * ========================================================================== */

export default function MeshPanel() {
  // Récupération du store global
  const model = useModel((p) => p);
  const type = model.geometry?.type ?? "pave";
  const [valid, setValid] = useState<boolean>(false);


  const { genererMaillage } = useCalculs()

  // État local du maillage synchronisé avec le store

  const meshSettingsStore = StoreMeshSettings((p)=>p)
  const meshSettings = meshSettingsStore.MeshSettings
  const setMeshSettings = meshSettingsStore.setMeshSettings



  const [quality] = useState<MeshQuality | null>({
    jacobianMin: 0.88,
    aspectRatioMax: 1.15,
  });

  const updateMesh = (patch: Partial<MeshSettings>) => {
    const next = { ...meshSettings, ...patch };
    setMeshSettings(next);
  };


  async function handleRequestMaillage() {
    if (!type) return
    const r = { "geometrie": model.geometry, "maillage": meshSettings } as RequeteMaillage
    model.setMesh(await genererMaillage(r))
    setValid(true)
  }

  return (
    <PanelShell
      title="Propriétés du maillage"
      icon={MdGridView}
      selected={{
        icon: MdGridView,
        label: type === "cylindre" ? "Maillage Cylindrique" : "Maillage Pavé / Cube",
        status: "Actif",
      }}
      footer={
        <ActionButton icon={MdGridView} onClick={handleRequestMaillage}>
          Générer le maillage
        </ActionButton>
      }
    >

      {valid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-lg border border-amber-700 bg-amber-900 p-5 text-center text-amber-100 shadow-2xl">
            <MdCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />
            <h3 className="mb-1 text-base font-semibold">Maillage validée</h3>
            <p className="mb-4 text-xs text-amber-200/80">
              Les paramètres de maillage ont bien été enregistrés.
            </p>
            <button
              type="button"
              onClick={() => setValid(false)}
              className="w-full rounded border border-amber-600 bg-amber-800 px-3 py-1.5 text-sm font-medium text-amber-100 transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Fermer
            </button>
          </div>
        </div>
      )}


      {/* Rendu conditionnel des paramètres de maillage selon la géométrie active */}
      {type === "cylindre" ? (
        <div className="space-y-3">
          <Field label="Discrétisation du cylindre" hint="Paramètres de maillage pour géométrie cylindrique">
            <div className="space-y-2">
              <NumberField
                id="mesh-ntheta"
                label="Divisions circonférentielles (n_theta)"
                value={meshSettings?.n_theta ?? 12}
                min={3}
                step={1}
                onChange={(v) => updateMesh({ n_theta: v })}
              />
              <NumberField
                id="mesh-nz-cyl"
                label="Divisions longitudinales (n_z)"
                value={meshSettings?.n_z ?? 10}
                min={1}
                step={1}
                onChange={(v) => updateMesh({ n_z: v })}
              />
            </div>
          </Field>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Discrétisation du pavé / cube" hint="Paramètres de maillage pour géométrie cartésienne">
            <div className="space-y-2">
              <NumberField
                id="mesh-nx"
                label="Divisions selon X (nx)"
                value={meshSettings?.nx ?? 10}
                min={1}
                step={1}
                onChange={(v) => updateMesh({ nx: v })}
              />
              <NumberField
                id="mesh-ny"
                label="Divisions selon Y (ny)"
                value={meshSettings?.ny ?? 10}
                min={1}
                step={1}
                onChange={(v) => updateMesh({ ny: v })}
              />
              <NumberField
                id="mesh-nz"
                label="Divisions selon Z (nz)"
                value={meshSettings?.nz ?? 10}
                min={1}
                step={1}
                onChange={(v) => updateMesh({ nz: v })}
              />
            </div>
          </Field>
        </div>
      )}

      <CollapsibleCard title="Qualité & contrôles du maillage">
        <InfoRow label="Jacobien min :">{quality ? quality.jacobianMin.toFixed(2) : "—"}</InfoRow>
        <InfoRow label="Rapport d'aspect max :">{quality ? quality.aspectRatioMax.toFixed(2) : "—"}</InfoRow>
      </CollapsibleCard>
    </PanelShell>
  );
}