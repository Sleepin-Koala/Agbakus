import * as React from "react";
import { cx } from "./cx";

interface SectionGroupProps {
  /** Per-step storage key, e.g. "geometry.dims" — collapse state is remembered. */
  storageKey: string;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function read(storageKey: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(`rightbar.group.${storageKey}`);
    return raw === null ? fallback : raw === "1";
  } catch {
    return fallback;
  }
}

/** Collapsible micro-label section with hairline divider; state persists per key. */
export default function SectionGroup({ storageKey, title, badge, defaultOpen = true, children }: SectionGroupProps) {
  const [open, setOpen] = React.useState(() => read(storageKey, defaultOpen));

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(`rightbar.group.${storageKey}`, next ? "1" : "0");
      } catch { /* storage unavailable — collapse still works for the session */ }
      return next;
    });
  };


  return (
    <section className="border-b border-[#2a2c33]">
      <button
        type="button" onClick={toggle} aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-400"
      >
        <svg aria-hidden viewBox="0 0 8 8"
          className={cx(
            "h-2 w-2 shrink-0 text-zinc-500 transition-transform duration-150 motion-reduce:transition-none",
            open ? "rotate-90" : "rotate-0"
          )}>
          <path d="M1.5 1l4.5 3-4.5 3z" fill="currentColor" />
        </svg>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{title}</h3>
        {badge ? <span className="ml-auto font-mono text-[10px] tabular-nums text-zinc-600">{badge}</span> : null}
      </button>
      {open ? <div className="flex flex-col gap-2.5 px-3 pb-3 pt-0.5">{children}</div> : null}
    </section>
  );
}