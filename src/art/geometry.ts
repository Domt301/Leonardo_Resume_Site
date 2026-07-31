import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Primitive helpers + merge utilities. All props are built from these so a whole
// island's trees can collapse to one draw call.

/** Deterministic 0..1 hash for vertex/prop jitter (never Math.random). */
export function hash(x: number, y = 0, z = 0): number {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) ^ 0x9e3779b9;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 100000) / 100000;
}

/** A box centred at (0, h/2, 0) so it sits on the ground by default. */
export function box(w: number, h: number, d: number, standOnGround = true): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  if (standOnGround) g.translate(0, h / 2, 0);
  return g;
}

/** Triangular-prism roof, ridge along X, base w×d, height h, sitting on ground. */
export function prism(w: number, h: number, d: number): THREE.BufferGeometry {
  const hw = w / 2;
  const hd = d / 2;
  const positions = new Float32Array([
    // front gable (z+)
    -hw, 0, hd, hw, 0, hd, 0, h, hd,
    // back gable (z-)
    hw, 0, -hd, -hw, 0, -hd, 0, h, -hd,
    // left slope
    -hw, 0, -hd, -hw, 0, hd, 0, h, hd, -hw, 0, -hd, 0, h, hd, 0, h, -hd,
    // right slope
    hw, 0, hd, hw, 0, -hd, 0, h, -hd, hw, 0, hd, 0, h, -hd, 0, h, hd,
    // bottom
    -hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, -hd, hw, 0, hd, -hw, 0, hd,
  ]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
}

/** Cone sitting on the ground (base radius r, height h). */
export function cone(r: number, h: number, seg = 7): THREE.BufferGeometry {
  const g = new THREE.ConeGeometry(r, h, seg);
  g.translate(0, h / 2, 0);
  return g;
}

/** Cylinder sitting on the ground. */
export function cylinder(rt: number, rb: number, h: number, seg = 6): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg);
  g.translate(0, h / 2, 0);
  return g;
}

/** Icosahedron with hash-jittered verts (rocks / foliage lumps). */
export function blob(r: number, seed: number, detail = 0, jitter = 0.18): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(r, detail);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const j = 1 + (hash(seed + i, i) - 0.5) * jitter * 2;
    pos.setXYZ(i, pos.getX(i) * j, pos.getY(i) * j, pos.getZ(i) * j);
  }
  g.computeVertexNormals();
  return g;
}

/** Transform a geometry in place (returns it for chaining). */
export function place(
  g: THREE.BufferGeometry,
  x = 0,
  y = 0,
  z = 0,
  rot = 0,
  scale = 1,
): THREE.BufferGeometry {
  if (scale !== 1) g.scale(scale, scale, scale);
  if (rot) g.rotateY(rot);
  g.translate(x, y, z);
  return g;
}

/**
 * Merge geometries, tagging each with a material group. Returns { geometry,
 * materialIndices } so callers can build a single multi-material mesh.
 */
export function mergeGroups(parts: { geo: THREE.BufferGeometry; mat: number }[]): {
  geometry: THREE.BufferGeometry;
  count: number;
} {
  // Sort by material so groups are contiguous.
  const byMat = new Map<number, THREE.BufferGeometry[]>();
  for (const p of parts) {
    if (!byMat.has(p.mat)) byMat.set(p.mat, []);
    byMat.get(p.mat)!.push(p.geo);
  }
  const ordered = [...byMat.keys()].sort((a, b) => a - b);
  const merged = BufferGeometryUtils.mergeGeometries(
    ordered.map((m) => BufferGeometryUtils.mergeGeometries(byMat.get(m)!, false)),
    true,
  );
  return { geometry: merged, count: ordered.length };
}

/** Simple non-grouped merge (single material). */
export function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  return BufferGeometryUtils.mergeGeometries(parts, false);
}

/** Recursively dispose a group's geometries. Materials are shared/cached. */
export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
  });
}
