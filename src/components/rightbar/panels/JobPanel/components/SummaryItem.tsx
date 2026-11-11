import { MdCancel, MdCheckCircle } from "react-icons/md";

export function SummaryItem({
  label,
  isConfigured,
  detail,
}: {
  label: string;
  isConfigured: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-amber-950/60 pb-2 text-xs last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        {isConfigured ? (
          <MdCheckCircle className="shrink-0 text-base text-emerald-400" />
        ) : (
          <MdCancel className="shrink-0 text-base text-red-400" />
        )}
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-amber-100">
          {label}
        </span>
      </div>
      <span
        className={`text-right text-[11px] ${
          isConfigured ? "text-amber-200" : "italic text-amber-400/60"
        }`}
      >
        {detail}
      </span>
    </div>
  );
}