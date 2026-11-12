import { useEffect, useState } from "react";
const parse = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));

const fmt = (n: number) => String(+n.toFixed(4));


export function NumberField({ label, unit, value, onChange, min, max, step, id }: {
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


