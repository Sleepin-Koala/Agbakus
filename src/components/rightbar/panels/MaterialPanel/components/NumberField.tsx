import { useState, useEffect } from "react";

export function NumberField({ label, unit, value, step, id, disabled }: {
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