
export interface SelectOption<V extends string> {
  value: V;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps<V extends string> {
  id: string;
  label: string;
  value: V;
  onChange: (v: V) => void;
  options: ReadonlyArray<SelectOption<V>>;
  hint?: string;
  disabled?: boolean;
}

export default function SelectField<V extends string>({
  id, label, value, onChange, options, hint, disabled,
}: SelectFieldProps<V>) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-medium text-zinc-400">{label}</label>
        {hint ? <span className="font-mono text-[10px] text-zinc-600">{hint}</span> : null}
      </div>
      <select
        id={id} value={value} disabled={disabled}
        onChange={(e) => onChange(e.target.value as V)}
        className="w-full appearance-none rounded-[3px] border border-[#2a2c33] bg-[#101114] px-2 py-1
                   font-mono text-[12px] text-zinc-200 outline-none transition-colors hover:border-[#3a3d46]
                   focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-400
                   disabled:opacity-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='6' viewBox='0 0 8 6'><path d='M1 1l3 3 3-3' stroke='%2371717a' fill='none'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "22px",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}