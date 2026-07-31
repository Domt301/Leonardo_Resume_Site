import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { toon } from '../art/toon';

// A plank span with rails between two island landings (spec §9.4). Built along
// the segment p0→p1 regardless of orientation so ring islands connect cleanly.

export interface BridgeMesh {
  group: THREE.Group;
  p0: THREE.Vector3;
  p1: THREE.Vector3;
  width: number;
  a: string;
  b: string;
  dispose: () => void;
}

export function buildBridge(p0: THREE.Vector3, p1: THREE.Vector3, width: number, a: string, b: string): BridgeMesh {
  const group = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const dir = new THREE.Vector3().subVectors(p1, p0);
  const length = dir.length();
  dir.normalize();
  const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
  const angle = Math.atan2(dir.x, dir.z);

  const deckY = (p0.y + p1.y) / 2 - 0.05;

  // planks
  const plankCount = Math.max(3, Math.round(length / 0.6));
  const plankGeo = new THREE.BoxGeometry(width, 0.1, 0.5);
  geoms.push(plankGeo);
  const planks = new THREE.InstancedMesh(plankGeo, toon(RAMP.wood[2]), plankCount);
  planks.castShadow = true;
  planks.receiveShadow = true;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  for (let i = 0; i < plankCount; i++) {
    const t = (i + 0.5) / plankCount;
    const pos = new THREE.Vector3().lerpVectors(p0, p1, t);
    pos.y = deckY + (Math.sin(i * 1.7) * 0.02);
    m.compose(pos, q, new THREE.Vector3(1, 1, 1));
    planks.setMatrixAt(i, m);
  }
  planks.instanceMatrix.needsUpdate = true;
  group.add(planks);

  // rails
  const railGeo = new THREE.BoxGeometry(0.08, 0.35, length);
  geoms.push(railGeo);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, toon(RAMP.wood[1]));
    rail.position.copy(mid);
    rail.position.y = deckY + 0.35;
    const offset = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).multiplyScalar((side * width) / 2);
    rail.position.add(offset);
    rail.rotation.y = angle;
    rail.castShadow = true;
    group.add(rail);
  }

  return {
    group,
    p0: p0.clone(),
    p1: p1.clone(),
    width,
    a,
    b,
    dispose: () => geoms.forEach((g) => g.dispose()),
  };
}

/** Distance from point (x,z) to segment; returns {t, dist, y} or null. */
export function projectToBridge(bridge: BridgeMesh, x: number, z: number): { y: number; dist: number } | null {
  const { p0, p1 } = bridge;
  const dx = p1.x - p0.x;
  const dz = p1.z - p0.z;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return null;
  let t = ((x - p0.x) * dx + (z - p0.z) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const px = p0.x + dx * t;
  const pz = p0.z + dz * t;
  const dist = Math.hypot(x - px, z - pz);
  const y = p0.y + (p1.y - p0.y) * t - 0.05;
  return { y, dist };
}
