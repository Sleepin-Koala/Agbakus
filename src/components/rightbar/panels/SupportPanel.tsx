import * as React from "react";
import { useState, useEffect, useRef} from "react";
import { ActionButton } from "../components/actionInput";
import { MdCheckCircle, MdVerified } from "react-icons/md";
import { SetSelectBoundaryConditions } from "../../../store/states";
import { cx } from "../components/cx";
import { HoldOnButton } from "../components/HoldonButton";
import { useModel } from "../../../store/models";

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


/* ========================================================================== *
 * COMPOSANT PRINCIPAL AUTONOME
 * ========================================================================== */

export default function SupportPanel() {
  const [model, setModel] = useState<SimulationModel>(DEFAULT_MODEL);
  const s = model.support;
  const BoundaryConditionState = SetSelectBoundaryConditions((p) => p)
  const [valid, setValid] = useState<boolean>(false);
  const currentModel = useModel((p)=>p)


  const wasActive = useRef(false);

  const setSupport = (kind: SupportKind, on: boolean) =>
    setModel({ ...model, support: { ...s, supports: { ...s.supports, [kind]: on } } });


  const activeCount = SUPPORTS.filter((x) => s.supports[x.kind]).length;


  useEffect(() => {
    if (BoundaryConditionState.isActive) {
      wasActive.current = true;
    } else if (wasActive.current) {
        wasActive.current = false;
        if (currentModel.boundary) setValid(true);
    }
  }, [BoundaryConditionState.isActive]);

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




  return (
    <div className="flex flex-col gap-3 max-w-sm bg-amber-900 p-3 text-zinc-100 font-sans border border-[#2a2c33] rounded">
      
      {valid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-lg border border-amber-700 bg-amber-900 p-5 text-center text-amber-100 shadow-2xl">
            <MdCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />
            <h3 className="mb-1 text-base font-semibold">Face encastrée</h3>
            <p className="mb-4 text-xs text-amber-200/80">
              Vous avez effectivement fixé cette face avec succès.
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
        </div>)}


      <HoldOnButton
        onActive={BoundaryConditionState.isActive}
        onClick={BoundaryConditionState.toogleActivation}
      >
        Sélectionner une face
      </HoldOnButton>

      <ActionButton onClick={BoundaryConditionState.toogleActivation}>
        ANNULER
      </ActionButton>


    </div>
  );
}