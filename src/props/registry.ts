import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { toon, emissive } from '../art/toon';
import { box, prism, cone, cylinder, blob, place, hash } from '../art/geometry';
import type { Part, StaticBuilder, DynamicBuilder } from './types';

// Prop library (spec §7). All generated from primitives; no model files. Static
// props return coloured parts (merged per-colour by the Island); dynamic props
// are animated/interactive objects. Kept well under ~200 tris each.
//
// (Spec lists props across trees.ts/rocks.ts/buildings.ts/etc.; consolidated
// here behind a single registry for one import surface.)

const p = (geo: THREE.BufferGeometry, color: string, cast = true, receive = false): Part => ({
  geo,
  color,
  cast,
  receive,
});

// ── Foliage ──────────────────────────────────────────────────────────────────
const tree: StaticBuilder = (s) => {
  const parts: Part[] = [p(cylinder(0.1, 0.13, 0.9, 6), RAMP.wood[2])];
  const heights = [0.95, 1.25, 1.55];
  heights.forEach((y, i) => {
    const r = 0.55 - i * 0.12;
    parts.push(p(place(blob(r, s + i * 7, 0, 0.22), (hash(s, i) - 0.5) * 0.2, y, 0, hash(i, s) * 6.28), RAMP.leaf[3]));
  });
  return parts;
};

const pine: StaticBuilder = () => {
  const parts: Part[] = [p(cylinder(0.09, 0.12, 0.7, 6), RAMP.wood[1])];
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const y = 0.6 + i * 0.42;
    const r = 0.62 - i * 0.13;
    parts.push(p(place(cone(r, 0.6, 7), 0, y, 0), RAMP.leafAlt[3 - (i % 2)]));
  }
  return parts;
};

const bush: StaticBuilder = (s) => [
  p(place(blob(0.42, s, 0, 0.25), -0.15, 0.32, 0), RAMP.leaf[2]),
  p(place(blob(0.36, s + 3, 0, 0.25), 0.2, 0.28, 0.1), RAMP.leaf[3]),
];

const rock: StaticBuilder = (s) => {
  const g = blob(0.5, s, 0, 0.28);
  g.scale(1, 0.6, 1);
  g.translate(0, 0.25, 0);
  return [p(g, RAMP.stone[2])];
};

const rockArch: StaticBuilder = (s) => [
  p(place(blob(0.55, s, 0, 0.25), -0.9, 0.6, 0).scale(1, 1.6, 1), RAMP.stone[2]),
  p(place(blob(0.55, s + 5, 0, 0.25), 0.9, 0.6, 0).scale(1, 1.6, 1), RAMP.stone[2]),
  p(place(box(2.4, 0.5, 0.7), 0, 1.7, 0), RAMP.stone[1]),
];

// ── Structures ───────────────────────────────────────────────────────────────
const house: StaticBuilder = () => {
  const parts: Part[] = [];
  parts.push(p(box(2.2, 1.4, 1.9), RAMP.bone[2]));
  parts.push(p(place(prism(2.5, 0.9, 2.2), 0, 1.4, 0), RAMP.crimson[1]));
  parts.push(p(place(box(0.6, 0.9, 0.1), 0, 0, 0.95), RAMP.wood[2])); // door
  parts.push(p(place(box(0.45, 0.45, 0.1), -0.7, 0.8, 0.95), RAMP.teal[3])); // window
  parts.push(p(place(box(0.45, 0.45, 0.1), 0.7, 0.8, 0.95), RAMP.teal[3]));
  return parts;
};

const armory: StaticBuilder = () => [
  p(box(1.8, 1.1, 1.4), RAMP.wood[2]),
  p(place(prism(2.0, 0.7, 1.6), 0, 1.1, 0), RAMP.wood[1]),
  p(place(box(0.7, 0.85, 0.08), 0, 0, 0.72), RAMP.dark[3]),
];

const temple: StaticBuilder = () => {
  const parts: Part[] = [p(box(4.2, 0.4, 3.2), RAMP.stone[3], true, true)];
  const cols: [number, number][] = [
    [-1.6, -1.1],
    [0, -1.1],
    [1.6, -1.1],
    [-1.6, 1.1],
    [0, 1.1],
    [1.6, 1.1],
  ];
  cols.forEach(([x, z]) => parts.push(p(place(cylinder(0.22, 0.24, 2.2, 8), x, 0.4, z), RAMP.stone[4])));
  parts.push(p(place(box(4.4, 0.4, 3.4), 0, 2.6, 0), RAMP.stone[2]));
  parts.push(p(place(prism(4.6, 0.8, 3.6), 0, 3.0, 0), RAMP.stone[3]));
  // teal runes
  parts.push(p(place(box(0.3, 0.3, 0.05), 0, 1.6, 1.13), RAMP.teal[4]));
  return parts;
};

