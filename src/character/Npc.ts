import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { toon, emissive } from '../art/toon';

// A simple guildmaster NPC (spec §10.2). A hooded low-poly figure, tinted per
// interior theme, with a gentle idle bob. No shared identity with the player.

export interface NpcHandle {
  group: THREE.Group;
  update: (t: number) => void;
  dispose: () => void;
}

export function buildNpc(robeRamp: keyof typeof RAMP = 'violet', seed = 0): NpcHandle {
  const g = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const add = (geo: THREE.BufferGeometry, color: string, y: number, unlit = false) => {
    geoms.push(geo);
    const m = new THREE.Mesh(geo, unlit ? emissive(color) : toon(color));
    m.position.y = y;
    m.castShadow = true;
    g.add(m);
    return m;
  };
  // robe (tapered cylinder), head, hood, two glowing eyes
  add(new THREE.CylinderGeometry(0.28, 0.5, 1.3, 7), RAMP[robeRamp][2], 0.65);
  const head = add(new THREE.BoxGeometry(0.34, 0.34, 0.32), RAMP.skin[2], 1.45);
  add(new THREE.BoxGeometry(0.4, 0.24, 0.38), RAMP[robeRamp][1], 1.62);
  const eyes = add(new THREE.BoxGeometry(0.26, 0.05, 0.04), RAMP.gold[4], 1.45, true);
  eyes.position.z = 0.17;
  const bob = new THREE.Group();

  return {
    group: g,
    update: (t) => {
      g.position.y = Math.sin(t * 1.4 + seed) * 0.03;
      head.rotation.y = Math.sin(t * 0.5 + seed) * 0.12;
      void bob;
    },
    dispose: () => geoms.forEach((geo) => geo.dispose()),
  };
}
