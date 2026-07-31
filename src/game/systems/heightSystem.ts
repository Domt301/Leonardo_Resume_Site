// Region-based ground height (spec §9.3): flat lowland, plateau rects, and
// linear ramp rects for stairs. Pure — unit-testable.

import type { Plateau, Ramp } from '../../types/game';
import { pointInRect } from './collisionSystem';
import { PLATEAUS, RAMPS } from '../world/layout';

export function heightAt(
  x: number,
  z: number,
  plateaus: Plateau[] = PLATEAUS,
  ramps: Ramp[] = RAMPS,
): number {
  // Ramps win inside their rect (they overlap plateau/lowland edges).
  for (const r of ramps) {
    if (pointInRect([x, z], r.rect)) {
      const axisIdx = r.axis === 'x' ? 0 : 1;
      const v = axisIdx === 0 ? x : z;
      const t = (v - r.rect.min[axisIdx]) / (r.rect.max[axisIdx] - r.rect.min[axisIdx]);
      return r.from + (r.to - r.from) * Math.max(0, Math.min(1, t));
    }
  }
  for (const p of plateaus) {
    if (pointInRect([x, z], p.rect)) return p.y;
  }
  return 0;
}
