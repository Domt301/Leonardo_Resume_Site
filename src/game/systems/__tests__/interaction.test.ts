import { describe, expect, it } from 'vitest';
import { selectInteractable, zoneAt } from '../interactionSystem';
import type { WorldInteractable, WorldZone } from '../../../types/game';

const make = (id: string, x: number, z: number, extra: Partial<WorldInteractable> = {}): WorldInteractable => ({
  id,
  label: id,
  section: 'projects',
  position: [x, 0, z],
  interactionRadius: 2.2,
  route: `/${id}`,
  prompt: `View ${id}`,
  ...extra,
});

describe('selectInteractable', () => {
  it('returns null when nothing is in range', () => {
    expect(selectInteractable(0, 0, [make('a', 10, 10)])).toBeNull();
  });

  it('selects the nearest in-range interactable', () => {
    const list = [make('far', 2, 0), make('near', 1, 0)];
    expect(selectInteractable(0, 0, list)?.id).toBe('near');
  });

  it('respects each interactable radius', () => {
    const list = [make('tight', 1.5, 0, { interactionRadius: 1 })];
    expect(selectInteractable(0, 0, list)).toBeNull();
  });

  it('skips disabled interactables', () => {
    const list = [make('off', 1, 0, { disabled: true }), make('on', 2, 0)];
    expect(selectInteractable(0, 0, list)?.id).toBe('on');
  });

  it('breaks exact ties by priority', () => {
    const list = [make('low', 1, 0, { priority: 0 }), make('high', -1, 0, { priority: 5 })];
    expect(selectInteractable(0, 0, list)?.id).toBe('high');
  });
});

describe('zoneAt', () => {
  const zones: WorldZone[] = [
    { id: 'skills', label: 'Skills Grove', center: [0, 0], radius: 3 },
    { id: 'about', label: 'About Overlook', center: [4, 0], radius: 3 },
  ];

  it('returns null outside every zone', () => {
    expect(zoneAt(20, 20, zones)).toBeNull();
  });

  it('returns the closest zone when zones overlap', () => {
    expect(zoneAt(2.6, 0, zones)?.id).toBe('about');
    expect(zoneAt(1.4, 0, zones)?.id).toBe('skills');
  });
});
