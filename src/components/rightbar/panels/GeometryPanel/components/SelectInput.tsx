export function SelectInput<T extends string>({ value, onChange, options, ariaLabel }: {
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