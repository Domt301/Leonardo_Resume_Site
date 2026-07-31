// Ramps (spec §5.1). Five steps per material, hue-rotated: shadows cool and
// desaturated, highlights warm and saturated. In 3D these become material base
// colours; the toon bands generate the neighbouring steps under the key light.

export const RAMP = {
  grass: ['#1b3a27', '#2c6338', '#438a46', '#68b45b', '#95d772'],
  leaf: ['#14302a', '#255431', '#387c3d', '#5aa451', '#8bcd68'],
  leafAlt: ['#1b3520', '#2f5f2c', '#4a8838', '#71b04c', '#a0d167'],
  wood: ['#231610', '#3f2a1b', '#5f4128', '#835c37', '#a87c4c'],
  stone: ['#252a3e', '#404763', '#626a8b', '#8890b0', '#b0b8d2'],
  dirt: ['#3d2a1c', '#63452a', '#8a6539', '#b08a54', '#d1b079'],
  sand: ['#6b563a', '#96794f', '#bda069', '#dcc48f', '#f2e2b8'],
  water: ['#132a55', '#1f4384', '#2f6bb8', '#5498d8', '#8ccef2'],
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