const lighthouse: StaticBuilder = () => [
  p(cylinder(0.5, 0.75, 2.6, 10), RAMP.bone[3]),
  p(place(box(0.9, 0.4, 0.9), 0, 2.1, 0).scale(1, 1, 1), RAMP.crimson[2]),
  p(place(cylinder(0.45, 0.5, 0.6, 10), 0, 2.6, 0), RAMP.stone[2]),
  p(place(box(0.6, 0.6, 0.6), 0, 3.2, 0), RAMP.gold[3]),
];

const dock: StaticBuilder = () => {
  const parts: Part[] = [];
  for (let i = 0; i < 4; i++) parts.push(p(place(box(1.4, 0.12, 0.9), 0, 0.06, i * 0.95), RAMP.wood[2]));
  parts.push(p(place(cylinder(0.08, 0.08, 0.8, 5), -0.6, 0, 3.4), RAMP.wood[1]));
  parts.push(p(place(cylinder(0.08, 0.08, 0.8, 5), 0.6, 0, 3.4), RAMP.wood[1]));
  return parts;
};

const crate: StaticBuilder = () => [
  p(box(0.7, 0.7, 0.7), RAMP.wood[2]),
  p(place(box(0.74, 0.08, 0.74), 0, 0.35, 0), RAMP.wood[1]),
  p(place(box(0.74, 0.08, 0.74), 0, 0.08, 0), RAMP.wood[1]),
];

const mailbox: StaticBuilder = () => [
  p(cylinder(0.06, 0.06, 0.8, 5), RAMP.wood[2]),
  p(place(box(0.5, 0.34, 0.32), 0, 0.9, 0), RAMP.crimson[2]),
  p(place(box(0.06, 0.2, 0.06), 0.28, 1.0, 0), RAMP.gold[3]),
];

const fence: StaticBuilder = () => {
  const parts: Part[] = [];
  for (let i = 0; i < 3; i++) parts.push(p(place(box(0.1, 0.7, 0.1), i * 1.0 - 1.0, 0, 0), RAMP.wood[2]));
  parts.push(p(place(box(2.2, 0.09, 0.08), 0, 0.55, 0), RAMP.wood[1]));
  parts.push(p(place(box(2.2, 0.09, 0.08), 0, 0.3, 0), RAMP.wood[1]));
  return parts;
};

// ── Signs ────────────────────────────────────────────────────────────────────
const signpost: StaticBuilder = () => [
  p(place(cylinder(0.06, 0.06, 1.1, 5), -0.28, 0, 0), RAMP.wood[2]),
  p(place(cylinder(0.06, 0.06, 1.1, 5), 0.28, 0, 0), RAMP.wood[2]),
  p(place(box(1.0, 0.6, 0.08).rotateX(-0.14), 0, 1.0, 0), RAMP.wood[3]),
  p(place(box(0.5, 0.5, 0.04), 0, 1.05, 0.06), RAMP.bone[3]),
];

const titleBoard: StaticBuilder = () => [
  p(place(cylinder(0.12, 0.14, 2.2, 6), -1.6, 0, 0), RAMP.wood[1]),
  p(place(cylinder(0.12, 0.14, 2.2, 6), 1.6, 0, 0), RAMP.wood[1]),
  p(place(box(3.8, 1.3, 0.16), 0, 1.7, 0), RAMP.wood[3]),
  p(place(box(0.18, 0.18, 0.2), -1.75, 2.25, 0), RAMP.stone[1]),
  p(place(box(0.18, 0.18, 0.2), 1.75, 2.25, 0), RAMP.stone[1]),
];

