
export function SelectInput<V extends string >({
  value, options, onChange, ariaLabel,
}: {
  value: V;
  options: ReadonlyArray<{ value: V; label: string }>;
  onChange: (v: V) => void;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as V)}
      className="w-full rounded border border-amber-700 bg-amber-950 px-3 py-2 text-sm text-amber-100 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}