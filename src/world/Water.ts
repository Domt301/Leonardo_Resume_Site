import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { toon, emissive } from '../art/toon';

// Water and the void (spec §6.4). The sea is one big plane spanning the whole
// archipelago; foam rings and waterfalls are per-island. Waves are two crossed
// sines quantised into three flat tones — exactly the reference look.

const SEA_Y = -0.35;

const SEA_VERT = /* glsl */ `
  uniform float uTime;
  varying float vWave;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float w1 = sin((p.x + uTime * 0.6) / 7.0);
    float w2 = sin((p.y + uTime * 0.4) / 11.0);
    float wave = (w1 + w2) * 0.04;
    vWave = w1 * 0.5 + w2 * 0.5;
    p.z += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const SEA_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uLo;
  uniform vec3 uMid;
  uniform vec3 uHi;
  uniform float uTime;
  varying float vWave;
  varying vec2 vUv;
  void main() {
    float band = vWave + 0.15 * sin((vUv.x * 40.0) + uTime * 0.5);
    vec3 c = uMid;
    if (band < -0.25) c = uLo;
    else if (band > 0.3) c = uHi;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export interface Sea {
  mesh: THREE.Mesh;
  update: (t: number) => void;
  dispose: () => void;
}

export function buildSea(span: number): Sea {
  const geo = new THREE.PlaneGeometry(span, span, Math.floor(span / 2), Math.floor(span / 2));
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLo: { value: new THREE.Color(RAMP.water[1]) },
      uMid: { value: new THREE.Color(RAMP.water[2]) },
      uHi: { value: new THREE.Color(RAMP.water[3]) },
    },
    vertexShader: SEA_VERT,
    fragmentShader: SEA_FRAG,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = SEA_Y;
  mesh.renderOrder = -1;
  return {
    mesh,
    update: (t) => {
      mat.uniforms.uTime.value = t;
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
}

/** A flat foam ring hugging an island's waterline (local coords). */
export function buildFoamRing(cols: number, rows: number): THREE.Mesh {
  const shape = new THREE.Shape();
  const w = cols;
  const d = rows;
  shape.moveTo(-0.6, -0.6);
  shape.lineTo(w + 0.6, -0.6);
  shape.lineTo(w + 0.6, d + 0.6);
  shape.lineTo(-0.6, d + 0.6);
  shape.lineTo(-0.6, -0.6);
  const hole = new THREE.Path();
  hole.moveTo(0.2, 0.2);
  hole.lineTo(w - 0.2, 0.2);
  hole.lineTo(w - 0.2, d - 0.2);
  hole.lineTo(0.2, d - 0.2);
  hole.lineTo(0.2, 0.2);
  shape.holes.push(hole);
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, emissive(RAMP.water[4]));
  mesh.position.y = SEA_Y + 0.02;
  return mesh;
}

/** A layered waterfall in local coords at a given edge line. */
export function buildWaterfall(x: number, z: number, width: number, topY: number): THREE.Group {
  const g = new THREE.Group();
  const total = topY + Math.abs(SEA_Y) + 1.4;
  // two stacked drops with a mid pool lip
  const midY = topY - total * 0.45;
  const drop = (w: number, yTop: number, yBot: number, tone: string) => {
    const h = yTop - yBot;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(tone));
    m.position.set(x, (yTop + yBot) / 2, z);
    g.add(m);
    // bright foam streaks
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.5, h), emissive(RAMP.water[4]));
    foam.position.set(x, (yTop + yBot) / 2, z + 0.01);
    g.add(foam);
  };
  drop(width, topY, midY, RAMP.water[3]);
  drop(width * 1.3, midY, SEA_Y - 0.2, RAMP.water[2]);
  // foam caps at each lip
  for (const [yy, ww] of [
    [topY, width],
    [midY, width * 1.15],
    [SEA_Y, width * 1.5],
  ] as const) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(ww, 0.14, 0.28), emissive(RAMP.bone[4]));
    cap.position.set(x, yy, z);
    g.add(cap);
  }
  return g;
}

export { SEA_Y };
