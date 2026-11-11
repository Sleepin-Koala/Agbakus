
export interface Materiau {
  nom: string;
  masse_volumique: number; // kg/m³
  module_young: number; // MPa
  coefficient_poisson: number;
  limite_elastique: number; // MPa
}
