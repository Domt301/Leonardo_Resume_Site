import * as THREE from 'three';
import { RAMP } from './palette';

// Toon materials (spec §5.2). Four bands, hard edges. Every surface uses this
// factory; there should be ~25 materials in the whole project, so we cache one
// per colour. Never MeshStandard/Physical — specular reads as "3D game".

// Four hard bands. The shadow floor is lifted so shadowed faces read as colour,
// not near-black — the hemisphere fill then tints them cool.
const bands = new Uint8Array([115, 115, 115, 165, 165, 165, 210, 210, 210, 255, 255, 255]);
const gradientMap = new THREE.DataTexture(bands, 4, 1, THREE.RedFormat);
gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
gradientMap.needsUpdate = true;

const cache = new Map<string, THREE.MeshToonMaterial>();

/** Cached toon material for a hex colour. */
export function toon(hex: string): THREE.MeshToonMaterial {
  let m = cache.get(hex);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color: new THREE.Color(hex), gradientMap });
    cache.set(hex, m);
  }
  return m;
}

/** Toon material for a ramp step (base colour is step 2 by spec convention). */
export function toonRamp(name: keyof typeof RAMP, step = 2): THREE.MeshToonMaterial {
  return toon(RAMP[name][step]);
}

const texturedCache = new Map<string, THREE.MeshToonMaterial>();
/** Toon material with a tiled detail map that multiplies the base colour. */
export function toonTextured(hex: string, map: THREE.Texture, key: string): THREE.MeshToonMaterial {
  const ck = `${hex}|${key}`;
  let m = texturedCache.get(ck);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color: new THREE.Color(hex), gradientMap, map, vertexColors: true });
    texturedCache.set(ck, m);
  }
  return m;
}

const emissiveCache = new Map<string, THREE.MeshBasicMaterial>();
/** Flat unlit material for glowing runes / sigils / lantern cores. */
export function emissive(hex: string): THREE.MeshBasicMaterial {
  let m = emissiveCache.get(hex);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), toneMapped: false });
    emissiveCache.set(hex, m);
  }
  return m;
}

/** Dispose all cached materials (app teardown only). */
export function disposeMaterialCaches(): void {
  cache.forEach((m) => m.dispose());
  emissiveCache.forEach((m) => m.dispose());
  texturedCache.forEach((m) => m.dispose());
  cache.clear();
  emissiveCache.clear();
  texturedCache.clear();
  gradientMap.dispose();
}
