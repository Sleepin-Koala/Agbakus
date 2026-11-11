export function SelectInput<T extends string>({ value, onChange, options, ariaLabel, disabled }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel?: string; disabled?: boolean;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
      className={
        "w-full rounded border px-2.5 py-1.5 text-sm outline-none " +
        (disabled
          ? "border-amber-800/40 bg-amber-950/40 text-amber-300/40 cursor-not-allowed"
          : "border-amber-700 bg-amber-950 text-amber-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400")
      }
    >
      {options.length === 0 ? (
        <option value="" disabled>Chargement des matériaux...</option>
      ) : (
        options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))
      )}
    </select>
  );
}