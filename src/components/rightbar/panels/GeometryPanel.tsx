import { useState, useEffect, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdCategory, MdCheckCircle } from "react-icons/md";
import { type GeometryType, type GeometrySettings, DEFAULT_GEOMETRY_SETTINGS } from "../../../types/geometry";
import { useModel } from "../../../store/models";
import { ActionButton } from "../components/actionInput";
import NumberField from "../components/NumberField";
import { useWorkState } from "../../../store/modules";
import { Modal } from "../../viewport/components";

/* ========================================================================== *
 * TYPES & CONSTANTES
 * ========================================================================== */

const TYPES: ReadonlyArray<{ value: GeometryType; label: string; intro: string }> = [
  { value: "pave", label: "Cube / Parallélépipède", intro: "Dimensions du parallélépipède." },
  { value: "cylindre", label: "Cylindre", intro: "Dimensions du cylindre." },
];

type DimKey = "longueur" | "hauteur" | "largeur" | "rayon";

const DIMENSIONS: Record<GeometryType, ReadonlyArray<{ key: DimKey; label: string }>> = {
  pave: [
    { key: "longueur", label: "Longueur" },
    { key: "hauteur", label: "Hauteur" },
    { key: "largeur", label: "Largeur" },
  ],
  cylindre: [
    { key: "rayon", label: "Rayon" },
    { key: "hauteur", label: "Hauteur" },
  ],
};

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

function PanelIntro({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-snug text-amber-200/80">{children}</p>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-amber-200">{label}</span>
      </div>
      {children}
    </div>
  );
}

function SelectInput<T extends string>({ value, onChange, options, ariaLabel }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded border border-amber-700 bg-amber-950 px-2.5 py-1.5 text-sm text-amber-100 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ========================================================================== *
 * COMPOSANT PRINCIPAL AUTONOME
 * ========================================================================== */

export default function GeometryPanel() {
  const [settings, setSettings] = useState<GeometrySettings>(DEFAULT_GEOMETRY_SETTINGS);
  const [valid, setValid] = useState<boolean>(false);

  const set = (patch: Partial<GeometrySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const setGeometry = useModel((p) => p.setGeometry);

  const current = TYPES.find((s) => s.value === settings.type) ?? TYPES[0];

  const handleValidate = () => {
    setGeometry(settings);
    setValid(true);
  };

  return (
    <>
      <PanelShell
        title="Propriétés de la géométrie"
        icon={MdCategory}
        footer={
          <ActionButton icon={MdCheckCircle} onClick={handleValidate}>
            Valider la géométrie
          </ActionButton>
        }
      >
        <PanelIntro>Sélectionnez la forme de base puis ajustez ses dimensions.</PanelIntro>

        <Field label="Type de géométrie">
          <SelectInput<GeometryType>
            ariaLabel="Type de géométrie"
            value={settings.type}
            onChange={(type) => set({ type })}
            options={TYPES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>

        <div className="space-y-3">
          <PanelIntro>{current.intro}</PanelIntro>
          {DIMENSIONS[settings.type].map((d) => (
            <NumberField
              key={d.key}
              id={`geo-${d.key}`}
              label={d.label}
              unit="mm"
              value={settings[d.key] || 0}
              min={0.1}
              step={0.5}
              onChange={(v) => set({ [d.key]: v })}
            />
          ))}
        </div>
      </PanelShell>

      {/* Overlay Pop-up de confirmation */}
      {valid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-lg border border-amber-700 bg-amber-900 p-5 text-center text-amber-100 shadow-2xl">
            <MdCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />
            <h3 className="mb-1 text-base font-semibold">Géométrie validée</h3>
            <p className="mb-4 text-xs text-amber-200/80">
              Les paramètres de la forme ont bien été enregistrés.
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
    </>
  );
}
