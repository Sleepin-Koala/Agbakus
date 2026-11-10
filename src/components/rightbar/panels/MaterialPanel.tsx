import { useState, useEffect, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdRestartAlt, MdScience, MdTune, MdVerified } from "react-icons/md";
import useCalculs from "../../../hooks/useCalculs";
import type { Materiau } from "../../../types/material";
import { useModel } from "../../../store/models";
import { ActionButton } from "../components/actionInput";

/* ========================================================================== *
 * COMPOSANTS UI INTÉGRÉS (PANEL KIT)
 * ========================================================================== */

function PanelShell({ title, icon: HeaderIcon, footer, children }: {
  title: string; icon: IconType; footer?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-amber-900 text-amber-100 max-w-sm border border-amber-700">
      <div className="flex items-center justify-between border-b border-amber-700/50 p-3">
        <span className="text-sm font-semibold text-amber-100">{title}</span>
        <HeaderIcon aria-hidden className="text-base text-amber-400" />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-3">{children}</div>
      {footer ? <div className="border-t border-amber-700/50 bg-amber-950/40 p-3">{footer}</div> : null}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="block text-[11px] font-medium uppercase tracking-wider text-amber-300/70">{children}</span>;
}


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

function NumberField({ label, unit, value, step, id, disabled }: {
  label: string; unit?: string; value: number;
  step?: number; id: string; disabled?: boolean;
}) {
  const [text, setText] = useState(() => (value !== undefined && value !== null ? String(value) : ""));

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setText(String(value));
    }
  }, [value]);

  return (
    <div className={`space-y-1 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={`text-[11px] font-medium ${disabled ? "text-amber-300/40" : "text-amber-200"}`}>
          {label} {disabled && "(Non fourni par l'API)"}
        </label>
        {unit ? <span className={`text-[11px] ${disabled ? "text-amber-400/40" : "text-amber-400"}`}>{unit}</span> : null}
      </div>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        disabled={disabled}
        step={step ?? "any"}
        value={text}
        readOnly
        className={
          "w-full rounded border px-2.5 py-1.5 text-sm outline-none transition-colors " +
          (disabled 
            ? "border-amber-800/40 bg-amber-950/40 text-amber-300/40 cursor-not-allowed select-none" 
            : "border-amber-700 bg-amber-950 text-amber-100 cursor-default")
        }
      />
    </div>
  );
}

function SelectInput<T extends string>({ value, onChange, options, ariaLabel, disabled }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel?: string; disabled?: boolean;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
      className={
        "w-full rounded border px-2.5 py-1.5 text-sm outline-none " +
        (disabled
          ? "border-amber-800/40 bg-amber-950/40 text-amber-300/40 cursor-not-allowed"
          : "border-amber-700 bg-amber-950 text-amber-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400")
      }
    >
      {options.length === 0 ? (
        <option value="" disabled>Chargement des matériaux...</option>
      ) : (
        options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))
      )}
    </select>
  );
}

/* ========================================================================== *
 * COMPOSANT PRINCIPAL ADAPTÉ À L'API
 * ========================================================================== */

export default function MaterialPanel() {
  const { materiaux, getMateriaux } = useCalculs();
  const [selectedNom, setSelectedNom] = useState<string>("");

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