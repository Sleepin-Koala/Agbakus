
import { useMemo } from "react";
import { useModel } from "../store/models";
import { calculerFacteur } from "../domain/factor";
import {
  FiActivity,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiGrid,
  FiAlertTriangle,
  FiZap,
} from "react-icons/fi";
import type { IconType } from "react-icons";

type Ton = "normal" | "ok" | "alerte";

function Item({
  label,
  value,
  ton = "normal",
  icon: Icon,
}: {
  label: string;
  value: string;
  ton?: Ton;
  icon?: IconType;
}) {
  const couleurs = {
    normal: "text-slate-200",
    ok: "text-emerald-400",
    alerte: "text-red-400",
  };

  return (
    <div
      className="
        flex shrink-0 items-center gap-2
        border-l border-white/[0.08]
        pl-3
      "
      title={`${label} : ${value}`}
    >
      {Icon && (
        <Icon
          size={13}
          className="text-slate-500 shrink-0"
        />
      )}

      <div className="flex items-center gap-1.5">
        <span className="
          text-[10px] font-medium
          uppercase tracking-wider
          text-slate-500
        ">
          {label}
        </span>

        <span className={`
          text-[11px] font-medium
          font-mono tabular-nums
          ${couleurs[ton]}
        `}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default function StatusBar() {
  const geometry = useModel((s) => s.geometry);
  const materiau = useModel((s) => s.materiau);
  const load = useModel((s) => s.load);
  const mesh = useModel((s) => s.mesh);
  const result = useModel((s) => s.result);

  // Calcul dérivé
  const facteur = useMemo(
    () =>
      result
        ? calculerFacteur(result.noeuds, result.deplacements)
        : null,
    [result]
  );

  // État général
  const statut = result
    ? "Calcul terminé"
    : geometry
      ? "Modèle en préparation"
      : "En attente";

  const statutCouleur = result
    ? "bg-emerald-400"
    : geometry
      ? "bg-amber-400"
      : "bg-slate-500";

  // Dimensions
  const dims = !geometry
    ? null
    : geometry.type === "pave"
      ? `${geometry.longueur} × ${geometry.largeur} × ${geometry.hauteur} mm`
      : `R ${geometry.rayon} × H ${geometry.hauteur} mm`;

  // Maillage
  const nbNoeuds =
    result?.noeuds.length ??
    mesh?.noeuds.length ??
    null;

  // Résultats
  const elastique = result?.verifications.domaine_elastique;

  return (
    <footer className="
      flex h-11 w-full shrink-0
      items-center gap-4
      overflow-hidden
      border-t border-white/[0.07]
      bg-[#0b1020]
      px-4
      select-none
    ">

      {/* État général */}
      <div className="
        flex shrink-0 items-center gap-2.5
        min-w-fit
      ">
        <div className={`
          h-2 w-2 rounded-full
          ${statutCouleur}
          ${result ? "shadow-[0_0_8px_rgba(52,211,153,0.5)]" : ""}
        `} />

        <span className="text-[11px] font-medium text-slate-300">
          {statut}
        </span>
      </div>

      {/* Informations du modèle */}
      <div className="
        flex flex-1 min-w-0 items-center gap-4
        overflow-x-auto whitespace-nowrap
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      ">

        {geometry && (
          <Item
            label="Géométrie"
            value={dims!}
            icon={FiBox}
          />
        )}

        {materiau && (
          <Item
            label="Matériau"
            value={materiau.nom}
            icon={FiDroplet}
          />
        )}

        {nbNoeuds !== null && (
          <Item
            label="Nœuds"
            value={String(nbNoeuds)}
            icon={FiGrid}
          />
        )}

        {load && (
          <Item
            label={load.sollicitation}
            value={`${load.value} N`}
            icon={FiActivity}
          />
        )}

        {/* Résultats de simulation */}
        {result && (
          <>
            <Item
              label="Facteur"
              value={
                facteur !== null && Number.isFinite(facteur)
                  ? `×${facteur.toFixed(0)}`
                  : "—"
              }
              icon={FiZap}
            />

            <Item
              label="Contrainte"
              value={`${result.resultats.contrainte.toPrecision(3)} MPa`}
            />

            <Item
              label="Déformation"
              value={result.resultats.deformation.toExponential(2)}
            />

            <Item
              label="Allongement"
              value={`${result.resultats.allongement.toPrecision(3)} mm`}
            />

            <Item
              label="Élastique"
              value={elastique ? "Conforme" : "Non fiable"}
              ton={elastique ? "ok" : "alerte"}
              icon={elastique ? FiCheckCircle : FiAlertTriangle}
            />

            <Item
              label="Calcul"
              value={`${result.temps_calcul_ms} ms`}
              icon={FiClock}
            />
          </>
        )}
      </div>
    </footer>
  );
}
