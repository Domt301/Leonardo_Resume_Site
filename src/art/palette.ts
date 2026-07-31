// Ramps (spec §5.1). Five steps per material, hue-rotated: shadows cool and
// desaturated, highlights warm and saturated. In 3D these become material base
// colours; the toon bands generate the neighbouring steps under the key light.

export const RAMP = {
  grass: ['#234a2c', '#357544', '#54a253', '#7ec85f', '#ace87e'],
  leaf: ['#173a2c', '#256537', '#3d9247', '#66bd5c', '#97dc72'],
  leafAlt: ['#1f3f24', '#357033', '#559a3f', '#7fc255', '#b0dd72'],
  wood: ['#2a1a12', '#48311f', '#6e4c2e', '#956a3f', '#bd8c55'],
  stone: ['#2b3145', '#4a5270', '#727a9a', '#9aa2c0', '#c2c9e0'],
  dirt: ['#4a3220', '#75512f', '#a67a44', '#c99a5e', '#e6c58a'],
  sand: ['#7a6242', '#a8895a', '#cfb074', '#ecd49a', '#faeec2'],
  water: ['#1a4360', '#276f90', '#3d97ba', '#63b8d6', '#9fe0ee'],
  skin: ['#5c3821', '#88512f', '#ae7546', '#d29c69', '#f0c69a'],
  hair: ['#120c09', '#241811', '#3a2717', '#523c24', '#6d5233'],
  cloth: ['#0b0d13', '#161925', '#242838', '#363c53', '#4c5473'],
  denim: ['#15223a', '#253a61', '#375489', '#4f79b2', '#7099d0'],
  gold: ['#6b3f10', '#a36f1b', '#d49d2b', '#f2c750', '#ffe89c'],
  teal: ['#0d3a45', '#176272', '#2593a6', '#4dc3d2', '#8ee9ef'],
  royal: ['#151b4f', '#262f8e', '#3c4dc6', '#6176ea', '#96a8ff'],
  crimson: ['#48111b', '#7a2029', '#aa3641', '#d25c65', '#ee9297'],
  violet: ['#2a1350', '#4a2385', '#6f3cba', '#9666df', '#bf9af2'],
  bone: ['#585044', '#8a7d68', '#b6a78d', '#dacfb6', '#f6efdd'],
  dark: ['#0a0812', '#131022', '#1e1a30', '#2c2744', '#3d3760'],
} as const;

export type RampName = keyof typeof RAMP;

export const VOID = '#07060d';

/** Safe ramp lookup by name + index (clamped). */
export function ramp(name: string, step: number): string {
  const r = (RAMP as Record<string, readonly string[]>)[name] ?? RAMP.stone;
  return r[Math.max(0, Math.min(r.length - 1, step))];
}
