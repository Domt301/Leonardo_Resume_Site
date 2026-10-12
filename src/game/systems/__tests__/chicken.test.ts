import { describe, expect, it } from 'vitest';
import {
  ANGRY_DURATION_S,
  BUMP_COOLDOWN_S,
  BUMP_MEMORY_S,
  CHASE_INSET,
  PLAYER_IFRAMES_S,
  RECOIL_S,
  calmFlock,
  createFlock,
  isAngry,
  processContacts,
  registerBump,
  spawnPosition,
  steerToward,
  stepChicken,
  wrapAngle,
} from '../chickenSystem';
import type { Rect } from '../../../types/game';

const pen: Rect = { min: [-11, 1], max: [-7, 4] };
const R = 0.45;

describe('spawnPosition / createFlock', () => {
  it('spawns every chicken inside the pen', () => {
    for (let seed = 1; seed <= 3; seed++) {
      const [x, z] = spawnPosition(pen, seed);
      expect(x).toBeGreaterThan(pen.min[0]);
      expect(x).toBeLessThan(pen.max[0]);
      expect(z).toBeGreaterThan(pen.min[1]);
      expect(z).toBeLessThan(pen.max[1]);
    }
    const flock = createFlock(3, pen);
    expect(flock.chickens).toHaveLength(3);
    expect(isAngry(flock, 0)).toBe(false);
  });
});

describe('registerBump', () => {
  it('ignores repeat bumps inside the cooldown and enrages on the third bump', () => {
    const flock = createFlock(3, pen);
    expect(registerBump(flock, 0, 1)).toBe('bump');
    expect(registerBump(flock, 0, 1 + BUMP_COOLDOWN_S / 2)).toBe('ignored');
    // a different chicken inside the same window is still one bump
    expect(registerBump(flock, 1, 1 + BUMP_COOLDOWN_S / 2)).toBe('ignored');
    expect(registerBump(flock, 1, 2)).toBe('bump');
    expect(registerBump(flock, 2, 3)).toBe('enraged');
    expect(isAngry(flock, 3)).toBe(true);
    expect(isAngry(flock, 3 + ANGRY_DURATION_S + 0.01)).toBe(false);
  });

  it('forgets bumps after the memory window', () => {
    const flock = createFlock(3, pen);
    registerBump(flock, 0, 1);
    registerBump(flock, 1, 2);
    expect(registerBump(flock, 2, 2 + BUMP_MEMORY_S + 1)).toBe('bump');
    expect(isAngry(flock, 30)).toBe(false);
  });
});

describe('steerToward / wrapAngle', () => {
  it('turns the shortest way across the ±π seam', () => {
    // heading just below +π, target just above −π → should go up through π
    const h = steerToward(Math.PI - 0.1, 0, 0, Math.sin(-Math.PI + 0.1), Math.cos(-Math.PI + 0.1), 4, 0.01);
    expect(wrapAngle(h - (Math.PI - 0.1))).toBeGreaterThan(0);
  });
  it('snaps to the target when within one step', () => {
    expect(steerToward(0, 0, 0, 1, 0, 10, 1)).toBeCloseTo(Math.PI / 2);
  });
});

describe('processContacts', () => {
  it('shoves a touched chicken away, keeps it in the pen, and counts a bump while calm', () => {
    const flock = createFlock(3, pen);
    const c = flock.chickens[0];
    c.x = -9;
    c.z = 2.5;
    // park the other two out of reach
    flock.chickens[1].x = flock.chickens[2].x = -7.5;
    flock.chickens[1].z = flock.chickens[2].z = 1.5;
    const r = processContacts(flock, -9.3, 2.5, R, 1, 0, pen);
    expect(r.bumped).toEqual([0]);
    expect(r.enraged).toBe(false);
    expect(r.damaged).toBe(false);
    expect(c.x).toBeGreaterThan(-9); // pushed away from the player (+x)
    expect(c.x).toBeLessThanOrEqual(pen.max[0] - CHASE_INSET);
    expect(flock.bumps).toBe(1);
  });

  it('never damages while calm, damages once per i-frame window while angry', () => {
    const flock = createFlock(3, pen);
    const c = flock.chickens[0];
    flock.angryUntil = 100;
    c.x = -9;
    c.z = 2.5;
    flock.chickens[1].x = flock.chickens[2].x = -7.5;
    flock.chickens[1].z = flock.chickens[2].z = 1.5;
    const first = processContacts(flock, -9.3, 2.5, R, 10, 0, pen);
    expect(first.damaged).toBe(true);
    expect(c.recoilUntil).toBeCloseTo(10 + RECOIL_S);
    // player now invulnerable until 11 → no second hit
    c.x = -9.3;
    const second = processContacts(flock, -9.3, 2.5, R, 10.2, 10 + PLAYER_IFRAMES_S, pen);
    expect(second.damaged).toBe(false);
    // same chicken still recoiling even if player is vulnerable again
    c.x = -9.3;
    const third = processContacts(flock, -9.3, 2.5, R, 10.3, 0, pen);
    expect(third.damaged).toBe(false);
  });

  it('calmFlock clears aggro and bumps', () => {
    const flock = createFlock(3, pen);
    flock.angryUntil = 50;
    flock.bumps = 2;
    flock.chickens[0].recoilUntil = 9;
    calmFlock(flock);
    expect(isAngry(flock, 1)).toBe(false);
    expect(flock.bumps).toBe(0);
    expect(flock.chickens[0].recoilUntil).toBe(0);
  });
});

describe('stepChicken', () => {
  it('chases the player when angry and stays inside the pen', () => {
    const flock = createFlock(3, pen);
    const c = flock.chickens[0];
    c.x = -10;
    c.z = 2;
    flock.angryUntil = 100;
    const player = { x: -7.2, z: 3.5 };
    const d0 = Math.hypot(player.x - c.x, player.z - c.z);
    for (let i = 0; i < 120; i++) stepChicken(c, flock, pen, player, i / 60, 1 / 60, false);
    const d1 = Math.hypot(player.x - c.x, player.z - c.z);
    expect(d1).toBeLessThan(d0);
    expect(c.x).toBeLessThanOrEqual(pen.max[0] - CHASE_INSET + 1e-9);
    expect(c.z).toBeLessThanOrEqual(pen.max[1] - CHASE_INSET + 1e-9);
  });

  it('still chases under reduced motion but does not wander', () => {
    const flock = createFlock(3, pen);
    const c = flock.chickens[0];
    const x0 = c.x;
    const z0 = c.z;
    stepChicken(c, flock, pen, { x: 0, z: 0 }, 1, 1 / 60, true);
    expect(c.x).toBe(x0);
    expect(c.z).toBe(z0);
    flock.angryUntil = 100;
    stepChicken(c, flock, pen, { x: 0, z: 0 }, 1, 1 / 60, true);
    expect(c.x !== x0 || c.z !== z0).toBe(true);
  });

  it('wanders inside the pen when calm', () => {
    const flock = createFlock(3, pen);
    const c = flock.chickens[1];
    for (let i = 0; i < 1200; i++) stepChicken(c, flock, pen, { x: 0, z: 0 }, i / 60, 1 / 60, false);
    expect(c.x).toBeGreaterThanOrEqual(pen.min[0]);
    expect(c.x).toBeLessThanOrEqual(pen.max[0]);
    expect(c.z).toBeGreaterThanOrEqual(pen.min[1]);
    expect(c.z).toBeLessThanOrEqual(pen.max[1]);
  });
});
