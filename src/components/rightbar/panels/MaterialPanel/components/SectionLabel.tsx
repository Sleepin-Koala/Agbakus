import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="block text-[11px] font-medium uppercase tracking-wider text-amber-300/70">{children}</span>;
}