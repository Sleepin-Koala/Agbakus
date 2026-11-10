import * as React from "react";
import { useState } from "react";
import { ActionButton } from "../components/actionInput";
import { MdVerified } from "react-icons/md";
import { SetSelectBoundaryConditions } from "../../../store/states";

/* ========================================================================== *
 * TYPES & CONSTANTES AUTONOMES
 * ========================================================================== */

export type LoadAxis = "x" | "y" | "z";
export type SupportKind =
  | "encastre"
  | "pinned"
  | "rollerX"
  | "rollerY"
  | "rollerZ"
  | "symX"
  | "symY"
  | "symZ";

export interface SupportSettings {
  supports: Record<SupportKind, boolean>;
  force: { fx: number; fy: number; fz: number };
  pressure: { value: number; axis: LoadAxis; sign: 1 | -1 };
  gravity: { enabled: boolean; magnitude: number };
}

export interface SimulationModel {
  support: SupportSettings;
}

export interface ActiveCondition {
  id: string;
  label: string;
  detail: string;
}

const DEFAULT_MODEL: SimulationModel = {
  support: {
    supports: {
      encastre: true,
      pinned: false,
      rollerX: false,
      rollerY: false,
      rollerZ: false,
      symX: false,
      symY: false,
      symZ: false,
    },
    force: { fx: 0, fy: -1000, fz: 0 },
    pressure: { value: 0.5, axis: "z", sign: -1 },
    gravity: { enabled: true, magnitude: 9.81 },
  },
};

const gs = { fill: "none", stroke: "currentColor", strokelongeur: 1.1 } as const;

function cx(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(" ");
}

/* ========================================================================== *
 * GLYPHES & SVGS
 * ========================================================================== */

function AxisGlyph({ axis, className }: { axis: LoadAxis; className?: string }) {
  const c = { x: "#71717a", y: "#71717a", z: "#71717a" };
  c[axis] = "#f5a524";
  return (
    <svg viewBox="0 0 16 16" className={cx("h-3.5 w-3.5", className)} aria-hidden {...gs}>
      <path d="M2 14 8 8" stroke={c.z} />
      <path d="M8 14V8" stroke={c.y} />
      <path d="M8 14h6" stroke={c.x} />
      <path d="M6.6 6.6 8 8l1.4-1.4" stroke={c.z} />
      <path d="M8 6.2V8M13.8 14H12" stroke="#a1a1aa" />
    </svg>
  );
}

function FixedGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-zinc-500" aria-hidden {...gs}>
      <path d="M3 4h10v6H3z" />
      <path d="M3 10l-1.5 2.5M6 10 4.5 12.5M9 10 7.5 12.5M12 10l-1.5 2.5M15 10l-1.5 2.5" />
    </svg>
  );
}

function PinnedGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-zinc-500" aria-hidden {...gs}>
      <path d="M8 3v6M8 9 4 13M8 9l4 4M3 13h10" />
      <circle cx="8" cy="3" r="1.2" />
    </svg>
  );
}

const SUPPORTS: Array<{ kind: SupportKind; label: string; sub: string; axis?: LoadAxis; glyph: "fixed" | "pinned" | "axis" }> = [
  { kind: "encastre", label: "ENCASTRE", sub: "Fixer une section", glyph: "fixed" },
];

/* ========================================================================== *
 * COMPOSANTS UI INTÉGRÉS
 * ========================================================================== */

