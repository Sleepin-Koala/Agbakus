import * as React from "react";
import { useState } from "react";
import { MdCheckCircle, MdDeleteOutline } from "react-icons/md";
import { useModel } from "../../../../store/models"; // Ajuste le chemin selon ton projet

/* ========================================================================== *
 * COMPOSANT UI DE SECTION
 * ========================================================================== */

function SectionGroup({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-[#2a2c33] bg-amber-900 p-3 text-amber-100">
      <div className="mb-2 flex items-center justify-between border-b border-[#202227] pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">
          {title}
        </span>
        {badge ? (
          <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/* ========================================================================== *
 * COMPOSANT PRINCIPAL : LOAD PANEL
 * ========================================================================== */

export default function LoadPanel() {
  const { load, setLoad } = useModel((p) => p);

  // Valeurs initiales reprises du store si déjà existantes, sinon valeurs par défaut
  const [value, setValue] = useState<number>(load?.value ?? 1000);
  const [target, setTarget] = useState({
    x: load?.target.x ?? 0,
    y: load?.target.y ?? -1,
    z: load?.target.z ?? 0,
  });
  const [saved, setSaved] = useState<boolean>(false);

  const handleAxisChange = (axis: "x" | "y" | "z", rawValue: string) => {
    const num = parseFloat(rawValue);
    setTarget((prev) => ({
      ...prev,
      [axis]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoad({
      type: "force",
      value,
      target,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setLoad({type: "force" , value : 0, target : {x: 0 , y:0 , z:0}});
    setValue(1000);
    setTarget({ x: 0, y: 0, z: 1 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-sm flex-col gap-3 rounded border border-[#2a2c33] bg-amber-900 p-3 font-sans text-zinc-100"
    >
      <SectionGroup
        title="Chargement (Force)"
        badge={load ? "Actif" : "Non défini"}
      >
        {/* Intensité de la force */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-amber-200/90">
            Intensité (N)
          </label>
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            className="w-full rounded border border-amber-700/70 bg-amber-950 px-2.5 py-1.5 font-mono text-xs text-amber-100 focus:border-amber-400 focus:outline-none"
            placeholder="Ex: 1000"
          />
        </div>

        {/* Direction (Vector3D) */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-amber-200/90">
            Direction / Cible (X, Y, Z)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((axis) => (
              <div key={axis} className="flex flex-col gap-0.5">
                <span className="text-center font-mono text-[10px] uppercase text-amber-300/70">
                  {axis}
                </span>
                <input
                  type="number"
                  step="any"
                  value={target[axis]}
                  onChange={(e) => handleAxisChange(axis, e.target.value)}
                  className="w-full rounded border border-amber-700/70 bg-amber-950 px-2 py-1 text-center font-mono text-xs text-amber-100 focus:border-amber-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </SectionGroup>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        {load && (
          <button
            type="button"
            onClick={handleClear}
            title="Supprimer la charge"
            className="flex items-center justify-center rounded border border-amber-700 bg-amber-950 px-3 py-2 text-amber-300 transition hover:bg-red-900/70 hover:text-white"
          >
            <MdDeleteOutline className="text-lg" />
          </button>
        )}

        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 active:bg-emerald-500"
        >
          {saved ? (
            <>
              <MdCheckCircle className="text-base" />
              <span>Charge appliquée</span>
            </>
          ) : (
            <span>Appliquer la force</span>
          )}
        </button>
      </div>
    </form>
  );
}
