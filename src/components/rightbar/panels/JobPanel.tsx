import * as React from "react";
import { useState } from "react";
import { MdCheckCircle, MdCancel, MdPlayArrow, MdRefresh } from "react-icons/md";
import { useModel } from "../../../store/models"; // Ajuste le chemin selon ton projet
import { StoreMeshSettings } from "../../../store/states";
import api from "../../../api";
import useCalculs, { type RequeteSimulation } from "../../../hooks/useCalculs";

/* ========================================================================== *
 * COMPOSANT UI DE SECTION (Identique à SupportPanel)
 * ========================================================================== */

function SectionGroup({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-[#2a2c33] bg-amber-900 p-3 text-amber-100">
      <div className="mb-2 flex items-center justify-between border-b border-[#202227] pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">
          {title}
        </span>
        {badge ? (
          <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ========================================================================== *
 * LIGNE DE RÉSUMÉ D'UNE ÉTAPE
 * ========================================================================== */

function SummaryItem({
  label,
  isConfigured,
  detail,
}: {
  label: string;
  isConfigured: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-amber-950/60 pb-2 text-xs last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        {isConfigured ? (
          <MdCheckCircle className="shrink-0 text-base text-emerald-400" />
        ) : (
          <MdCancel className="shrink-0 text-base text-red-400" />
        )}
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-amber-100">
          {label}
        </span>
      </div>
      <span
        className={`text-right text-[11px] ${
          isConfigured ? "text-amber-200" : "italic text-amber-400/60"
        }`}
      >
        {detail}
      </span>
    </div>
  );
}

/* ========================================================================== *
 * COMPOSANT PRINCIPAL : JOB PANEL
 * ========================================================================== */

export default function JobPanel() {
  const { geometry, materiau, boundary, load, clean } = useModel((p) => p);
  const [isRunning, setIsRunning] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);
  const mesh = StoreMeshSettings((p)=>p.MeshSettings)


  const {lancerSimulation} = useCalculs();

  // Formatage des détails pour chaque paramètre
  const getGeometryDetail = () => {
    if (!geometry) return "Non défini";
    if (geometry.type === "pave" || geometry.type === "cylindre") {
      return `${geometry.type.toUpperCase()} (${geometry.longueur} × ${geometry.largeur} × ${geometry.hauteur} mm)`;
    }
  };

  const getMateriauDetail = () => {
    if (!materiau) return "Non défini";
    return `${materiau.nom} (E: ${materiau.module_young} MPa)`;
  };

  const getMeshDetail = () => {
    if (!mesh) return "Non généré";
    if (mesh.nx && mesh.ny && mesh.nz) {
      return `Cartésien (${mesh.nx} × ${mesh.ny} × ${mesh.nz})`;
    }
    if (mesh.n_theta && mesh.n_z) {
      return `Cylindrique (θ: ${mesh.n_theta}, Z: ${mesh.n_z})`;
    }
    return "Configuré";
  };

  const getBoundaryDetail = () => {
    if (!boundary) return "Aucun appui";
    return `${boundary.type.toUpperCase()} (${boundary.appui} [${boundary.target.x}, ${boundary.target.y}, ${boundary.target.z}])`;
  };

  const getLoadDetail = () => {
    if (!load) return "Aucune charge";
    return `${load.value} N (Dir: [${load.target.x}, ${load.target.y}, ${load.target.z}])`;
  };

  // Vérification globale : les 5 étapes doivent être renseignées
  const configuredCount = [geometry, materiau, mesh, boundary, load].filter(Boolean).length;
  const isReady = configuredCount === 5;

  // Lancement de la simulation
  const handleRunSimulation = async () => {
    if (!isReady || isRunning) return;
    setIsRunning(true);

    try {
      const payload = { materiau ,geometrie: {...geometry}, sollicitation : "compression" , charge : {valeur : load?.value , direction : "x"}, encastrement : {axe: "z" ,cote : 'max'} };
      const res = await lancerSimulation(payload as RequeteSimulation)
      console.log(res)


      setJobSuccess(true);
    } catch (error) {
      console.error("Erreur lors du calcul :", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex max-w-sm flex-col gap-3 rounded border border-[#2a2c33] bg-amber-900 p-3 font-sans text-zinc-100">
      {/* SECTION RÉSUMÉ DU MODÈLE */}
      <SectionGroup title="Résumé du modèle" badge={`${configuredCount}/5 prêts`}>
        <div className="flex flex-col gap-2">
          <SummaryItem
            label="Géométrie"
            isConfigured={Boolean(geometry)}
            detail={getGeometryDetail()}
          />
          <SummaryItem
            label="Matériau"
            isConfigured={Boolean(materiau)}
            detail={getMateriauDetail()}
          />
          <SummaryItem
            label="Maillage"
            isConfigured={Boolean(mesh)}
            detail={getMeshDetail()}
          />
          <SummaryItem
            label="Appuis"
            isConfigured={Boolean(boundary)}
            detail={getBoundaryDetail()}
          />
          <SummaryItem
            label="Chargement"
            isConfigured={Boolean(load)}
            detail={getLoadDetail()}
          />
        </div>
      </SectionGroup>

      {/* MESSAGE D'AVERTISSEMENT SI INCOMPLET */}
      {!isReady && (
        <p className="rounded border border-amber-700/60 bg-amber-950/70 px-2.5 py-2 text-[11px] text-amber-300">
          Veuillez compléter toutes les étapes (croix rouges) avant de lancer le calcul.
        </p>
      )}

      {/* BOUTONS D'ACTION */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clean}
          title="Réinitialiser tout le modèle"
          className="flex items-center justify-center rounded border border-amber-700 bg-amber-950 px-3 py-2.5 text-amber-300 transition hover:bg-amber-800 hover:text-white"
        >
          <MdRefresh className="text-lg" />
        </button>

        <button
          type="button"
          onClick={handleRunSimulation}
          disabled={!isReady || isRunning}
          className={`flex w-full items-center justify-center gap-2 rounded px-3 py-2.5 text-sm font-semibold text-white shadow-md transition-all outline-none ${
            !isReady
              ? "cursor-not-allowed bg-zinc-700/60 text-zinc-400"
              : isRunning
              ? "scale-[0.98] cursor-wait bg-amber-600"
              : "cursor-pointer bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500"
          }`}
        >
          <MdPlayArrow className="text-lg" />
          <span>{isRunning ? "Calcul en cours..." : "Lancer la simulation"}</span>
        </button>
      </div>

      {/* POP-UP DE SUCCÈS */}
      {jobSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-lg border border-amber-700 bg-amber-900 p-5 text-center text-amber-100 shadow-2xl">
            <MdCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />
            <h3 className="mb-1 text-base font-semibold">Simulation terminée</h3>
            <p className="mb-4 text-xs text-amber-200/80">
              Le calcul éléments finis s'est exécuté avec succès. Les résultats sont disponibles.
            </p>
            <button
              type="button"
              onClick={() => setJobSuccess(false)}
              className="w-full rounded border border-amber-600 bg-amber-800 px-3 py-1.5 text-sm font-medium text-amber-100 transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Voir les résultats
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
