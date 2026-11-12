import { useState, type ReactNode } from "react";
import { MdExpandMore } from "react-icons/md";

export function CollapsibleCard({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2 rounded border border-amber-800 bg-amber-950/50 p-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-xs font-medium text-amber-100"
      >
        <span>{title}</span>
        <MdExpandMore aria-hidden className={`text-base text-amber-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="space-y-1.5 border-t border-amber-800 pt-2 text-xs text-amber-200">{children}</div> : null}
    </div>
  );
}