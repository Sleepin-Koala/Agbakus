import * as React from "react";
import { cx } from "../components/cx";

interface RadioCardProps {
  id: string;
  selected: boolean;
  onSelect: () => void;
  /** Arrow-key roving focus: parent moves focus & selection to a sibling. */
  onNavigate: (dir: 1 | -1) => void;
  title: string;
  caption?: string;
  icon: React.ReactNode;
}

/**
 * Primitive selector card (role="radio"). Roving tabindex, arrow-key
 * navigation, visible amber focus ring, aria-checked state.
 */
export default function RadioCard({ id, selected, onSelect, onNavigate, title, caption, icon }: RadioCardProps) {


  return (
    <div
      id={id}
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); onNavigate(1); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); onNavigate(-1); }
        else if (e.key === " " || e.key === "Enter") { e.preventDefault(); onSelect(); }
      }}
      className={cx(
        "flex cursor-pointer select-none items-center gap-2 rounded-[3px] border px-2 py-1.5 transition-colors motion-reduce:transition-none",
        selected
          ? "border-amber-400/80 bg-amber-400/10 text-amber-300"
          : "border-[#2a2c33] bg-[#101114] text-zinc-400 hover:border-[#3a3d46] hover:text-zinc-300",
      )}
    >
      <span aria-hidden className={cx("h-6 w-6 shrink-0 [&>svg]:h-full [&>svg]:w-full", selected ? "text-amber-300" : "text-zinc-500")}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium leading-tight">{title}</span>
        {caption ? <span className="block truncate font-mono text-[10px] leading-tight text-zinc-600">{caption}</span> : null}
      </span>
    </div>
  );
}