// ── Interior furniture (used inside buildings) ───────────────────────────────
const desk = (color: string): Part[] => [
  p(box(1.1, 0.7, 0.7), color),
  p(place(box(1.2, 0.08, 0.8), 0, 0.7, 0), RAMP.wood[3]),
];
const terminal: StaticBuilder = () => [
  ...desk(RAMP.dark[2]),
  p(place(box(0.7, 0.5, 0.06), 0, 1.05, -0.1).rotateX(0.15), RAMP.teal[4]),
  p(place(box(0.5, 0.03, 0.3), 0, 0.79, 0.2), RAMP.dark[3]),
];
const altar: StaticBuilder = () => [
  p(cylinder(0.4, 0.55, 0.9, 8), RAMP.stone[3]),
  p(place(box(0.7, 0.12, 0.7), 0, 0.9, 0), RAMP.stone[2]),
  p(place(box(0.3, 0.3, 0.06), 0, 1.25, 0), RAMP.violet[3]),
];
const workbench: StaticBuilder = () => [
  ...desk(RAMP.wood[2]),
  p(place(box(0.2, 0.2, 0.2), -0.3, 0.85, 0), RAMP.stone[3]),
  p(place(box(0.15, 0.4, 0.15), 0.3, 0.9, 0), RAMP.gold[2]),
];
const draftingTable: StaticBuilder = () => [
  p(box(1.1, 0.7, 0.7), RAMP.wood[2]),
  p(place(box(1.2, 0.06, 0.9).rotateX(-0.4), 0, 0.9, 0), RAMP.bone[4]),
];
const scrollRack: StaticBuilder = () => {
  const parts: Part[] = [p(box(1.0, 1.5, 0.4), RAMP.wood[2])];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 4; j++)
      parts.push(p(place(box(0.18, 0.28, 0.3), -0.35 + j * 0.24, 0.3 + i * 0.42, 0.08), RAMP.bone[j % 2 ? 3 : 4]));
  return parts;
};
const ledger: StaticBuilder = () => [
  ...desk(RAMP.wood[1]),
  p(place(box(0.5, 0.1, 0.35), 0, 0.79, 0), RAMP.crimson[2]),
  p(place(box(0.5, 0.02, 0.35), 0, 0.85, 0), RAMP.bone[4]),
];
const dummy: StaticBuilder = () => [
  p(cylinder(0.12, 0.16, 1.0, 6), RAMP.wood[2]),
  p(place(blob(0.35, 11, 0, 0.15), 0, 1.2, 0), RAMP.bone[2]),
  p(place(box(0.9, 0.25, 0.25), 0, 1.0, 0), RAMP.wood[1]),
];
const mapProp: StaticBuilder = () => [
  p(place(cylinder(0.05, 0.05, 1.0, 5), -0.5, 0, 0), RAMP.wood[2]),
  p(place(cylinder(0.05, 0.05, 1.0, 5), 0.5, 0, 0), RAMP.wood[2]),
  p(place(box(1.0, 0.9, 0.04), 0, 0.9, 0), RAMP.sand[3]),
];
const forge: StaticBuilder = () => [
  p(box(1.0, 0.8, 1.0), RAMP.stone[2]),
  p(place(box(0.6, 0.3, 0.6), 0, 0.8, 0), RAMP.dark[1]),
  p(place(box(0.4, 0.4, 0.4), 0, 0.9, 0), RAMP.crimson[3]),
];
const cabinet: StaticBuilder = () => {
  const parts: Part[] = [p(box(1.0, 1.4, 0.5), RAMP.wood[2])];
  for (let i = 0; i < 3; i++) parts.push(p(place(box(0.9, 0.06, 0.52), 0, 0.35 + i * 0.42, 0), RAMP.wood[1]));
  parts.push(p(place(box(0.1, 0.1, 0.08), 0.3, 0.7, 0.26), RAMP.gold[3]));
  return parts;
};

export const STATIC_PROPS: Record<string, StaticBuilder> = {
  tree,
  pine,
  bush,
  rock,
  rockArch,
  house,
  armory,
  temple,
  lighthouse,
  dock,
  crate,
  mailbox,
  fence,
  signpost,
  titleBoard,
  terminal,
  altar,
  workbench,
  draftingTable,
  scrollRack,
  ledger,
  dummy,
  map: mapProp,
  forge,
  cabinet,
};

// ── Dynamic (animated / lit) props ───────────────────────────────────────────
const lantern: DynamicBuilder = (s) => {
  const g = new THREE.Group();
  const post = new THREE.Mesh(cylinder(0.05, 0.06, 1.2, 5), toon(RAMP.wood[1]));
  post.castShadow = true;
  const core = new THREE.Mesh(box(0.24, 0.3, 0.24), emissive(RAMP.gold[4]));
  core.position.y = 1.3;
  const light = new THREE.PointLight(new THREE.Color(RAMP.gold[3]), 1.2, 4, 2);
  light.position.set(0, 1.3, 0);
  g.add(post, core, light);
  const base = 1.2;
  return {
    object: g,
    light,
    update: (t) => {
      light.intensity = base + Math.sin(t * 6 + s) * 0.15;
    },
    dispose: () => {
      post.geometry.dispose();
      core.geometry.dispose();
    },
  };
};

