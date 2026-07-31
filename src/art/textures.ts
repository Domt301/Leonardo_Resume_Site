import * as THREE from 'three';

// Procedural detail textures (spec §20 "hand-crafted" jump). Tiny (16–24px)
// value-noise / pattern maps, NearestFilter + RepeatWrapping, no mipmaps, so
// they read as texture through the pixel post-process without fighting the toon
// look. They MULTIPLY the material's base colour, so they carry value variation
// only (greys ~0.7–1.0), never hue. No image assets — all drawn in code.

const cache = new Map<string, THREE.CanvasTexture>();

function make(key: string, size: number, draw: (x: CanvasRenderingContext2D, s: number) => void): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  draw(x, size);
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
  const g = Math.round(v * 255);
  return `rgb(${g},${g},${g})`;
};

export const grassTexture = () =>
  make('grass', 20, (x, s) => {
    // gentle turf: mostly bright with a few soft darker tufts, low contrast
    for (let i = 0; i < s; i++)
      for (let j = 0; j < s; j++) {
        const n = h(i, j);
        const v = n < 0.1 ? 0.9 : n < 0.2 ? 0.95 : 0.99 + h(i + 9, j) * 0.01;
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const dirtTexture = () =>
  make('dirt', 16, (x, s) => {
    for (let i = 0; i < s; i++)
      for (let j = 0; j < s; j++) {
        const n = h(i * 2, j);
        const band = 0.9 + Math.sin(j * 0.9) * 0.05; // faint horizontal grain
        const v = Math.min(1, band * (n < 0.15 ? 0.78 : n < 0.3 ? 0.9 : 1.0));
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const stoneTexture = () =>
  make('stone', 24, (x, s) => {
    // brick / block pattern: light blocks, darker mortar, offset rows
    const bh = 6;
    const bw = 12;
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const row = Math.floor(j / bh);
        const off = (row % 2) * (bw / 2);
        const inMortar = j % bh === 0 || (i + off) % bw === 0;
        const n = h(i, j);
        const v = inMortar ? 0.68 : 0.92 + n * 0.08;
        x.fillStyle = grey(v);
        x.fillRect(i, j, 1, 1);
      }
  });

export const shingleTexture = () =>
  make('shingle', 16, (x, s) => {
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const row = Math.floor(j / 4);
        const off = (row % 2) * 4;
        const edge = j % 4 === 0 || (i + off) % 8 === 0;
        x.fillStyle = grey(edge ? 0.72 : 0.98);
        x.fillRect(i, j, 1, 1);
      }
  });

export const woodTexture = () =>
  make('wood', 16, (x, s) => {
    for (let i = 0; i < s; i++)
      for (let j = 0; j < s; j++) {
        const grain = 0.9 + Math.sin(i * 1.6 + h(i, 0) * 3) * 0.08;
        x.fillStyle = grey(Math.min(1, grain));
        x.fillRect(i, j, 1, 1);
      }
  });

export function disposeTextures(): void {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
