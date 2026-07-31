import * as THREE from 'three';

// Keyboard, pointer-drag, wheel, touch (spec §4, §8.3). Movement is reported as
// a local axis (x = strafe, y = forward); the Player maps it to the camera basis
// so W always moves away from the camera. Discrete actions are edge-triggered
// and drained once per frame by the Engine.

export type Action = 'interact' | 'rotateCW' | 'rotateCCW' | 'map' | 'pause' | 'resume';

const DRAG_ROTATE_PX = 60;

export class Input {
  private keys = new Set<string>();
  private actions: Action[] = [];
  private touchAxis = new THREE.Vector2();
  private el: HTMLElement | null = null;

  private dragging = false;
  private dragStartX = 0;
  private dragAccum = 0;
  private dragMoved = false;
  wheelDelta = 0;

  /** Set by a pointer tap that wasn't a drag; consumed by the Picker. */
  clickNDC: THREE.Vector2 | null = null;

  attach(el: HTMLElement): void {
    this.el = el;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.el?.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.el?.removeEventListener('wheel', this.onWheel);
    this.el = null;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (this.keys.has(k)) return;
    this.keys.add(k);
    switch (k) {
      case 'e':
      case ' ':
      case 'enter':
        this.actions.push('interact');
        break;
      case 'q':
        this.actions.push('rotateCCW');
        break;
      case 'r':
        this.actions.push('rotateCW');
        break;
      case 'm':
        this.actions.push('map');
        break;
      case 'escape':
        this.actions.push('pause');
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private onPointerDown = (e: PointerEvent) => {
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragAccum = 0;
    this.dragMoved = false;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX;
    if (Math.abs(dx) > 6) this.dragMoved = true;
    this.dragAccum += e.movementX ?? 0;
    if (this.dragAccum > DRAG_ROTATE_PX) {
      this.actions.push('rotateCW');
      this.dragAccum = 0;
    } else if (this.dragAccum < -DRAG_ROTATE_PX) {
      this.actions.push('rotateCCW');
      this.dragAccum = 0;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.dragging && !this.dragMoved && this.el) {
      const rect = this.el.getBoundingClientRect();
      this.clickNDC = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    }
    this.dragging = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.wheelDelta += Math.sign(e.deltaY);
  };

  /** Touch virtual stick, values in [-1,1]. Written by the React TouchControls. */
  setTouchAxis(x: number, y: number): void {
    this.touchAxis.set(x, y);
  }
  pushTouchAction(a: Action): void {
    this.actions.push(a);
  }

  /** Local movement axis: x = strafe (D+/A-), y = forward (W+/S-). */
  moveAxis(out: THREE.Vector2): THREE.Vector2 {
    let x = 0;
    let y = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) y += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    x += this.touchAxis.x;
    y += this.touchAxis.y;
    out.set(x, y);
    if (out.lengthSq() > 1) out.normalize();
    return out;
  }

  drainActions(): Action[] {
    const a = this.actions;
    this.actions = [];
    return a;
  }

  consumeWheel(): number {
    const d = this.wheelDelta;
    this.wheelDelta = 0;
    return d;
  }

  consumeClick(): THREE.Vector2 | null {
    const c = this.clickNDC;
    this.clickNDC = null;
    return c;
  }
}
