import type { ReactNode } from "react";

export function Field({ label, badge, hint, children }: {
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