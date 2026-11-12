import type { ReactNode } from "react";
import type { IconType } from "react-icons";

export function PanelShell({ title, icon: HeaderIcon, selected, footer, children }: {
  title: string;
  icon: IconType;
  selected?: { icon: IconType; label: string; status?: string };
  footer?: ReactNode;
  children: ReactNode;
}) {
  const SelectedIcon = selected?.icon;
  return (
    <div className="flex h-full flex-col bg-amber-900 text-amber-100 max-w-sm border border-amber-700">
      <div className="flex items-center justify-between border-b border-amber-700/50 p-3">
        <span className="text-sm font-semibold text-amber-100">{title}</span>
        <HeaderIcon aria-hidden className="text-base text-amber-400" />
      </div>

      {selected && SelectedIcon ? (
        <div className="border-b border-amber-700/50 bg-amber-950/40 p-3">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-amber-300/70">
            Élément sélectionné
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <SelectedIcon aria-hidden className="shrink-0 text-lg text-amber-400" />
              <span className="truncate text-sm font-medium text-amber-100">{selected.label}</span>
            </div>
            {selected.status ? (
              <span className="shrink-0 rounded bg-green-500/20 px-2 py-0.5 text-[11px] text-green-300">
                {selected.status}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto p-3">{children}</div>

      {footer ? <div className="border-t border-amber-700/50 bg-amber-950/40 p-3">{footer}</div> : null}
    </div>
  );
}