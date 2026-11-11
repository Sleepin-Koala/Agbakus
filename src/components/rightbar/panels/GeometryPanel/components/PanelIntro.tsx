import type { ReactNode } from "react";

export function PanelIntro({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-snug text-amber-200/80">{children}</p>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-amber-200">{label}</span>
      </div>
      {children}
    </div>
  );
}