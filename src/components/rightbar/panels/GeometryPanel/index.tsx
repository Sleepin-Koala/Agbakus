import  { useState } from "react";
import { MdCategory, MdCheckCircle } from "react-icons/md";
import { useModel } from "../../../../store/models";
import { type GeometrySettings, DEFAULT_GEOMETRY_SETTINGS, type GeometryType } from "../../../../types/geometry";
import  { ActionButton } from "../../components/actionInput";
import NumberField from "../../components/NumberField";
import  { PanelIntro } from "./components/PanelIntro";
import  { PanelShell } from "./components/PanelShell";
import { SelectInput } from "./components/SelectInput";
import { Field } from "./components/Field";


const TYPES: ReadonlyArray<{ value: GeometryType; label: string; intro: string }> = [
  { value: "pave", label: "Cube / Parallélépipède", intro: "Dimensions du parallélépipède." },
  { value: "cylindre", label: "Cylindre", intro: "Dimensions du cylindre." },
];

type DimKey = "longueur" | "hauteur" | "largeur" | "rayon";

const DIMENSIONS: Record<GeometryType, ReadonlyArray<{ key: DimKey; label: string }>> = {
  pave: [
    { key: "longueur", label: "Longueur" },
    { key: "hauteur", label: "Hauteur" },
    { key: "largeur", label: "Largeur" },
  ],
  cylindre: [
    { key: "rayon", label: "Rayon" },
    { key: "hauteur", label: "Hauteur" },
  ],
};

export default function GeometryPanel() {
  const [settings, setSettings] = useState<GeometrySettings>(DEFAULT_GEOMETRY_SETTINGS);
  const [valid, setValid] = useState<boolean>(false);

  const set = (patch: Partial<GeometrySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const setGeometry = useModel((p) => p.setGeometry);

  const current = TYPES.find((s) => s.value === settings.type) ?? TYPES[0];

  const handleValidate = () => {
    setGeometry(settings);
    setValid(true);
  };

  return (
    <>
      <PanelShell
        title="Propriétés de la géométrie"
        icon={MdCategory}
        footer={
          <ActionButton icon={MdCheckCircle} onClick={handleValidate}>
            Valider la géométrie
          </ActionButton>
        }
      >
        <PanelIntro>Sélectionnez la forme de base puis ajustez ses dimensions.</PanelIntro>

        <Field label="Type de géométrie">
          <SelectInput<GeometryType>
            ariaLabel="Type de géométrie"
            value={settings.type}
            onChange={(type) => set({ type })}
            options={TYPES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>

        <div className="space-y-3">
          <PanelIntro>{current.intro}</PanelIntro>
          {DIMENSIONS[settings.type].map((d) => (
            <NumberField
              key={d.key}
              id={`geo-${d.key}`}
              label={d.label}
              unit="mm"
              value={settings[d.key] || 0}
              min={0.1}
              step={0.5}
              onChange={(v) => set({ [d.key]: v })}
            />
          ))}
        </div>
      </PanelShell>

      {/* Overlay Pop-up de confirmation */}
      {valid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-lg border border-amber-700 bg-amber-900 p-5 text-center text-amber-100 shadow-2xl">
            <MdCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />
            <h3 className="mb-1 text-base font-semibold">Géométrie validée</h3>
            <p className="mb-4 text-xs text-amber-200/80">
              Les paramètres de la forme ont bien été enregistrés.
            </p>
            <button
              type="button"
              onClick={() => setValid(false)}
              className="w-full rounded border border-amber-600 bg-amber-800 px-3 py-1.5 text-sm font-medium text-amber-100 transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Fermer
            </button>
          </div>
        </div>

        


      )}
    </>
  );
}