function SectionGroup({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-[#2a2c33] bg-amber-900 p-3 text-amber-100">
      <div className="mb-2 flex items-center justify-between border-b border-[#202227] pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">{title}</span>
        {badge ? <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">{badge}</span> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function NumberField({ id, label, unit, value, onChange, min, minMessage, step }: {
  id: string; label: string; unit?: string; value: number; onChange: (v: number) => void;
  min?: number; minMessage?: string; step?: number; compact?: boolean;
}) {
  const [text, setText] = useState(String(value));

  React.useEffect(() => {
    setText(String(value));
  }, [value]);

  const n = Number(text);
  const isError = min !== undefined && n < min;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] text-zinc-300">
        <label htmlFor={id}>{label}</label>
        {unit ? <span className="text-amber-400/80">{unit}</span> : null}
      </div>
      <input
        id={id}
        type="number"
        step={step ?? "any"}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = parseFloat(e.target.value);
          if (!isNaN(parsed)) onChange(parsed);
        }}
        className={cx(
          "w-full rounded border bg-amber-900 px-2 py-1 text-xs text-zinc-100 outline-none transition-colors focus:border-amber-400",
          isError ? "border-red-500" : "border-[#2a2c33]"
        )}
      />
      {isError && minMessage ? <span className="text-[10px] text-red-400">{minMessage}</span> : null}
    </div>
  );
}

