import { useState, useEffect, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdCheckCircle, MdRestartAlt, MdScience, MdTune, MdVerified } from "react-icons/md";
import useCalculs from "../../../../hooks/useCalculs";
import { useModel } from "../../../../store/models";
import type { Materiau } from "../../../../types/material";
import  { ActionButton } from "../../components/actionInput";
import { NumberField } from "./components/NumberField";
import  { PanelShell } from "./components/PanelShell";
import  { SectionLabel } from "./components/SectionLabel";
import { SelectInput } from "./components/SelectInput";


/* ========================================================================== *
 * COMPOSANTS UI INTÉGRÉS (PANEL KIT)
 * ========================================================================== */






function SecondaryButton({ icon: Icon, onClick, children }: { 
  icon?: IconType; onClick?: () => void; children: ReactNode 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded border border-amber-700/60 bg-amber-950 px-3 py-2 text-xs text-amber-200 transition-colors hover:border-amber-500 hover:text-amber-100"
    >
      {Icon ? <Icon aria-hidden className="text-base" /> : null}
      {children}
    </button>
  );
}





/* ========================================================================== *
 * COMPOSANT PRINCIPAL ADAPTÉ À L'API
 * ========================================================================== */

export default function MaterialPanel() {
  const { materiaux, getMateriaux } = useCalculs();
  const [selectedNom, setSelectedNom] = useState<string>("");
  const [valid, setValid] = useState<boolean>(false);


  useEffect(() => {
    getMateriaux();
  }, [getMateriaux]);

  // Sélectionner le premier matériau par défaut dès le chargement de la liste
  useEffect(() => {
    if (materiaux && materiaux.length > 0 && !selectedNom) {
      setSelectedNom(materiaux[0].nom);
    }
  }, [materiaux, selectedNom]);

  const currentMateriau: Materiau | undefined = (materiaux || []).find(
    (m) => m.nom === selectedNom
  ) || (materiaux && materiaux.length > 0 ? materiaux[0] : undefined);

  const setMateriau = useModel((p)=>p.setMateriau)
  const handleApply = () => {
    if (currentMateriau) {
      setMateriau(currentMateriau)
      setValid(true)
    } else {
      alert("Aucun matériau sélectionné.");
    }
  };

  const handleReset = () => {
    if (materiaux && materiaux.length > 0) {
      setSelectedNom(materiaux[0].nom);
    }
  };

  const materialOptions = (materiaux || []).map((m) => ({
    value: m.nom,
    label: m.nom,
  }));

  return (
    <PanelShell
      title="Propriétés du matériau"
      icon={MdScience}
      footer={
        <div className="space-y-2">
          <ActionButton icon={MdVerified} onClick={handleApply}>
            Appliquer les propriétés
          </ActionButton>
          <SecondaryButton icon={MdRestartAlt} onClick={handleReset}>
            Rétablir par défaut
          </SecondaryButton>
        </div>
      }
    >

      {valid && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                <div className="w-full max-w-xs rounded-lg border border-amber-700 bg-amber-900 p-5 text-center text-amber-100 shadow-2xl">
                  <MdCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />
                  <h3 className="mb-1 text-base font-semibold">Materiau validée</h3>
                  <p className="mb-4 text-xs text-amber-200/80">
                    Les paramètres de materiaux ont bien été enregistrés.
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


      <div className="flex items-center justify-between border-b border-amber-700/50 pb-2">
        <div className="flex items-center gap-2">
          <MdScience aria-hidden className="text-lg text-amber-400" />
          <span className="text-sm font-medium text-amber-100">Définition du matériau</span>
        </div>
        <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
          Isotrope
        </span>
      </div>

      <div className="space-y-1.5">
        <SectionLabel>Bibliothèque de matériaux (API)</SectionLabel>
        <SelectInput<string>
          ariaLabel="Sélection du matériau"
          value={selectedNom}
          onChange={(val) => setSelectedNom(val)}
          options={materialOptions}
        />
      </div>

      <div className="space-y-3 rounded border border-amber-800 bg-amber-950/50 p-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-100">
          <MdTune aria-hidden className="text-base text-amber-400" />
          Constantes physiques et élastiques
        </span>
        <NumberField
          id="mat-density"
          label="Masse volumique (ρ)"
          unit="kg/m³"
          step={10}
          value={currentMateriau?.masse_volumique ?? 0}
        />
        <NumberField
          id="mat-E"
          label="Module d'Young (E)"
          unit="MPa"
          step={0.5}
          value={currentMateriau?.module_young ?? 0}
        />
        <NumberField
          id="mat-nu"
          label="Coefficient de Poisson (ν)"
          unit="sans dimension"
          step={0.01}
          value={currentMateriau?.coefficient_poisson ?? 0}
        />
        <NumberField
          id="mat-yield"
          label="Limite d'élasticité (σ_y)"
          unit="MPa"
          step={5}
          value={currentMateriau?.limite_elastique ?? 0}
        />
        {/* Champ absent de l'interface Materiau / réponse API : grisé et désactivé */}
        <NumberField
          id="mat-alpha"
          label="Dilatation thermique (α)"
          unit="10⁻⁶ / K"
          step={0.1}
          value={0}
          disabled={true}
        />
      </div>
    </PanelShell>
  );
}