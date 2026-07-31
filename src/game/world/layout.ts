// ─────────────────────────────────────────────────────────────────────────────
// The island layout — single source of truth for coordinates, zones, heights,
// walkable regions, and blockers (spec §8, §14.2). Consumed by the visual
// components AND the collision/height systems so they can never drift apart.
//
// Axes: X right, Z toward the camera (screen-down). Island footprint
// X ∈ [−15, 15], Z ∈ [−12, 12]. Lowland ground y = 0, water y = −0.6.
// ─────────────────────────────────────────────────────────────────────────────

import type { Plateau, Ramp, Rect, Vec2, Vec3, WorldZone, CollisionShape } from '../../types/game';

export const ISLAND = { minX: -15, maxX: 15, minZ: -12, maxZ: 12 };
export const WATER_Y = -0.6;
export const PLAYER_RADIUS = 0.45;
export const SPAWN: Vec3 = [0, 0, 0.5];

// ── Heights ──────────────────────────────────────────────────────────────────

export const PLATEAUS: Plateau[] = [
  // Experience Ridge (NW)
  { rect: { min: [-13.5, -11], max: [-4.5, -5] }, y: 1.2 },
  // Projects knoll (NE)
  { rect: { min: [4.5, -11], max: [13.5, -5] }, y: 1.0 },
  // Identity-board terrace (N center)
  { rect: { min: [-3, -11], max: [3, -6.5] }, y: 0.9 },
];

export const RAMPS: Ramp[] = [
  // Experience stairs (down the ridge's SE corner)
  { rect: { min: [-6.6, -5.1], max: [-4.4, -3] }, axis: 'z', from: 1.2, to: 0 },
  // Projects stairs
  { rect: { min: [5.4, -5.1], max: [7.6, -3] }, axis: 'z', from: 1.0, to: 0 },
  // Terrace steps down to the central path
  { rect: { min: [-1.1, -6.6], max: [1.1, -4.4] }, axis: 'z', from: 0.9, to: 0 },
];

// ── Walkable union ───────────────────────────────────────────────────────────

export const WALKABLE: Rect[] = [
  // Main lowland
  { min: [-13.5, -4.5], max: [13.5, 9] },
  // Experience plateau top (inset from cliff edges)
  { min: [-13, -10.5], max: [-5, -5] },
  // Projects plateau top
  { min: [5, -10.5], max: [13, -5] },
  // Identity terrace
  { min: [-2.5, -10.4], max: [2.5, -6.4] },
  // Stair rects (connect plateaus to lowland)
  ...RAMPS.map((r) => r.rect),
  // Stone bridge strip off the south edge (dead-ends at the rail)
  { min: [-1.2, 9], max: [1.2, 12.3] },
];

// ── Landmark positions ───────────────────────────────────────────────────────

export const POSITIONS = {
  identityBoard: [0, -9.3] as Vec2,
  house: [9.5, -8] as Vec2,
  caveArch: [-9.5, -8.5] as Vec2,
  pond: [10.8, 1.8] as Vec2,
  pondRadius: 2.4,
  shrine: [4.5, 8.4] as Vec2,
  bridge: [0, 10.5] as Vec2,
  fencePen: { min: [-11, 1] as Vec2, max: [-7, 4] as Vec2 },
  signs: {
    experience: [-7.5, -6] as Vec2,
    projects: [7, -6] as Vec2,
    skills: [-6.2, 2.7] as Vec2,
    about: [7.6, 3.2] as Vec2,
    certifications: [3.2, 7.8] as Vec2,
    contact: [-5.5, 7.5] as Vec2,
  },
};

export const TREES: { pos: Vec2; scale: number }[] = [
  { pos: [-13.2, -2.8], scale: 1.1 },
  { pos: [-12.6, 5.2], scale: 0.9 },
  { pos: [13, -10.2], scale: 1.0 },
  { pos: [12.6, 7.6], scale: 1.15 },
  { pos: [-12.8, -9.6], scale: 0.85 },
  { pos: [3.4, -3.4], scale: 0.8 },
  { pos: [-3.6, 5.8], scale: 0.75 },
];

export const ROCKS: { pos: Vec2; scale: number }[] = [
  { pos: [-11.6, -6.2], scale: 1.0 },
  { pos: [12.2, 3.8], scale: 0.8 },
  { pos: [-2.8, 8.6], scale: 0.7 },
  { pos: [11.8, -4.2], scale: 0.9 },
];

// ── Zones (HUD location label) ───────────────────────────────────────────────

export const ZONES: WorldZone[] = [
  { id: 'experience', label: 'Experience Ridge', center: [-8, -6.5], radius: 4 },
  { id: 'projects', label: 'Projects Workshop', center: [8, -6.5], radius: 4 },
  { id: 'skills', label: 'Skills Grove', center: [-8.5, 2.5], radius: 3.5 },
  { id: 'about', label: 'About Overlook', center: [8, 3.2], radius: 3.5 },
  { id: 'certifications', label: 'Certifications Shrine', center: [3.8, 8], radius: 3 },
  { id: 'contact', label: 'Contact Dock', center: [-5, 7.8], radius: 3 },
];

// ── Blockers ─────────────────────────────────────────────────────────────────

const signBlockers: CollisionShape[] = Object.values(POSITIONS.signs).map((pos) => ({
  type: 'circle',
  center: pos,
  radius: 0.35,
}));

const pen = POSITIONS.fencePen;
const penMidZ = (pen.min[1] + pen.max[1]) / 2;

export const BLOCKERS: CollisionShape[] = [
  { type: 'box', center: POSITIONS.house, halfExtents: [2.3, 1.9] },
  { type: 'circle', center: POSITIONS.caveArch, radius: 2.2 },
  { type: 'box', center: POSITIONS.identityBoard, halfExtents: [3.3, 0.6] },
  { type: 'circle', center: POSITIONS.pond, radius: POSITIONS.pondRadius + 0.2 },
  { type: 'circle', center: POSITIONS.shrine, radius: 0.9 },
  // Fence pen — west, north, south walls; east wall split by a gate.
  { type: 'box', center: [pen.min[0], penMidZ], halfExtents: [0.15, (pen.max[1] - pen.min[1]) / 2] },
  { type: 'box', center: [(pen.min[0] + pen.max[0]) / 2, pen.min[1]], halfExtents: [(pen.max[0] - pen.min[0]) / 2, 0.15] },
  { type: 'box', center: [(pen.min[0] + pen.max[0]) / 2, pen.max[1]], halfExtents: [(pen.max[0] - pen.min[0]) / 2, 0.15] },
  { type: 'box', center: [pen.max[0], pen.min[1] + 0.6], halfExtents: [0.15, 0.6] },
  { type: 'box', center: [pen.max[0], pen.max[1] - 0.4], halfExtents: [0.15, 0.4] },
  ...signBlockers,
  ...TREES.map(
    (t): CollisionShape => ({ type: 'circle', center: t.pos, radius: 0.5 * t.scale }),
  ),
  ...ROCKS.map(
    (r): CollisionShape => ({ type: 'circle', center: r.pos, radius: 0.55 * r.scale }),
  ),
];
