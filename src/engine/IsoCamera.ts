import * as THREE from 'three';

// The isometric rig (spec §4.1). Orthographic, never perspective. Rotates in 90°
// snaps with a 250ms ease; follows the player with a deadzone. The key-light
// direction is derived here so it stays screen-relative through all four facings.

const BASE_AZIMUTH = Math.PI / 4; // 45°
const FOLLOW_LERP = 0.12;
const DEADZONE = 1.5;
const SNAP_MS = 250;

export class IsoCamera {
  readonly camera: THREE.OrthographicCamera;
  private halfHeight = 9;
  private aspect = 1;
  private elevation = THREE.MathUtils.degToRad(30);

  /** Current (eased) azimuth and the snap target. */
  private azimuth = BASE_AZIMUTH;
  private azimuthTarget = BASE_AZIMUTH;
  private snapT = 1;

  private target = new THREE.Vector3();
  private follow = new THREE.Vector3();

  // exposed each frame for camera-relative movement
  readonly forward = new THREE.Vector3(0, 0, -1);
  readonly right = new THREE.Vector3(1, 0, 0);

  private bounds: THREE.Box2 | null = null;

  constructor() {
    this.camera = new THREE.OrthographicCamera(-9, 9, 9, -9, 0.1, 400);
    this.updateProjection();
    this.recompute();
  }

  setElevationDeg(deg: number): void {
    this.elevation = THREE.MathUtils.degToRad(deg);
    this.recompute();
  }

  setHalfHeight(h: number): void {
    this.halfHeight = THREE.MathUtils.clamp(h, 6, 14);
    this.updateProjection();
  }
  zoom(delta: number): void {
    this.setHalfHeight(this.halfHeight + delta);
  }
  get frustumHalfHeight(): number {
    return this.halfHeight;
  }

  resize(aspect: number): void {
    this.aspect = aspect;
    this.updateProjection();
  }

  /** Snap the camera 90° (dir = +1 CW, -1 CCW). */
  rotate(dir: number): void {
    this.azimuthTarget += (dir * Math.PI) / 2;
    this.snapT = 0;
  }

  /** Instantly set facing (used by reduced-motion + fast travel). */
  setAzimuthInstant(a: number): void {
    this.azimuth = a;
    this.azimuthTarget = a;
    this.snapT = 1;
    this.recompute();
  }

  snapImmediate(): void {
    this.azimuth = this.azimuthTarget;
    this.snapT = 1;
    this.recompute();
  }

  setTargetInstant(p: THREE.Vector3): void {
    this.target.copy(p);
    this.follow.copy(p);
    this.recompute();
  }

  setBounds(min: THREE.Vector2, max: THREE.Vector2): void {
    this.bounds = new THREE.Box2(min.clone(), max.clone());
  }
  clearBounds(): void {
    this.bounds = null;
  }

  /** Follow a world position with a deadzone; call once per render frame. */
  update(followPos: THREE.Vector3, dt: number, reducedMotion: boolean): void {
    this.follow.copy(followPos);

    // deadzone follow
    const d = this.target.distanceTo(this.follow);
    if (d > DEADZONE) {
      const lerp = reducedMotion ? 1 : 1 - Math.pow(1 - FOLLOW_LERP, dt * 60);
      this.target.lerp(this.follow, lerp);
    }

    if (this.bounds) {
      this.target.x = THREE.MathUtils.clamp(this.target.x, this.bounds.min.x, this.bounds.max.x);
      this.target.z = THREE.MathUtils.clamp(this.target.z, this.bounds.min.y, this.bounds.max.y);
    }

    if (this.snapT < 1) {
      this.snapT = reducedMotion ? 1 : Math.min(1, this.snapT + (dt * 1000) / SNAP_MS);
      const e = easeInOut(this.snapT);
      this.azimuth = THREE.MathUtils.lerp(this.azimuth, this.azimuthTarget, e);
      if (this.snapT >= 1) this.azimuth = this.azimuthTarget;
    }
    this.recompute();
  }

  /** Screen-relative key-light direction (comes from upper-left of screen). */
  keyLightDirection(): THREE.Vector3 {
    // upper-left in screen space → offset the camera azimuth by +135°, high angle
    const a = this.azimuth + (Math.PI * 3) / 4;
    const el = THREE.MathUtils.degToRad(50);
    return new THREE.Vector3(
      Math.cos(el) * Math.cos(a),
      Math.sin(el),
      Math.cos(el) * Math.sin(a),
    ).normalize();
  }

  private updateProjection(): void {
    const hh = this.halfHeight;
    const hw = hh * this.aspect;
    this.camera.left = -hw;
    this.camera.right = hw;
    this.camera.top = hh;
    this.camera.bottom = -hh;
    this.camera.updateProjectionMatrix();
  }

  private recompute(): void {
    const dir = new THREE.Vector3(
      Math.cos(this.elevation) * Math.cos(this.azimuth),
      Math.sin(this.elevation),
      Math.cos(this.elevation) * Math.sin(this.azimuth),
    );
    this.camera.position.copy(this.target).addScaledVector(dir, 120);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();

    // camera-relative ground basis: W (forward) = away from camera on XZ
    this.forward.set(-Math.cos(this.azimuth), 0, -Math.sin(this.azimuth)).normalize();
    this.right.set(this.forward.z, 0, -this.forward.x).normalize();
  }
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
