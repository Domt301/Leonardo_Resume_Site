// Chicken behaviour: deterministic wander, bump counting, aggro and chase.
// Pure functions over a mutable Flock — no three.js, no React — unit-testable.

import type { Rect, Vec2 } from '../../types/game';

export const CHICKEN_RADIUS = 0.25;
export const BUMPS_TO_ANGER = 3;
/**
 * One contact counts as one bump for the whole flock; anything else inside
 * this window is ignored, so brushing two chickens at once is still one bump.
 */
export const BUMP_COOLDOWN_S = 0.6;
/** Bumps are forgotten if the player leaves the chickens alone this long. */
export const BUMP_MEMORY_S = 20;
export const ANGRY_DURATION_S = 12;
export const CALM_SPEED = 0.5;
export const ANGRY_SPEED = 1.6;
/** Turn rate (rad/s) while chasing. */
export const TURN_RATE = 4;
/** How far a chicken is shoved when the player walks into it. */
export const NUDGE = 0.35;
export const HOP_S = 0.35;
/** After landing a hit the chicken backs off briefly. */
export const RECOIL_S = 0.5;
export const PLAYER_IFRAMES_S = 1.0;
export const WANDER_INSET = 0.4;
export const CHASE_INSET = 0.3;

export interface ChickenState {
  x: number;
  z: number;
  heading: number;
  lastBumpAt: number;
  hopUntil: number;
  recoilUntil: number;
  seed: number;
}

export interface Flock {
  chickens: ChickenState[];
  bumps: number;
  lastBumpAt: number;
  angryUntil: number;
}

export interface ContactResult {
  bumped: number[];
  enraged: boolean;
  damaged: boolean;
}

/** Deterministic start position inside the pen (same formula the v2 chickens used). */
export function spawnPosition(pen: Rect, seed: number): Vec2 {
  return [
    pen.min[0] + 0.7 + ((seed * 7.3) % (pen.max[0] - pen.min[0] - 1.4)),
    pen.min[1] + 0.7 + ((seed * 3.7) % (pen.max[1] - pen.min[1] - 1.4)),
  ];
}

export function createFlock(count: number, pen: Rect): Flock {
  const chickens: ChickenState[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    const [x, z] = spawnPosition(pen, seed);
    chickens.push({
      x,
      z,
      heading: seed * 2.4,
      lastBumpAt: -Infinity,
      hopUntil: 0,
      recoilUntil: 0,
      seed,
    });
  }
  return { chickens, bumps: 0, lastBumpAt: -Infinity, angryUntil: 0 };
}

export function isAngry(flock: Flock, now: number): boolean {
  return now < flock.angryUntil;
}

/** Count a bump on chicken `idx`. Enrages the whole flock on the Nth bump. */
export function registerBump(flock: Flock, idx: number, now: number): 'ignored' | 'bump' | 'enraged' {
  const c = flock.chickens[idx];
  if (!c || now - flock.lastBumpAt < BUMP_COOLDOWN_S) return 'ignored';
  c.lastBumpAt = now;
  if (now - flock.lastBumpAt > BUMP_MEMORY_S) flock.bumps = 0;
  flock.lastBumpAt = now;
  flock.bumps += 1;
  if (flock.bumps >= BUMPS_TO_ANGER) {
    flock.bumps = 0;
    flock.angryUntil = now + ANGRY_DURATION_S;
    return 'enraged';
  }
  return 'bump';
}

export function calmFlock(flock: Flock): void {
  flock.angryUntil = 0;
  flock.bumps = 0;
  flock.lastBumpAt = -Infinity;
  for (const c of flock.chickens) {
    c.recoilUntil = 0;
    c.hopUntil = 0;
    c.lastBumpAt = -Infinity;
  }
}

