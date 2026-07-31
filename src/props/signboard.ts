import * as THREE from 'three';
import { toon } from '../art/toon';
import { RAMP } from '../art/palette';
import { cylinder } from '../art/geometry';

// A wooden signboard carrying a unique label texture (spec §11 in-world
// wayfinding). Because each board's texture is unique it stays an independent
// mesh (not merged), but there are only a handful per island.

export interface SignboardHandle {
  group: THREE.Group;
  dispose: () => void;
}

export function buildSignboard(texture: THREE.Texture, style: 'sign' | 'title'): SignboardHandle {
  const g = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const title = style === 'title';

  const boardW = title ? 3.8 : 1.72;
  const boardH = title ? 1.32 : 0.6;
  const postH = title ? 1.55 : 0.92;
  const postX = title ? 1.55 : 0.62;
  const postR = title ? 0.12 : 0.06;
  const boardY = title ? postH + 0.05 : postH + 0.02;

  // posts
  for (const sx of [-postX, postX]) {
    const pg = cylinder(postR, postR * 1.1, postH + boardH, title ? 6 : 5);
    geoms.push(pg);
    const post = new THREE.Mesh(pg, toon(RAMP.wood[title ? 1 : 2]));
    post.position.set(sx, 0, 0);
    post.castShadow = true;
    g.add(post);
  }

  // board pivot (angled 8° back)
  const pivot = new THREE.Group();
  pivot.position.set(0, boardY, 0);
  pivot.rotation.x = -0.14;
  g.add(pivot);

  const frameGeo = new THREE.BoxGeometry(boardW + 0.14, boardH + 0.14, 0.08);
  geoms.push(frameGeo);
  const frame = new THREE.Mesh(frameGeo, toon(RAMP.wood[title ? 3 : 3]));
  frame.castShadow = true;
  pivot.add(frame);

  const faceGeo = new THREE.PlaneGeometry(boardW, boardH);
  geoms.push(faceGeo);
  const faceMat = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.z = 0.05;
  pivot.add(face);

  // iron corner brackets on the title board
  if (title) {
    for (const [cx, cy] of [
      [-boardW / 2, boardH / 2],
      [boardW / 2, boardH / 2],
      [-boardW / 2, -boardH / 2],
      [boardW / 2, -boardH / 2],
    ] as const) {
      const bg = new THREE.BoxGeometry(0.22, 0.22, 0.14);
      geoms.push(bg);
      const b = new THREE.Mesh(bg, toon(RAMP.stone[1]));
      b.position.set(cx, cy, 0.03);
      pivot.add(b);
    }
  }

  return {
    group: g,
    dispose: () => {
      geoms.forEach((geo) => geo.dispose());
      faceMat.dispose();
    },
  };
}
