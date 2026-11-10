import type { ReactNode } from "react";
import type { IconType } from "react-icons";

export function ActionButton({ icon: Icon, onClick, children }: { 
  icon?: IconType; onClick?: () => void; children: ReactNode 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded bg-green-700 px-3 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-600 active:bg-green-500"
    >
      {Icon ? <Icon aria-hidden className="text-lg" /> : null}
      {children}
    </button>
  );
}