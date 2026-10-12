import { describe, expect, it } from 'vitest';
import {
  MAP_H,
  MAP_W,
  bearingDeg,
  compassLabel,
  describeMap,
  mapToWorld,
  markerAt,
  nearestUnvisited,
  worldToMap,
} from '../minimapProjection';
import { POSITIONS } from '../../world/layout';

describe('worldToMap / mapToWorld', () => {
  it('maps island corners and centre', () => {
    expect(worldToMap(-15, -12)).toEqual([0, 0]);
    expect(worldToMap(15, 12)).toEqual([MAP_W, MAP_H]);
    expect(worldToMap(0, 0)).toEqual([MAP_W / 2, MAP_H / 2]);
    const [x, z] = mapToWorld(MAP_W / 4, MAP_H / 4);
    expect(x).toBeCloseTo(-7.5);
    expect(z).toBeCloseTo(-6);
  });
});

describe('bearings', () => {
  it('treats −Z as north and +X as east', () => {
    expect(bearingDeg(0, 0, 0, -1)).toBeCloseTo(0);
    expect(bearingDeg(0, 0, 1, 0)).toBeCloseTo(90);
    expect(bearingDeg(0, 0, 0, 1)).toBeCloseTo(180);
    expect(bearingDeg(0, 0, -1, 0)).toBeCloseTo(270);
  });
  it('labels compass sectors', () => {
    expect(compassLabel(340)).toBe('N');
    expect(compassLabel(337)).toBe('NW');
    expect(compassLabel(44)).toBe('NE');
    expect(compassLabel(90)).toBe('E');
    expect(compassLabel(200)).toBe('S');
  });
});

describe('nearestUnvisited / describeMap', () => {
  it('skips visited sections and returns null when all are visited', () => {
    const n = nearestUnvisited(-7.5, -4, POSITIONS.signs, ['experience']);
    expect(n?.section).not.toBe('experience');
    const all = nearestUnvisited(0, 0, POSITIONS.signs, [
      'experience',
      'projects',
      'skills',
      'about',
      'certifications',
      'contact',
    ]);
    expect(all).toBeNull();
    expect(describeMap(0, 0, POSITIONS.signs, [])).toMatch(/^Minimap\. Nearest unvisited: /);
  });
});

describe('markerAt', () => {
  it('returns the closest marker inside the hit radius', () => {
    const markers = [
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 14, y: 10 },
    ];
    expect(markerAt(13, 10, markers)).toBe('b');
    expect(markerAt(40, 40, markers)).toBeNull();
  });
});
