import { describe, expect, it } from 'vitest';
import { inWalkable, pushOut, resolveCollisions } from '../collisionSystem';
import type { CollisionWorld, Vec2 } from '../../../types/game';

const world: CollisionWorld = {
  walkable: [
    { min: [-10, -10], max: [10, 10] },
    // narrow corridor attached to the east edge
    { min: [10, -1], max: [15, 1] },
  ],
  blockers: [
    { type: 'circle', center: [0, 0], radius: 1 },
    { type: 'box', center: [5, 5], halfExtents: [1, 1] },
  ],
};

const R = 0.45;

describe('pushOut', () => {
  it('leaves non-overlapping points untouched', () => {
    const p: Vec2 = [3, 3];
    expect(pushOut(p, R, world.blockers[0])).toEqual(p);
  });

  it('pushes out of a circle blocker along the contact normal', () => {
    const [x, z] = pushOut([1.2, 0], R, world.blockers[0]);
    expect(z).toBeCloseTo(0);
    expect(x).toBeCloseTo(1.45); // circle r 1 + player r 0.45
  });

  it('pushes out of a box blocker', () => {
    const [x, z] = pushOut([3.8, 5], R, world.blockers[1]);
    expect(z).toBeCloseTo(5);
    expect(x).toBeCloseTo(3.55); // box west face at 4 minus radius
  });

  it('pushes a center inside the box out along the smallest axis', () => {
    const [x] = pushOut([4.2, 5], R, world.blockers[1]);
    expect(x).toBeCloseTo(3.55);
  });
});

describe('inWalkable', () => {
  it('accepts points in either rect of the union', () => {
    expect(inWalkable([0, 5], world.walkable)).toBe(true);
    expect(inWalkable([12, 0], world.walkable)).toBe(true);
  });
  it('rejects points outside the union', () => {
    expect(inWalkable([12, 5], world.walkable)).toBe(false);
  });
});

describe('resolveCollisions', () => {
  it('allows free movement in the open', () => {
    expect(resolveCollisions([2, 2], [2.1, 2.2], R, world)).toEqual([2.1, 2.2]);
  });

  it('blocks walking off the island edge and slides along it', () => {
    // moving diagonally into the north edge: x should advance, z clamps
    const [x, z] = resolveCollisions([0, -9.9], [0.3, -10.4], R, world);
    expect(x).toBeCloseTo(0.3);
    expect(z).toBeCloseTo(-9.9);
  });

  it('returns current position when fully stuck', () => {
    const tight: CollisionWorld = {
      walkable: [{ min: [-1, -1], max: [1, 1] }],
      blockers: [],
    };
    expect(resolveCollisions([0, 0], [5, 5], R, tight)).toEqual([0, 0]);
  });

  it('slides around a circular blocker instead of stopping dead', () => {
    const resolved = resolveCollisions([1.5, 0.2], [1.3, 0.2], R, world);
    const dist = Math.hypot(resolved[0], resolved[1]);
    expect(dist).toBeGreaterThanOrEqual(1.45 - 1e-6);
  });

  it('lets the player enter the corridor through the union seam', () => {
    const resolved = resolveCollisions([9.8, 0], [10.2, 0], R, world);
    expect(resolved[0]).toBeCloseTo(10.2);
  });
});
