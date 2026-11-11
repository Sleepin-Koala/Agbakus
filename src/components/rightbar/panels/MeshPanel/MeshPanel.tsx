import  { useState, useEffect, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdGridView, MdExpandMore, MdCheckCircle } from "react-icons/md";
import useCalculs, { type RequeteMaillage } from "../../../../hooks/useCalculs";
import { useModel } from "../../../../store/models";
import { StoreMeshSettings } from "../../../../store/states";
import type { MeshSettings } from "../../../../types/mesh";
import  { ActionButton } from "../../components/actionInput";


/* ========================================================================== *
 * TYPES & CONSTANTES
 * ========================================================================== */




export interface MeshQuality {
  jacobianMin: number;
  aspectRatioMax: number;
}

const parse = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));
const fmt = (n: number) => String(+n.toFixed(4));

/* ========================================================================== *
 * COMPOSANTS UI INTÉGRÉS (PANEL KIT)
 * ========================================================================== */

function PanelShell({ title, icon: HeaderIcon, selected, footer, children }: {
  title: string;
  icon: IconType;
  selected?: { icon: IconType; label: string; status?: string };
  footer?: ReactNode;
  children: ReactNode;
}) {
  const SelectedIcon = selected?.icon;
  return (
    <div className="flex h-full flex-col bg-amber-900 text-amber-100 max-w-sm border border-amber-700">
      <div className="flex items-center justify-between border-b border-amber-700/50 p-3">
        <span className="text-sm font-semibold text-amber-100">{title}</span>
        <HeaderIcon aria-hidden className="text-base text-amber-400" />
      </div>

      {selected && SelectedIcon ? (
        <div className="border-b border-amber-700/50 bg-amber-950/40 p-3">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-amber-300/70">
            Élément sélectionné
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <SelectedIcon aria-hidden className="shrink-0 text-lg text-amber-400" />
              <span className="truncate text-sm font-medium text-amber-100">{selected.label}</span>
            </div>
            {selected.status ? (
              <span className="shrink-0 rounded bg-green-500/20 px-2 py-0.5 text-[11px] text-green-300">
                {selected.status}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto p-3">{children}</div>

      {footer ? <div className="border-t border-amber-700/50 bg-amber-950/40 p-3">{footer}</div> : null}
    </div>
  );
}

function Field({ label, badge, hint, children }: {
  label: string; badge?: string; hint?: string; children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-amber-200">{label}</span>
        {badge ? <span className="text-[11px] text-amber-400">{badge}</span> : null}
      </div>
      {children}
      {hint ? <p className="text-[11px] leading-snug text-amber-300/70">{hint}</p> : null}
    </div>
  );
}

function NumberField({ label, unit, value, onChange, min, max, step, id }: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  id: string;
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

function CollapsibleCard({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2 rounded border border-amber-800 bg-amber-950/50 p-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-xs font-medium text-amber-100"
      >
        <span>{title}</span>
        <MdExpandMore aria-hidden className={`text-base text-amber-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="space-y-1.5 border-t border-amber-800 pt-2 text-xs text-amber-200">{children}</div> : null}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className="text-right text-amber-100">{children}</span>
    </div>
  );
}



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