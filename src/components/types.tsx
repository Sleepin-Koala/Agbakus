export type CurrentWorkState = 'geometry' | 'material' | 'support' | 'mesh';

export type Primitive = "cube" | "cylinder" | "sphere" | "plate" | "cone" | "torus";

export interface RightbarProps {
  step: CurrentWorkState;
}