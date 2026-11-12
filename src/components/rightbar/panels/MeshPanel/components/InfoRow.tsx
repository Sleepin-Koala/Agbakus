import type { ReactNode } from "react";

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className="text-right text-amber-100">{children}</span>
    </div>
  );
}