export function wrapAngle(a: number): number {
  let d = a % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Turn `heading` toward the target point by at most `turnRate * dt`, shortest arc. */
export function steerToward(
  heading: number,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  turnRate: number,
  dt: number,
): number {
  const target = Math.atan2(toX - fromX, toZ - fromZ);
  const delta = wrapAngle(target - heading);
  const maxStep = turnRate * dt;
  if (Math.abs(delta) <= maxStep) return target;
  return heading + Math.sign(delta) * maxStep;
}

export function wanderHeading(heading: number, t: number, seed: number, dt: number): number {
  return heading + Math.sin(t * 0.9 + seed * 5) * 0.9 * dt;
}

export function clampToPen(
  x: number,
  z: number,
  pen: Rect,
  inset: number,
): { x: number; z: number; hitX: boolean; hitZ: boolean } {
  const minX = pen.min[0] + inset;
  const maxX = pen.max[0] - inset;
  const minZ = pen.min[1] + inset;
  const maxZ = pen.max[1] - inset;
  const hitX = x < minX || x > maxX;
  const hitZ = z < minZ || z > maxZ;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    z: Math.max(minZ, Math.min(maxZ, z)),
    hitX,
    hitZ,
  };
}

/**
 * Advance one chicken by `dt`. Returns true when the chicken is walking
 * (drives the peck-vs-walk pose). Chase still happens under reduced motion so
 * gameplay stays consistent; only the idle wander is frozen.
 */
export function stepChicken(
  c: ChickenState,
  flock: Flock,
  pen: Rect,
  player: { x: number; z: number },
  now: number,
  dt: number,
  reducedMotion: boolean,
): boolean {
  if (isAngry(flock, now)) {
    c.heading = steerToward(c.heading, c.x, c.z, player.x, player.z, TURN_RATE, dt);
    const speed = now < c.recoilUntil ? -1.0 : ANGRY_SPEED;
    const r = clampToPen(
      c.x + Math.sin(c.heading) * speed * dt,
      c.z + Math.cos(c.heading) * speed * dt,
      pen,
      CHASE_INSET,
    );
    c.x = r.x;
    c.z = r.z;
    return true;
  }

  if (reducedMotion) return false;
  const walking = Math.sin(now * 0.5 + c.seed * 3) > -0.2;
  c.heading = wanderHeading(c.heading, now, c.seed, dt);
  if (!walking) return false;
  const r = clampToPen(
    c.x + Math.sin(c.heading) * CALM_SPEED * dt,
    c.z + Math.cos(c.heading) * CALM_SPEED * dt,
    pen,
    WANDER_INSET,
  );
  // bounce off pen walls
  if (r.hitX) c.heading = -c.heading;
  if (r.hitZ) c.heading = Math.PI - c.heading;
  c.x = r.x;
  c.z = r.z;
  return true;
}

/**
 * Resolve player/chicken overlaps for this frame: shove and hop every touched
 * chicken, count bumps while calm, deal at most one hit while angry.
 */
export function processContacts(
  flock: Flock,
  px: number,
  pz: number,
  playerRadius: number,
  now: number,
  invulnerableUntil: number,
  pen: Rect,
): ContactResult {
  const result: ContactResult = { bumped: [], enraged: false, damaged: false };
  const minDist = playerRadius + CHICKEN_RADIUS;
  const angry = isAngry(flock, now);
  for (let i = 0; i < flock.chickens.length; i++) {
    const c = flock.chickens[i];
    const dx = c.x - px;
    const dz = c.z - pz;
    const d = Math.hypot(dx, dz);
    if (d >= minDist) continue;
    const nx = d < 1e-6 ? 1 : dx / d;
    const nz = d < 1e-6 ? 0 : dz / d;
    const r = clampToPen(c.x + nx * NUDGE, c.z + nz * NUDGE, pen, CHASE_INSET);
    c.x = r.x;
    c.z = r.z;
    c.hopUntil = now + HOP_S;
    result.bumped.push(i);
    if (angry) {
      if (!result.damaged && now >= invulnerableUntil && now >= c.recoilUntil) {
        result.damaged = true;
        c.recoilUntil = now + RECOIL_S;
      }
    } else if (registerBump(flock, i, now) === 'enraged') {
      result.enraged = true;
    }
  }
  return result;
}