const brazier: DynamicBuilder = (s) => {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(cylinder(0.18, 0.1, 0.7, 6), toon(RAMP.dark[2]));
  const bowl = new THREE.Mesh(cylinder(0.34, 0.2, 0.25, 8), toon(RAMP.stone[1]));
  bowl.position.y = 0.7;
  const flame = new THREE.Mesh(cone(0.24, 0.5, 6), emissive(RAMP.gold[4]));
  flame.position.y = 0.9;
  const light = new THREE.PointLight(new THREE.Color(RAMP.gold[4]), 1.6, 6, 2);
  light.position.set(0, 1.1, 0);
  g.add(stand, bowl, flame, light);
  return {
    object: g,
    light,
    update: (t) => {
      const f = 1.5 + Math.sin(t * 11 + s) * 0.3 + Math.sin(t * 23 + s) * 0.1;
      light.intensity = f;
      flame.scale.y = 1 + Math.sin(t * 13 + s) * 0.12;
    },
    dispose: () => {
      stand.geometry.dispose();
      bowl.geometry.dispose();
      flame.geometry.dispose();
    },
  };
};

const waterwheel: DynamicBuilder = () => {
  const g = new THREE.Group();
  const hub = new THREE.Mesh(cylinder(0.18, 0.18, 0.3, 8), toon(RAMP.wood[1]));
  hub.rotation.z = Math.PI / 2;
  hub.position.y = 1.1;
  const wheel = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const spoke = new THREE.Mesh(box(0.08, 1.8, 0.12), toon(RAMP.wood[2]));
    spoke.rotation.z = (i / 8) * Math.PI * 2;
    wheel.add(spoke);
  }
  wheel.position.y = 1.1;
  g.add(hub, wheel);
  return {
    object: g,
    update: (_t, dt) => {
      wheel.rotation.x += dt * 0.6;
    },
    dispose: () => {
      hub.geometry.dispose();
      wheel.children.forEach((c) => (c as THREE.Mesh).geometry.dispose());
    },
  };
};

const gear: DynamicBuilder = () => {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(cylinder(0.5, 0.5, 0.15, 12), toon(RAMP.stone[2]));
  disc.position.y = 1.0;
  disc.rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) {
    const tooth = new THREE.Mesh(box(0.16, 0.16, 0.15), toon(RAMP.stone[3]));
    const a = (i / 8) * Math.PI * 2;
    tooth.position.set(Math.cos(a) * 0.55, 1.0, Math.sin(a) * 0.55);
    g.add(tooth);
  }
  g.add(disc);
  return {
    object: g,
    update: (_t, dt) => {
      g.rotation.y += dt * 0.8;
    },
    dispose: () => {
      disc.geometry.dispose();
      g.children.forEach((c) => (c as THREE.Mesh).geometry?.dispose());
    },
  };
};

export const DYNAMIC_PROPS: Record<string, DynamicBuilder> = {
  lantern,
  brazier,
  waterwheel,
  gear,
};

export function isDynamic(kind: string): boolean {
  return kind in DYNAMIC_PROPS;
}

/** Build merged meshes from static parts grouped by colour. */
export function mergePartsByColor(parts: Part[]): THREE.Mesh[] {
  const byColor = new Map<string, THREE.BufferGeometry[]>();
  const flags = new Map<string, { cast: boolean; receive: boolean }>();
  for (const part of parts) {
    if (!byColor.has(part.color)) {
      byColor.set(part.color, []);
      flags.set(part.color, { cast: part.cast ?? true, receive: part.receive ?? false });
    }
    byColor.get(part.color)!.push(part.geo);
  }
  const meshes: THREE.Mesh[] = [];
  byColor.forEach((geos, color) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const merged = geos.length === 1 ? geos[0] : mergeGeos(geos);
    const mesh = new THREE.Mesh(merged, toon(color));
    const f = flags.get(color)!;
    mesh.castShadow = f.cast;
    mesh.receiveShadow = f.receive;
    meshes.push(mesh);
  });
  return meshes;
}

function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // local import to avoid a top-level dependency cycle in some bundlers
  const merged = new THREE.BufferGeometry();
  let total = 0;
  for (const g of geos) {
    const nonIndexed = g.index ? g.toNonIndexed() : g;
    total += nonIndexed.attributes.position.count;
  }
  const positions = new Float32Array(total * 3);
  let offset = 0;
  for (const g of geos) {
    const ni = g.index ? g.toNonIndexed() : g;
    const arr = ni.attributes.position.array as ArrayLike<number>;
    positions.set(arr as Float32Array, offset);
    offset += ni.attributes.position.count * 3;
    if (ni !== g) ni.dispose();
  }
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeVertexNormals();
  return merged;
}
