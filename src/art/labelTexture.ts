import * as THREE from 'three';
import { RAMP } from './palette';

// Signboard label textures (spec §11 vocabulary in-world). A CanvasTexture with
// a carved-parchment plate, a pixel icon, and a word — NearestFilter + no
// mipmaps so it pixelates consistently with the rest of the world. No image
// assets; every icon is drawn in code. Cached by key.

export type IconKind =
  | 'experience'
  | 'certifications'
  | 'education'
  | 'skills'
  | 'about'
  | 'contact'
  | 'projects'
  | 'plate'
  | 'map';

const cache = new Map<string, THREE.CanvasTexture>();

function canvas(w: number, h: number): { c: HTMLCanvasElement; x: CanvasRenderingContext2D } {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  return { c, x };
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 1;
  return t;
}

/** Parchment plate background with a carved wooden frame. */
function plate(x: CanvasRenderingContext2D, w: number, h: number): void {
  x.fillStyle = RAMP.wood[1];
  x.fillRect(0, 0, w, h);
  x.fillStyle = RAMP.bone[3];
  x.fillRect(3, 3, w - 6, h - 6);
  // subtle inner shading
  x.fillStyle = RAMP.bone[2];
  x.fillRect(3, h - 8, w - 6, 5);
  x.strokeStyle = RAMP.wood[0];
  x.lineWidth = 2;
  x.strokeRect(3, 3, w - 6, h - 6);
}

/** Draw a pixel icon inside a box at (ix,iy) sized s. */
function icon(x: CanvasRenderingContext2D, kind: IconKind, ix: number, iy: number, s: number): void {
  const u = s / 8; // pixel unit
  const px = (cx: number, cy: number, cw: number, ch: number, color: string) => {
    x.fillStyle = color;
    x.fillRect(ix + cx * u, iy + cy * u, cw * u, ch * u);
  };
  const steel = RAMP.stone[3];
  const dark = RAMP.dark[1];
  const gold = RAMP.gold[3];
  const wood = RAMP.wood[2];
  switch (kind) {
    case 'experience': // sword
      px(3.5, 0, 1, 5, steel);
      px(2.5, 5, 3, 1, gold);
      px(3.5, 6, 1, 2, wood);
      break;
    case 'skills': // shield
      px(2, 0, 4, 1, RAMP.royal[3]);
      px(1, 1, 6, 3, RAMP.royal[3]);
      px(2, 4, 4, 2, RAMP.royal[2]);
      px(3, 6, 2, 1, RAMP.royal[2]);
      px(3.5, 1.5, 1, 3, gold);
      break;
    case 'about': // scroll
      px(1, 1, 6, 6, RAMP.bone[4]);
      px(1, 1, 6, 1, wood);
      px(1, 6, 6, 1, wood);
      px(2, 3, 4, 1, dark);
      px(2, 4.5, 3, 1, dark);
      break;
    case 'contact': // envelope
      px(1, 2, 6, 4, RAMP.bone[4]);
      px(1, 2, 6, 1, dark);
      px(1.5, 2.5, 2.5, 2, dark);
      px(3.5, 2.5, 2.5, 2, dark);
      break;
    case 'certifications': // hex sigil
      px(3, 0.5, 2, 1, RAMP.teal[4]);
      px(2, 1.5, 4, 1, RAMP.teal[4]);
      px(1.5, 2.5, 5, 3, RAMP.teal[3]);
      px(2, 5.5, 4, 1, RAMP.teal[4]);
      px(3, 6.5, 2, 1, RAMP.teal[4]);
      px(3.5, 2.5, 1, 3, RAMP.bone[4]);
      break;
    case 'education': // book
      px(1, 1, 6, 6, RAMP.crimson[2]);
      px(3.5, 1, 1, 6, RAMP.wood[0]);
      px(1.5, 1.5, 1.5, 5, RAMP.bone[4]);
      px(5, 1.5, 1.5, 5, RAMP.bone[4]);
      break;
    case 'projects': // chest
      px(1, 3, 6, 4, wood);
      px(1, 2, 6, 1.5, RAMP.wood[3]);
      px(1, 4, 6, 1, gold);
      px(3.5, 3.5, 1, 2, gold);
      break;
    case 'map': // folded map
      px(1, 1, 6, 6, RAMP.sand[3]);
      px(3, 1, 1, 6, RAMP.sand[1]);
      px(1.5, 2, 1.5, 1.5, RAMP.crimson[3]);
      break;
    case 'plate':
    default:
      px(2, 2, 4, 4, RAMP.gold[3]);
      break;
  }
}

/** A one-word sign plate with an icon, e.g. EXPERIENCE / SKILLS. */
export function signTexture(label: string, kind: IconKind): THREE.CanvasTexture {
  const key = `sign:${label}:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const w = 208;
  const h = 72;
  const { c, x } = canvas(w, h);
  plate(x, w, h);
  icon(x, kind, 12, 16, 40);
  x.fillStyle = RAMP.dark[0];
  x.textBaseline = 'middle';
  x.textAlign = 'left';
  // fit font size to the remaining width
  let font = 30;
  const maxW = w - 74;
  do {
    x.font = `700 ${font}px "Courier New", monospace`;
    if (x.measureText(label).width <= maxW) break;
    font -= 2;
  } while (font > 12);
  x.fillText(label, 66, h / 2 + 1);
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

/** The big carved title board: name + role. */
export function titleTexture(title: string, subtitle: string): THREE.CanvasTexture {
  const key = `title:${title}:${subtitle}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const w = 380;
  const h = 132;
  const { c, x } = canvas(w, h);
  plate(x, w, h);
  // iron corner brackets
  x.fillStyle = RAMP.stone[2];
  for (const [cx, cy] of [
    [8, 8],
    [w - 20, 8],
    [8, h - 20],
    [w - 20, h - 20],
  ] as const) {
    x.fillRect(cx, cy, 12, 12);
  }
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = RAMP.dark[0];
  let f = 46;
  do {
    x.font = `700 ${f}px "Courier New", monospace`;
    if (x.measureText(title).width <= w - 40) break;
    f -= 2;
  } while (f > 16);
  x.fillText(title, w / 2, h / 2 - 16);
  x.fillStyle = RAMP.grass[1];
  x.font = `700 20px "Courier New", monospace`;
  let sub = subtitle;
  while (x.measureText(sub).width > w - 40 && sub.length > 4) sub = sub.slice(0, -2);
  x.fillText(subtitle, w / 2, h / 2 + 28);
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

export function disposeLabelTextures(): void {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
