import * as React from "react";
import UnitInput from "../ui/UnitInput";
import { cx } from "../cx";

export interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  /** Overrides the default out-of-range message, e.g. "Element size must be greater than 0". */
  minMessage?: string;
  disabled?: boolean;
  compact?: boolean;
}

function formatValue(v: number): string {
  return Number.isInteger(v) ? String(v) : String(+v.toFixed(4));
}

/**
 * Labelled numeric field with unit suffix and inline, domain-specific
 * validation. Never emits NaN: the parent only receives in-range numbers,
 * while the text box keeps what the user typed and shows a precise error.
 */
export default function NumberField({
  id, label, value, onChange, unit, min, max, step, hint, minMessage, disabled, compact,
}: NumberFieldProps) {
  const [text, setText] = React.useState(() => formatValue(value));
  React.useEffect(() => setText(formatValue(value)), [value]);

  const t = text.trim();
  const n = t === "" ? NaN : Number(t);
  let error: string | null = null;
  if (t === "") error = `${label} is required`;
  else if (Number.isNaN(n)) error = `${label} must be a number`;
  else if (min !== undefined && n < min) error = minMessage ?? `${label} must be at least ${min}`;
  else if (max !== undefined && n > max) error = `${label} must be at most ${max}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    const parsed = raw.trim() === "" ? NaN : Number(raw);
    if (!Number.isNaN(parsed) && (min === undefined || parsed >= min) && (max === undefined || parsed <= max)) {
      onChange(parsed);
    }
  };

  const errId = `${id}-error`;

  return (
    <div className={cx("flex flex-col gap-1", compact ? "" : "")}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-medium text-zinc-400">{label}</label>
        {hint ? <span className="font-mono text-[10px] text-zinc-600">{hint}</span> : null}
      </div>
      <UnitInput
        id={id} value={text} onChange={handleChange} unit={unit}
        min={min} max={max} step={step ?? "any"} disabled={disabled}
        invalid={error !== null}
        aria-invalid={error !== null || undefined}
        aria-describedby={error ? errId : undefined}
      />
      {error ? (
        <p id={errId} role="alert" className="text-[11px] leading-tight text-red-400">{error}</p>
      ) : null}
    </div>
  );
}