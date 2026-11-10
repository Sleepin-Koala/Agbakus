import * as React from "react";
import { cx } from "../components/cx";

interface UnitInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  unit?: string;
  invalid?: boolean;
  className?: string;
}

/** Monospaced numeric input with an inline unit suffix, inset into the panel. */
export default function UnitInput({ unit, invalid, className, ...rest }: UnitInputProps) {
  return (
    <div
      className={cx(
        "flex items-stretch rounded-[3px] border bg-[#101114] transition-colors",
        invalid ? "border-red-500/70" : "border-[#2a2c33] hover:border-[#3a3d46]",
        "focus-within:border-amber-400 focus-within:outline-none",
        className
      )}
    >
      <input
        {...rest}
        inputMode="decimal"
        className={cx(
          "w-full min-w-0 bg-transparent px-2 py-1 font-mono text-[12px] tabular-nums text-zinc-200",
          "outline-none placeholder:text-zinc-600",
          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-400"
        )}
      />
      {unit ? (
        <span className="flex select-none items-center border-l border-[#2a2c33] px-1.5 font-mono text-[10px] text-zinc-500">
          {unit}
        </span>
      ) : null}
    </div>
  );
}