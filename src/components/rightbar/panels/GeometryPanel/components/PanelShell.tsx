import type { ReactNode } from "react";
import type { IconType } from "react-icons";

export function PanelShell({ title, icon: HeaderIcon, footer, children }: {
  title: string; icon: IconType; footer?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-amber-900 text-amber-100 max-w-sm border border-amber-700">
      <div className="flex items-center justify-between border-b border-amber-700/50 p-3">
        <span className="text-sm font-semibold text-amber-100">{title}</span>
        <HeaderIcon aria-hidden className="text-base text-amber-400" />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-3">{children}</div>
      {footer ? <div className="border-t border-amber-700/50 bg-amber-950/40 p-3">{footer}</div> : null}
    </div>
  );
}