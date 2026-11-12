
import { useWorkState, type WorkState } from "../../store/modules";
import {
  FiBox,
  FiDroplet,
  FiAnchor,
  FiArrowDown,
  FiGrid,
  FiBarChart2,
} from "react-icons/fi";
import type { IconType } from "react-icons";

type NavigationItem = {
  id: WorkState;
  name: string;
  icon: IconType;
};

const navigationItems: NavigationItem[] = [
  { id: "geometry", name: "Géométrie", icon: FiBox },
  { id: "material", name: "Matériau", icon: FiDroplet },
  { id: "support", name: "Support", icon: FiAnchor },
  { id: "load", name: "Charge", icon: FiArrowDown },
  { id: "mesh", name: "Maillage", icon: FiGrid },
  { id: "job", name: "Résultats", icon: FiBarChart2 },
];

export default function Leftbar() {
  const work = useWorkState((p) => p);

  return (
    <aside className="
      relative isolate flex flex-col
      w-[204px] min-w-[204px] h-full shrink-0
      overflow-hidden
      bg-[#11182b]
      border-r border-white/[0.06]
      text-white
    ">

      {/* Navigation */}
      <nav className="relative z-10 flex flex-col gap-1 px-3 pt-6">

        {navigationItems.map((item) => {
          const isActive = item.id === work.currentWorkState;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => work.SetCurrentWorkState(item.id)}
              aria-current={isActive ? "step" : undefined}
              className={`
                group relative flex items-center gap-3
                w-full h-[52px] px-4
                rounded-xl
                text-[14px] font-medium
                transition-all duration-200
                outline-none
                focus-visible:ring-2 focus-visible:ring-blue-400

                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="
                  absolute left-0 top-1/2 -translate-y-1/2
                  w-[3px] h-6 rounded-r-full
                  bg-white/90
                " />
              )}

              <Icon
                size={21}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={`
                  shrink-0 transition-transform duration-200
                  ${!isActive && "group-hover:scale-110"}
                `}
              />

              <span>{item.name}</span>

              {isActive && (
                <span className="
                  ml-auto w-1.5 h-1.5 rounded-full
                  bg-white/90
                " />
              )}
            </button>
          );
        })}

      </nav>

      {/* Bottom decoration */}
      <div className="
        absolute bottom-0 left-0
        w-full h-64
        pointer-events-none
        overflow-hidden
      ">
        <div className="
          absolute -bottom-24 -left-20
          w-64 h-48 rounded-full
          bg-blue-600/20 blur-[70px]
        " />

        <div className="
          absolute bottom-0 -right-20
          w-48 h-32 rounded-full
          bg-indigo-600/20 blur-[60px]
        " />
      </div>

      {/* Footer */}
      <div className="
        relative z-10 mt-auto
        px-5 py-6
        border-t border-white/[0.06]
      ">
        <p className="text-[13px] font-semibold text-slate-300">
          FEM Studio
          <span className="ml-2 text-[10px] font-normal text-slate-500">
            v1.0
          </span>
        </p>

        <p className="
          mt-2 text-[10px]
          text-slate-500 tracking-wide
        ">
          Apprendre · Simuler · Explorer
        </p>
      </div>

    </aside>
  );
}
