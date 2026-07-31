import * as THREE from 'three';

// A static prop is a list of coloured geometry parts in prop-local space (base
// at origin, +Y up). The Island collects parts from every static prop and merges
// them by colour, so a whole island's props collapse to a handful of draw calls.
export interface Part {
  geo: THREE.BufferGeometry;
  color: string;
  cast?: boolean;
  receive?: boolean;
}

export type StaticBuilder = (seed: number) => Part[];

// A dynamic prop is an animated / interactive object that stays independent
// (lanterns with lights, chests that open, bobbing pedestals, turning gears).
export interface DynamicProp {
  object: THREE.Object3D;
  update?: (t: number, dt: number) => void;
  dispose: () => void;
  /** Optional attached light for disposal bookkeeping. */
  light?: THREE.Light;
}

export type DynamicBuilder = (seed: number) => DynamicProp;
