// Heart pickups hidden in bushes. Pure — no three.js, no React — unit-testable.

import type { Vec2 } from '../../types/game';

export const BUSH_RADIUS = 0.55;
export const HEART_RESPAWN_S = 45;
export const RUSTLE_S = 0.6;
export const HEART_POP_S = 0.8;

export interface BushDef {
  pos: Vec2;
  scale: number;
  hasHeart: boolean;
}

export interface BushState {
  /** A heart is currently waiting in this bush. */
  heart: boolean;
  /** Clock time when the heart regrows; 0 = nothing pending. */
  respawnAt: number;
  rustleUntil: number;
  /** Clock time the last pickup started its rising animation; 0 = none. */
  popStartedAt: number;
  /** Edge detection so rustle/full fire once per entry. */
  overlapping: boolean;
}

export type PickupEvent = { type: 'heal' | 'rustle' | 'full'; index: number };

export function createBushStates(defs: BushDef[]): BushState[] {
  return defs.map((d) => ({
    heart: d.hasHeart,
    respawnAt: 0,
    rustleUntil: 0,
    popStartedAt: 0,
    overlapping: false,
  }));
}

export function bushRadius(def: BushDef, base = BUSH_RADIUS): number {
  return base * def.scale;
}

export function overlapsBush(
  px: number,
  pz: number,
  def: BushDef,
  playerRadius: number,
  base = BUSH_RADIUS,
): boolean {
  const r = bushRadius(def, base) + playerRadius;
  const dx = px - def.pos[0];
  const dz = pz - def.pos[1];
  return dx * dx + dz * dz < r * r;
}

/** Advance all bushes; returns the gameplay events raised this tick. */
export function updateBushes(
  states: BushState[],
  defs: BushDef[],
  px: number,
  pz: number,
  now: number,
  hearts: number,
  maxHearts: number,
  playerRadius: number,
): PickupEvent[] {
  const events: PickupEvent[] = [];
  for (let i = 0; i < defs.length; i++) {
    const s = states[i];
    const d = defs[i];
    if (!s) continue;
    if (!s.heart && s.respawnAt > 0 && now >= s.respawnAt) {
      s.heart = true;
      s.respawnAt = 0;
    }
    const over = overlapsBush(px, pz, d, playerRadius);
    const entered = over && !s.overlapping;
    if (entered) {
      s.rustleUntil = now + RUSTLE_S;
      events.push({ type: 'rustle', index: i });
    }
    if (over && s.heart) {
      if (hearts < maxHearts) {
        s.heart = false;
        s.respawnAt = now + HEART_RESPAWN_S;
        s.popStartedAt = now;
        events.push({ type: 'heal', index: i });
        hearts += 1;
      } else if (entered) {
        events.push({ type: 'full', index: i });
      }
    }
    s.overlapping = over;
  }
  return events;
}
