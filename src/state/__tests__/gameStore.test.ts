import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_HEARTS, useGameStore } from '../useGameStore';

beforeEach(() => {
  useGameStore.setState({
    hearts: MAX_HEARTS,
    fainted: false,
    respawnToken: 0,
    hurtCount: 0,
    healCount: 0,
    chickensAngry: false,
  });
});

describe('hearts', () => {
  it('damage clamps at zero and faints', () => {
    const s = useGameStore.getState();
    s.damage();
    s.damage();
    expect(useGameStore.getState().hearts).toBe(1);
    expect(useGameStore.getState().fainted).toBe(false);
    s.damage(5);
    expect(useGameStore.getState().hearts).toBe(0);
    expect(useGameStore.getState().fainted).toBe(true);
    expect(useGameStore.getState().hurtCount).toBe(3);
    // no further damage while fainted
    s.damage();
    expect(useGameStore.getState().hurtCount).toBe(3);
  });

  it('heal returns false at max and bumps healCount otherwise', () => {
    const s = useGameStore.getState();
    expect(s.heal()).toBe(false);
    s.damage();
    expect(s.heal()).toBe(true);
    expect(useGameStore.getState().hearts).toBe(MAX_HEARTS);
    expect(useGameStore.getState().healCount).toBe(1);
  });

  it('respawn refills hearts and bumps the token', () => {
    const s = useGameStore.getState();
    s.damage(3);
    s.respawn();
    expect(useGameStore.getState().hearts).toBe(MAX_HEARTS);
    expect(useGameStore.getState().respawnToken).toBe(1);
    s.setFainted(false);
    expect(useGameStore.getState().fainted).toBe(false);
  });

  it('setChickensAngry no-ops on equal values', () => {
    const before = useGameStore.getState();
    before.setChickensAngry(false);
    expect(useGameStore.getState()).toBe(before);
    before.setChickensAngry(true);
    expect(useGameStore.getState().chickensAngry).toBe(true);
  });
});
