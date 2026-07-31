// Custom 2D collision on the XZ plane (spec §9.3, preferred v1 approach).
// Pure functions — no three.js imports — so this file is unit-testable.

import type { CollisionShape, CollisionWorld, Rect, Vec2 } from '../../types/game';

export function pointInRect(p: Vec2, rect: Rect): boolean {
  return p[0] >= rect.min[0] && p[0] <= rect.max[0] && p[1] >= rect.min[1] && p[1] <= rect.max[1];
}

export function inWalkable(p: Vec2, walkable: Rect[]): boolean {
  return walkable.some((r) => pointInRect(p, r));
}

/** Push a circle of `radius` at `p` out of a single blocker. Returns a new point. */
export function pushOut(p: Vec2, radius: number, shape: CollisionShape): Vec2 {
  if (shape.type === 'circle') {
    const dx = p[0] - shape.center[0];
    const dz = p[1] - shape.center[1];
    const distSq = dx * dx + dz * dz;
    const minDist = radius + shape.radius;
    if (distSq >= minDist * minDist) return p;
    const dist = Math.sqrt(distSq);
    if (dist < 1e-6) return [shape.center[0] + minDist, shape.center[1]];
    const scale = minDist / dist;
    return [shape.center[0] + dx * scale, shape.center[1] + dz * scale];
  }

  // box: closest point on the AABB to p
  const minX = shape.center[0] - shape.halfExtents[0];
  const maxX = shape.center[0] + shape.halfExtents[0];
  const minZ = shape.center[1] - shape.halfExtents[1];
  const maxZ = shape.center[1] + shape.halfExtents[1];
  const cx = Math.max(minX, Math.min(maxX, p[0]));
  const cz = Math.max(minZ, Math.min(maxZ, p[1]));
  const dx = p[0] - cx;
  const dz = p[1] - cz;
  const distSq = dx * dx + dz * dz;
  if (distSq >= radius * radius && distSq > 0) return p;
  if (distSq > 1e-12) {
    // outside the box but overlapping — push along the contact normal
    const dist = Math.sqrt(distSq);
    const scale = radius / dist;
    return [cx + dx * scale, cz + dz * scale];
  }
  // center inside the box — push out along the smallest penetration axis
  const pushLeft = p[0] - minX + radius;
  const pushRight = maxX - p[0] + radius;
  const pushUp = p[1] - minZ + radius;
  const pushDown = maxZ - p[1] + radius;
  const min = Math.min(pushLeft, pushRight, pushUp, pushDown);
  if (min === pushLeft) return [minX - radius, p[1]];
  if (min === pushRight) return [maxX + radius, p[1]];
  if (min === pushUp) return [p[0], minZ - radius];
  return [p[0], maxZ + radius];
}

function clearOfBlockers(p: Vec2, radius: number, blockers: CollisionShape[]): Vec2 {
  let out = p;
  for (let iter = 0; iter < 2; iter++) {
    for (const b of blockers) out = pushOut(out, radius, b);
  }
  return out;
}

/**
 * Resolve a proposed move: push out of blockers, keep the player inside the
 * walkable union, and slide along walls by trying X-only / Z-only movement.
 */
export function resolveCollisions(
  current: Vec2,
  proposed: Vec2,
  radius: number,
  world: CollisionWorld,
): Vec2 {
  const full = clearOfBlockers(proposed, radius, world.blockers);
  if (inWalkable(full, world.walkable)) return full;

  const xOnly = clearOfBlockers([proposed[0], current[1]], radius, world.blockers);
  if (inWalkable(xOnly, world.walkable)) return xOnly;

  const zOnly = clearOfBlockers([current[0], proposed[1]], radius, world.blockers);
  if (inWalkable(zOnly, world.walkable)) return zOnly;

  return current;
}
