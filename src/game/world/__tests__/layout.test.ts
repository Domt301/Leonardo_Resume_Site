import { describe, expect, it } from 'vitest';
import { BLOCKERS, BUSHES, PLAYER_RADIUS, POSITIONS, WALKABLE } from '../layout';
import { inWalkable, pointInRect, pushOut } from '../../systems/collisionSystem';
import { BUSH_RADIUS } from '../../systems/pickupSystem';

describe('BUSHES placement invariants', () => {
  it('every bush is walkable, clear of blockers, signs and the pen', () => {
    for (const b of BUSHES) {
      expect(inWalkable(b.pos, WALKABLE)).toBe(true);
      const clearance = BUSH_RADIUS * b.scale + PLAYER_RADIUS;
      for (const shape of BLOCKERS) {
        // pushOut returns the same reference when there is no overlap
        expect(pushOut(b.pos, clearance, shape)).toBe(b.pos);
      }
      for (const sign of Object.values(POSITIONS.signs)) {
        expect(Math.hypot(sign[0] - b.pos[0], sign[1] - b.pos[1])).toBeGreaterThanOrEqual(2.5);
      }
      expect(pointInRect(b.pos, POSITIONS.fencePen)).toBe(false);
    }
  });
});
