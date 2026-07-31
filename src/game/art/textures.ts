import * as THREE from 'three';
import { RAMP } from './palette';

// Procedural pixel-art textures (spec §17.3). Tiny value-noise / pattern maps,
// NearestFilter + RepeatWrapping, no mipmaps. Greyscale maps MULTIPLY the
// material's base color (value variation only); label textures carry real
// pixels. No image assets — all drawn in code.

const cache = new Map<string, THREE.CanvasTexture>();

function make(
  key: string,
  width: number,
  height: number,
  draw: (x: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  draw(x, width, height);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

// deterministic value noise
function h(x: number, y: number): number {
  let n = (x * 374761393 + y * 668265263) ^ 0x9e3779b9;
  n = (n ^ (n >>> 13)) * 1274126177;
  n = n ^ (n >>> 16);
  return ((n >>> 0) % 1000) / 1000;
}
const grey = (v: number) => {
  const g = Math.round(Math.min(1, v) * 255);
  return `rgb(${g},${g},${g})`;
};

export const grassTexture = () =>
  make('grass', 20, 20, (x, s) => {
    for (let i = 0; i < s; i++)
      for (let j = 0; j < s; j++) {
        const n = h(i, j);
        const v = n < 0.1 ? 0.9 : n < 0.2 ? 0.95 : 0.99 + h(i + 9, j) * 0.01;
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const dirtTexture = () =>
  make('dirt', 24, 24, (x, s) => {
    for (let i = 0; i < s; i++)
      for (let j = 0; j < s; j++) {
        const n = h(i * 2, j);
        const band = 0.92 + Math.sin(j * 0.8) * 0.04;
        let v = band * (n < 0.12 ? 0.8 : n < 0.26 ? 0.9 : 1.0);
        if (h(Math.floor(i / 3), Math.floor(j / 3)) > 0.86) v *= 0.82;
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const stoneTexture = () =>
  make('stone', 32, 32, (x, s) => {
    const bh = 8;
    const bw = 16;
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const row = Math.floor(j / bh);
        const off = (row % 2) * (bw / 2);
        const inRow = j % bh;
        const inCol = (i + off) % bw;
        const mortar = inRow === 0 || inCol === 0;
        const bevel = inRow === 1 || inCol === 1;
        const brick = 0.86 + h(row, Math.floor((i + off) / bw)) * 0.14;
        let v = mortar ? 0.62 : bevel ? Math.min(1, brick + 0.1) : brick;
        v *= 0.98 + h(i, j) * 0.02;
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const woodTexture = () =>
  make('wood', 16, 16, (x, s) => {
    for (let i = 0; i < s; i++)
      for (let j = 0; j < s; j++) {
        const grain = 0.9 + Math.sin(i * 1.6 + h(i, 0) * 3) * 0.08;
        x.fillStyle = grey(grain);
        x.fillRect(i, j, 1, 1);
      }
  });

export const roofTexture = () =>
  make('roof', 16, 16, (x, s) => {
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const row = Math.floor(j / 4);
        const off = (row % 2) * 4;
        const edge = j % 4 === 0 || (i + off) % 8 === 0;
        x.fillStyle = grey(edge ? 0.72 : 0.98);
        x.fillRect(i, j, 1, 1);
      }
  });

export const waterTexture = () =>
  make('water', 32, 32, (x, s) => {
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const wave = Math.sin((i + j * 0.5) * 0.7) * 0.5 + 0.5;
        const n = h(i, j);
        let v = 0.85 + wave * 0.1;
        if (n > 0.93) v = 1.0; // sparkle
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const waterfallTexture = () =>
  make('waterfall', 16, 32, (x, w, hh) => {
    for (let j = 0; j < hh; j++)
      for (let i = 0; i < w; i++) {
        const streak = h(i, 0) > 0.5 ? 0.08 : 0;
        const n = h(i, j);
        const v = 0.82 + streak + (n > 0.8 ? 0.12 : 0);
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

/** Pixel-text label texture for signboards and the identity board. */
export function labelTexture(
  key: string,
  lines: string[],
  opts: { width?: number; height?: number; bg?: string; fg?: string; sub?: string } = {},
): THREE.CanvasTexture {
  const width = opts.width ?? 256;
  const height = opts.height ?? 64;
  return make(`label:${key}`, width, height, (x, w, hh) => {
    x.fillStyle = opts.bg ?? RAMP.bone[3];
    x.fillRect(0, 0, w, hh);
    // inner border
    x.strokeStyle = RAMP.wood[1];
    x.lineWidth = 4;
    x.strokeRect(2, 2, w - 4, hh - 4);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    const mainSize = Math.floor(hh / (lines.length + 1));
    const maxWidth = w - 24;
    lines.forEach((line, i) => {
      const isSub = i > 0;
      let size = isSub ? Math.floor(mainSize * 0.55) : mainSize;
      x.font = `bold ${size}px monospace`;
      // shrink to fit the board width
      const measured = x.measureText(line).width;
      if (measured > maxWidth) {
        size = Math.floor((size * maxWidth) / measured);
        x.font = `bold ${size}px monospace`;
      }
      x.fillStyle = isSub ? (opts.sub ?? RAMP.gold[2]) : (opts.fg ?? RAMP.dark[1]);
      x.fillText(line, w / 2, (hh * (i + 1)) / (lines.length + 1));
    });
  });
}

export function disposeTextures(): void {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