function SelectField<T extends string>({ id, label, value, onChange, options }: {
  id: string; label: string; value: T; onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-zinc-300">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded border border-[#2a2c33] bg-amber-900 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-amber-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ========================================================================== *
 * COMPOSANT PRINCIPAL AUTONOME
 * ========================================================================== */

export default function SupportPanel() {
  const [model, setModel] = useState<SimulationModel>(DEFAULT_MODEL);
  const s = model.support;
  const BoundaryConditionState = SetSelectBoundaryConditions((p)=>p)

  const setSupport = (kind: SupportKind, on: boolean) =>
    setModel({ ...model, support: { ...s, supports: { ...s.supports, [kind]: on } } });

  const setForce = (patch: Partial<typeof s.force>) =>
    setModel({ ...model, support: { ...s, force: { ...s.force, ...patch } } });

  const setPressure = (patch: Partial<typeof s.pressure>) =>
    setModel({ ...model, support: { ...s, pressure: { ...s.pressure, ...patch } } });

  const setGravity = (patch: Partial<typeof s.gravity>) =>
    setModel({ ...model, support: { ...s, gravity: { ...s.gravity, ...patch } } });

  const activeCount = SUPPORTS.filter((x) => s.supports[x.kind]).length;

  // Génération dynamique de la liste des conditions actives
  const activeConditions: ActiveCondition[] = [];
  SUPPORTS.forEach((sup) => {
    if (s.supports[sup.kind]) {
      activeConditions.push({
        id: `sup-${sup.kind}`,
        label: sup.label,
        detail: sup.sub,
      });
    }
  });

  if (s.force.fx !== 0 || s.force.fy !== 0 || s.force.fz !== 0) {
    activeConditions.push({
      id: "load-force",
      label: "FORCE",
      detail: `Fx: ${s.force.fx}N, Fy: ${s.force.fy}N, Fz: ${s.force.fz}N`,
    });
  }

  if (s.pressure.value !== 0) {
    activeConditions.push({
      id: "load-pressure",
      label: "PRESSURE",
      detail: `${s.pressure.value} MPa (${s.pressure.sign === 1 ? "+" : "−"}${s.pressure.axis.toUpperCase()})`,
    });
  }

  if (s.gravity.enabled) {
    activeConditions.push({
      id: "load-gravity",
      label: "GRAVITY",
      detail: `${s.gravity.magnitude} m/s² (−Y)`,
    });
  }

  const removeCondition = (id: string) => {
    if (id.startsWith("sup-")) {
      const kind = id.replace("sup-", "") as SupportKind;
      setSupport(kind, false);
    } else if (id === "load-force") {
      setForce({ fx: 0, fy: 0, fz: 0 });
    } else if (id === "load-pressure") {
      setPressure({ value: 0 });
    } else if (id === "load-gravity") {
      setGravity({ enabled: false });
    }
  };

  function handleApply(): void {
    BoundaryConditionState.toogleActivation()
  }

  return (
    <div className="flex flex-col gap-3 max-w-sm bg-amber-900 p-3 text-zinc-100 font-sans border border-[#2a2c33] rounded">
      <SectionGroup title="Boundary conditions" badge={`${activeCount} set`}>
        <ul className="flex flex-col">
          {SUPPORTS.map((x) => (
            <li key={x.kind}>
              <label className={cx(
                "flex cursor-pointer items-center gap-2 border-b border-amber-900 px-1 py-1.5 text-[11px] last:border-b-0",
                "hover:bg-[#1d1f24] focus-within:outline focus-within:outline-amber-400"
              )}>
                <input type="checkbox" checked={s.supports[x.kind]}
                  onChange={(e) => setSupport(x.kind, e.target.checked)}
                  className="h-3.5 w-3.5 accent-amber-400" />
                {x.glyph === "fixed" ? <FixedGlyph /> : x.glyph === "pinned" ? <PinnedGlyph /> : <AxisGlyph axis={x.axis!} className="text-zinc-400" />}
                <span className="w-20 shrink-0 font-mono text-[10.5px] tracking-wide text-zinc-300">{x.label}</span>
                <span className="truncate text-[10.5px] text-zinc-600">{x.sub}</span>
              </label>
            </li>
          ))}
        </ul>
      </SectionGroup>


      {/* <SectionGroup title="Loads">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Concentrated force</legend>
          <p className="text-[11px] font-medium text-zinc-400">Concentrated force</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(["fx", "fy", "fz"] as const).map((k) => (
              <NumberField
                key={k} id={`force-${k}`} label={k.toUpperCase()} unit="N" compact
                value={s.force[k]} step={100}
                onChange={(v) => setForce({ [k]: v })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Distributed pressure</legend>
          <p className="text-[11px] font-medium text-zinc-400">Distributed pressure</p>
          <NumberField
            id="pressure-value" label="Magnitude" unit="MPa"
            value={s.pressure.value} step={0.1}
            onChange={(v) => setPressure({ value: v })}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <SelectField<LoadAxis>
              id="pressure-axis" label="Direction" value={s.pressure.axis}
              onChange={(v) => setPressure({ axis: v })}
              options={[
                { value: "x", label: "Normal to X" },
                { value: "y", label: "Normal to Y" },
                { value: "z", label: "Normal to Z" },
              ]}
            />
            <SelectField<"1" | "-1">
              id="pressure-sign" label="Sense"
              value={String(s.pressure.sign) as "1" | "-1"}
              onChange={(v) => setPressure({ sign: Number(v) as 1 | -1 })}
              options={[{ value: "-1", label: "− (inward)" }, { value: "1", label: "+ (outward)" }]}
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Gravity</legend>
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-zinc-300">
            <input type="checkbox" checked={s.gravity.enabled}
              onChange={(e) => setGravity({ enabled: e.target.checked })}
              className="h-3.5 w-3.5 accent-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400" />
            Gravity · −Y
          </label>
          {s.gravity.enabled ? (
            <NumberField
              id="gravity-mag" label="Magnitude" unit="m/s²"
              value={s.gravity.magnitude} min={0.01}
              minMessage="Gravity must be greater than 0" step={0.01}
              onChange={(v) => setGravity({ magnitude: v })}
            />
          ) : null}
        </fieldset>
      </SectionGroup> */}

      {/* {activeConditions.length > 0 ? (
        <SectionGroup title="Active Summary">
          <ul className="flex flex-col gap-1.5 font-mono text-[11px]">
            {activeConditions.map((cond) => (
              <li key={cond.id} className="flex items-center justify-between gap-2 rounded-[3px] border border-[#2a2c33] bg-amber-900px-2 py-1">
                <div className="flex flex-col">
                  <span className="font-bold text-amber-400">{cond.label}</span>
                  <span className="text-zinc-400">{cond.detail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCondition(cond.id)}
                  className="shrink-0 font-mono text-[13px] text-zinc-500 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </SectionGroup>
      ) : null} */}

      <ActionButton icon={MdVerified} onClick={handleApply}>
        Appliquer les propriétés
      </ActionButton>
    </div>
  );
}