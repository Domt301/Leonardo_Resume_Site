// ─────────────────────────────────────────────────────────────────────────────
// World / gameplay types (spec §9.4, §14.2–14.3). Pure data — no three imports.
// ─────────────────────────────────────────────────────────────────────────────

import type { ResumeSection } from './resume';

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

/** Axis-aligned rectangle on the XZ plane. */
export interface Rect {
  min: Vec2;
  max: Vec2;
}

export type CollisionShape =
  | { type: 'circle'; center: Vec2; radius: number }
  | { type: 'box'; center: Vec2; halfExtents: Vec2 };

export interface CollisionWorld {
  /** Union of walkable rects (player center must stay inside, inset by radius). */
  walkable: Rect[];
  blockers: CollisionShape[];
}

/** An interactive landmark (spec §9.4). */
export interface WorldInteractable {
  id: string;
  label: string;
  section: ResumeSection;
  position: Vec3;
  interactionRadius: number;
  route: string;
  prompt: string;
  priority?: number;
  disabled?: boolean;
}

/** A named region used for the HUD location label (spec §14.2). */
export interface WorldZone {
  id: ResumeSection | 'spawn';
  label: string;
  center: Vec2;
  radius: number;
}

/** Flat plateau region: inside `rect`, ground level is `y`. */
export interface Plateau {
  rect: Rect;
  y: number;
  /** Top surface material (default grass). */
  top?: 'grass' | 'stone';
}

/** Linear ramp (stairs) along `axis` from `from` (at rect min) to `to` (at rect max). */
export interface Ramp {
  rect: Rect;
  axis: 'x' | 'z';
  /** Height at the rect's min edge on `axis`. */
  from: number;
  /** Height at the rect's max edge on `axis`. */
  to: number;
}

export type QualityPreset = 'low' | 'medium' | 'high';
