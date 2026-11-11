import { useState, type ReactNode } from "react";

type HoldOnButtonProps = {
  onClick?: () => Promise<void> | void;
  onActive: boolean;

  children: ReactNode;
};

export function HoldOnButton({ onClick, children , onActive}: HoldOnButtonProps) {
  const [_, setIsActive] = useState(false);

  const handleClick = async () => {
    if (onActive || !onClick) return;
    setIsActive((prev)=>!prev);
    onClick();
  };


  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={onActive}
      className={`flex w-full items-center justify-center gap-2 rounded px-3 py-3 text-sm font-semibold text-white shadow-md transition-all outline-none
        ${onActive 
          ? "bg-amber-600 cursor-not-allowed scale-[0.98]" 
          : "bg-green-700 hover:bg-green-600 active:bg-green-500 cursor-pointer"
        }`}
    >
      
      <span>{onActive ? "Action en cours" : children}</span>
    </button>
  );
}
