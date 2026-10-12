// Minimap maths: world XZ → map pixels, compass bearings, nearest-unvisited.
// Pure — unit-testable. The camera has fixed yaw looking toward −Z, so
// map-x = world-x and map-y = world-z with no rotation ("north" is −Z).

import type { Vec2 } from '../../types/game';
import type { ResumeSection } from '../../types/resume';
import { ISLAND } from '../world/layout';
import { SECTION_LABELS } from '../../app/routeMap';

export const MAP_W = 120;
export const MAP_H = 96;

type Island = { minX: number; maxX: number; minZ: number; maxZ: number };

export function worldToMap(x: number, z: number, w = MAP_W, h = MAP_H, island: Island = ISLAND): Vec2 {
  return [
    ((x - island.minX) / (island.maxX - island.minX)) * w,
    ((z - island.minZ) / (island.maxZ - island.minZ)) * h,
  ];
}

export function mapToWorld(px: number, py: number, w = MAP_W, h = MAP_H, island: Island = ISLAND): Vec2 {
  return [
    island.minX + (px / w) * (island.maxX - island.minX),
    island.minZ + (py / h) * (island.maxZ - island.minZ),
  ];
}

/** Bearing in degrees, 0 = north (−Z), 90 = east (+X), clockwise. */
export function bearingDeg(fromX: number, fromZ: number, toX: number, toZ: number): number {
  const deg = (Math.atan2(toX - fromX, -(toZ - fromZ)) * 180) / Math.PI;
  return (deg + 360) % 360;
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export type Compass = (typeof COMPASS)[number];

export function compassLabel(deg: number): Compass {
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return COMPASS[idx];
}

const COMPASS_WORDS: Record<Compass, string> = {
  N: 'north',
  NE: 'north-east',
  E: 'east',
  SE: 'south-east',
  S: 'south',
  SW: 'south-west',
  W: 'west',
  NW: 'north-west',
};

export function nearestUnvisited(
  px: number,
  pz: number,
  signs: Record<ResumeSection, Vec2>,
  visited: readonly ResumeSection[],
): { section: ResumeSection; dist: number; bearing: number } | null {
  let best: { section: ResumeSection; dist: number; bearing: number } | null = null;
  for (const section of Object.keys(signs) as ResumeSection[]) {
    if (visited.includes(section)) continue;
    const [sx, sz] = signs[section];
    const dist = Math.hypot(sx - px, sz - pz);
    if (!best || dist < best.dist) {
      best = { section, dist, bearing: bearingDeg(px, pz, sx, sz) };
    }
  }
  return best;
}

/** Hit-test map markers; returns the id of the closest within `hitRadius` px. */
export function markerAt(
  px: number,
  py: number,
  markers: { id: string; x: number; y: number }[],
  hitRadius = 6,
): string | null {
  let best: { id: string; d: number } | null = null;
  for (const m of markers) {
    const d = Math.hypot(m.x - px, m.y - py);
    if (d <= hitRadius && (!best || d < best.d)) best = { id: m.id, d };
  }
  return best?.id ?? null;
}

/** Screen-reader description of the map state. */
export function describeMap(
  px: number,
  pz: number,
  signs: Record<ResumeSection, Vec2>,
  visited: readonly ResumeSection[],
): string {
  const next = nearestUnvisited(px, pz, signs, visited);
  if (!next) return 'Minimap. Every section has been visited.';
  const word = COMPASS_WORDS[compassLabel(next.bearing)];
  return `Minimap. Nearest unvisited: ${SECTION_LABELS[next.section]}, ${Math.round(next.dist)} m to the ${word}.`;
}
