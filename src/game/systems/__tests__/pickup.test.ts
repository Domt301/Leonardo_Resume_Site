import { describe, expect, it } from 'vitest';
import {
  BUSH_RADIUS,
  HEART_RESPAWN_S,
  createBushStates,
  overlapsBush,
  updateBushes,
  type BushDef,
} from '../pickupSystem';

const defs: BushDef[] = [
  { pos: [0, 0], scale: 1, hasHeart: true },
  { pos: [5, 0], scale: 2, hasHeart: false },
];
const R = 0.45;

describe('overlapsBush', () => {
  it('scales the hit radius with the bush scale', () => {
    expect(overlapsBush(BUSH_RADIUS + R - 0.01, 0, defs[0], R)).toBe(true);
    expect(overlapsBush(BUSH_RADIUS + R + 0.01, 0, defs[0], R)).toBe(false);
    expect(overlapsBush(5 + 2 * BUSH_RADIUS + R - 0.01, 0, defs[1], R)).toBe(true);
  });
});

describe('updateBushes', () => {
  it('heals only when hearts are missing and respawns the heart later', () => {
    const states = createBushStates(defs);
    // full hearts → rustle + full, heart stays
    let ev = updateBushes(states, defs, 0, 0, 1, 3, 3, R);
    expect(ev.map((e) => e.type).sort()).toEqual(['full', 'rustle']);
    expect(states[0].heart).toBe(true);
    // staying inside fires nothing new
    ev = updateBushes(states, defs, 0, 0, 1.1, 3, 3, R);
    expect(ev).toEqual([]);
    // leave, come back hurt → heal
    updateBushes(states, defs, 10, 10, 2, 2, 3, R);
    ev = updateBushes(states, defs, 0, 0, 3, 2, 3, R);
    expect(ev.map((e) => e.type).sort()).toEqual(['heal', 'rustle']);
    expect(states[0].heart).toBe(false);
    expect(states[0].respawnAt).toBeCloseTo(3 + HEART_RESPAWN_S);
    expect(states[0].popStartedAt).toBe(3);
    // not back yet
    updateBushes(states, defs, 10, 10, 3 + HEART_RESPAWN_S - 1, 2, 3, R);
    expect(states[0].heart).toBe(false);
    // regrown
    updateBushes(states, defs, 10, 10, 3 + HEART_RESPAWN_S, 2, 3, R);
    expect(states[0].heart).toBe(true);
    expect(states[0].respawnAt).toBe(0);
  });

  it('rustles bushes without hearts but never heals from them', () => {
    const states = createBushStates(defs);
    const ev = updateBushes(states, defs, 5, 0, 1, 1, 3, R);
    expect(ev).toEqual([{ type: 'rustle', index: 1 }]);
  });
});
