import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { toon, emissive } from '../art/toon';
import { LEVEL_HEIGHT } from '../world/Terrain';

// Leonardo (spec §8). ~16 boxes, no skeletal animation. Locked identity cues in
// priority order: glasses, goatee, receded hair cap, black polo + gold crest,
// blue jeans, wrist watch. Movement is camera-relative; animation is procedural.

export type CellSample = { tier: number; y: number } | null;
export type Sampler = (x: number, z: number) => CellSample;

const SPEED = 4.2;
const TURN_RATE = 14;

type AnimState = 'idle' | 'walk' | 'interact' | 'claim';

function meshBox(w: number, h: number, d: number, color: string, unlit = false): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), unlit ? emissive(color) : toon(color));
  m.castShadow = true;
  return m;
}

export class Player {
  readonly root = new THREE.Group();
  readonly position = new THREE.Vector3();
  private tier = 1;
  private yaw = 0;

  private hips = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();

  private animTime = 0;
  private state: AnimState = 'idle';
  private stateT = 0;
  private geoms: THREE.BufferGeometry[] = [];

  moving = false;

  constructor() {
    this.buildRig();
    this.root.add(this.hips);
  }

  private track(m: THREE.Object3D): THREE.Object3D {
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) this.geoms.push(mesh.geometry);
    });
    return m;
  }

  private buildRig(): void {
    const { hips, torso, head, armL, armR, legL, legR } = this;
    hips.position.y = 0.66;

    // legs
    legL.position.set(-0.11, 0, 0);
    legR.position.set(0.11, 0, 0);
    const legGeoL = meshBox(0.16, 0.52, 0.19, RAMP.denim[2]);
    legGeoL.position.y = -0.26;
    const legGeoR = meshBox(0.16, 0.52, 0.19, RAMP.denim[2]);
    legGeoR.position.y = -0.26;
    const shoeL = meshBox(0.18, 0.12, 0.26, RAMP.cloth[0]);
    shoeL.position.set(0, -0.56, 0.03);
    const shoeR = meshBox(0.18, 0.12, 0.26, RAMP.cloth[0]);
    shoeR.position.set(0, -0.56, 0.03);
    legL.add(legGeoL, shoeL);
    legR.add(legGeoR, shoeR);
    hips.add(legL, legR);

    // torso
    torso.position.y = 0.34;
    const torsoMesh = meshBox(0.46, 0.56, 0.26, RAMP.cloth[2]);
    torso.add(torsoMesh);
    const belt = meshBox(0.48, 0.07, 0.28, RAMP.dark[2]);
    belt.position.y = -0.26;
    const buckle = meshBox(0.1, 0.07, 0.05, RAMP.gold[2]);
    buckle.position.set(0, -0.26, 0.15);
    const crest = meshBox(0.06, 0.06, 0.06, RAMP.gold[3]);
    crest.position.set(-0.14, 0.12, 0.14);
    torso.add(belt, buckle, crest);
    hips.add(torso);

    // head
    head.position.y = 0.46;
    const headMesh = meshBox(0.4, 0.4, 0.36, RAMP.skin[3]);
    const hairCap = meshBox(0.42, 0.16, 0.38, RAMP.hair[2]);
    hairCap.position.set(0, 0.14, -0.02);
    const glasses = meshBox(0.42, 0.09, 0.05, RAMP.dark[0]);
    glasses.position.set(0, 0.02, 0.19);
    const lensL = meshBox(0.12, 0.09, 0.03, RAMP.bone[4], true);
    lensL.position.set(-0.1, 0.02, 0.21);
    const lensR = meshBox(0.12, 0.09, 0.03, RAMP.bone[4], true);
    lensR.position.set(0.1, 0.02, 0.21);
    const goatee = meshBox(0.14, 0.12, 0.04, RAMP.hair[0]);
    goatee.position.set(0, -0.19, 0.17);
    const moustache = meshBox(0.18, 0.05, 0.04, RAMP.hair[0]);
    moustache.position.set(0, -0.1, 0.18);
    head.add(headMesh, hairCap, glasses, lensL, lensR, goatee, moustache);
    torso.add(head);

    // arms
    armL.position.set(-0.32, 0.18, 0);
    armR.position.set(0.32, 0.18, 0);
    const armMeshL = meshBox(0.13, 0.46, 0.13, RAMP.cloth[3]);
    armMeshL.position.y = -0.23;
    const armMeshR = meshBox(0.13, 0.46, 0.13, RAMP.cloth[1]);
    armMeshR.position.y = -0.23;
    const handL = meshBox(0.13, 0.13, 0.13, RAMP.skin[3]);
    handL.position.y = -0.5;
    const handR = meshBox(0.13, 0.13, 0.13, RAMP.skin[3]);
    handR.position.y = -0.5;
    const watch = meshBox(0.14, 0.05, 0.14, RAMP.dark[3]);
    watch.position.y = -0.42;
    const watchFace = meshBox(0.08, 0.03, 0.08, RAMP.stone[4]);
    watchFace.position.set(0, -0.42, 0.07);
    armL.add(armMeshL, handL);
    armR.add(armMeshR, handR, watch, watchFace);
    torso.add(armL, armR);

    this.track(this.hips);
  }

  spawn(pos: THREE.Vector3, tier: number): void {
    this.position.copy(pos);
    this.tier = tier;
    this.root.position.copy(pos);
    this.yaw = 0;
  }

  triggerInteract(): void {
    if (this.state === 'claim') return;
    this.state = 'interact';
    this.stateT = 0;
  }
  triggerClaim(): void {
    this.state = 'claim';
    this.stateT = 0;
  }

  /** Camera-relative movement + collision. Returns whether the player moved. */
  move(
    axis: THREE.Vector2,
    forward: THREE.Vector3,
    right: THREE.Vector3,
    dt: number,
    sample: Sampler,
  ): void {
    const wish = new THREE.Vector3()
      .addScaledVector(forward, axis.y)
      .addScaledVector(right, axis.x);
    const len = wish.length();
    this.moving = len > 0.01 && this.state !== 'claim';

    if (this.moving) {
      wish.normalize();
      const step = SPEED * dt;
      // slide: try X then Z independently
      this.tryAxis(wish.x * step, 0, sample);
      this.tryAxis(0, wish.z * step, sample);

      // face movement direction (never snaps)
      const targetYaw = Math.atan2(wish.x, wish.z);
      this.yaw = approachAngle(this.yaw, targetYaw, TURN_RATE * dt);
    }

    // vertical: lerp toward the tier we're standing on
    const s = sample(this.position.x, this.position.z);
    if (s) this.tier = s.tier;
    const targetY = this.tier * LEVEL_HEIGHT;
    this.position.y += (targetY - this.position.y) * Math.min(1, dt * 12);

    this.root.position.copy(this.position);
    this.root.rotation.y = this.yaw;

    this.animate(dt);
  }

  private tryAxis(dx: number, dz: number, sample: Sampler): void {
    const nx = this.position.x + dx;
    const nz = this.position.z + dz;
    const s = sample(nx, nz);
    if (s && Math.abs(s.tier - this.tier) <= 1) {
      this.position.x = nx;
      this.position.z = nz;
    }
  }

  private animate(dt: number): void {
    const { hips, torso, head, armL, armR, legL, legR } = this;

    if (this.state === 'interact' || this.state === 'claim') {
      this.stateT += dt;
    }

    if (this.state === 'claim') {
      // both arms overhead, hips lift, held ~900ms
      const k = Math.min(1, this.stateT / 0.25);
      armL.rotation.x = -2.6 * k;
      armR.rotation.x = -2.6 * k;
      hips.position.y = 0.66 + 0.1 * k;
      if (this.stateT > 0.9) this.state = 'idle';
      return;
    }

    if (this.state === 'interact') {
      const k = Math.sin(Math.min(1, this.stateT / 0.18) * Math.PI);
      armR.rotation.x = -0.9 * k;
      if (this.stateT > 0.18) this.state = this.moving ? 'walk' : 'idle';
    } else {
      this.state = this.moving ? 'walk' : 'idle';
    }

    if (this.moving) {
      this.animTime += dt;
      const t = this.animTime;
      const swing = Math.sin(t * 9) * 0.7;
      armL.rotation.x = swing;
      armR.rotation.x = this.state === 'interact' ? armR.rotation.x : -swing;
      legL.rotation.x = -swing;
      legR.rotation.x = swing;
      hips.position.y = 0.66 + Math.abs(Math.sin(t * 9)) * 0.05;
      torso.rotation.y = Math.sin(t * 9) * 0.06;
      head.rotation.y = 0;
    } else {
      const t = this.animTime;
      this.animTime += dt;
      armL.rotation.x *= 0.85;
      if (this.state !== 'interact') armR.rotation.x *= 0.85;
      legL.rotation.x *= 0.85;
      legR.rotation.x *= 0.85;
      hips.position.y = 0.66 + Math.sin(t * 1.6) * 0.012;
      torso.rotation.y *= 0.9;
      head.rotation.y = Math.sin(t * 0.6) * 0.05;
    }
  }

  dispose(): void {
    for (const g of this.geoms) g.dispose();
    this.root.removeFromParent();
  }
}

function approachAngle(current: number, target: number, maxDelta: number): number {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}
