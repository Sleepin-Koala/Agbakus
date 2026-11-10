import type { Vector3D } from "./core";

export interface BoundaryConditions {
  type: "encastrement";
  appui : "face"
  target : Vector3D
}
