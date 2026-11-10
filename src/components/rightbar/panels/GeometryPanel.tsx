import { useState, useEffect, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdCategory, MdCheckCircle } from "react-icons/md";
import { type GeometryType, type GeometrySettings, DEFAULT_GEOMETRY_SETTINGS } from "../../../types/geometry";
import { useModel } from "../../../store/models";

/* ========================================================================== *
 * TYPES & CONSTANTES
 * ========================================================================== */


const TYPES: ReadonlyArray<{ value: GeometryType; label: string; intro: string }> = [
  { value: "pave", label: "Cube / Parallélépipède", intro: "Dimensions du parallélépipède." },
  { value: "cylindre", label: "Cylindre", intro: "Dimensions du cylindre." },
];

type DimKey = "width" | "height" | "depth" | "radius";

const DIMENSIONS: Record<GeometryType, ReadonlyArray<{ key: DimKey; label: string }>> = {
  pave: [
    { key: "width", label: "Largeur" },
    { key: "height", label: "Hauteur" },
    { key: "depth", label: "Profondeur" },
  ],
  cylindre: [
    { key: "radius", label: "Rayon" },
    { key: "height", label: "Hauteur" },
  ],
};

const parse = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));
const fmt = (n: number) => (n !== undefined && n !== null ? String(+n.toFixed(4)) : "");

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

function ActionButton({ icon: Icon, onClick, children }: { 
  icon?: IconType; onClick?: () => void; children: ReactNode 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded bg-green-700 px-3 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-600 active:bg-green-500"
    >
      {Icon ? <Icon aria-hidden className="text-lg" /> : null}
      {children}
    </button>
  );
}

function NumberField({ label, unit, value, onChange, min, max, step, id }: {
  label: string; unit?: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; id: string;
}) {
  const [text, setText] = useState(() => fmt(value));

  useEffect(() => {
    const p = parse(text);
    if (!Number.isFinite(p) || Math.abs(p - value) > 1e-9) setText(fmt(value));
  }, [value]);

  const p = parse(text);
  let error: string | null = null;
  if (!Number.isFinite(p)) error = "Saisir un nombre valide";
  else if (min !== undefined && p < min) error = `Minimum : ${fmt(min)}`;
  else if (max !== undefined && p > max) error = `Maximum : ${fmt(max)}`;

  const handleChange = (raw: string) => {
    setText(raw);
    const n = parse(raw);
    if (Number.isFinite(n) && (min === undefined || n >= min) && (max === undefined || n <= max)) onChange(n);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-medium text-amber-200">{label}</label>
        {unit ? <span className="text-[11px] text-amber-400">{unit}</span> : null}
      </div>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step ?? "any"}
        aria-invalid={error !== null}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className={
          "w-full rounded border bg-amber-950 px-2.5 py-1.5 text-sm text-amber-100 outline-none transition-colors focus:ring-1 " +
          (error ? "border-red-400 focus:ring-red-400" : "border-amber-700 focus:border-amber-400 focus:ring-amber-400")
        }
      />
      {error ? <p role="alert" className="text-[11px] text-red-300">{error}</p> : null}
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
  // État local pour rendre le composant 100% autonome
  const [settings, setSettings] = useState<GeometrySettings>(DEFAULT_GEOMETRY_SETTINGS);

  const set = (patch: Partial<GeometrySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const setGeometry = useModel((p)=>p.setGeometry)

  const current = TYPES.find((s) => s.value === settings.type) ?? TYPES[0];

  const handleValidate = () => {
    setGeometry(settings)
  };


  return (
    <PanelShell
      title="Propriétés de la géométrie"
      icon={MdCategory}
      footer={
        <ActionButton icon={MdCheckCircle} onClick={handleValidate} >
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
  );
}