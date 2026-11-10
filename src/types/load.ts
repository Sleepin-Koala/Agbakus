import type { Vector3D } from "./core";

export interface Load {
  type: "force";
  value: number;
  target: Vector3D;
}