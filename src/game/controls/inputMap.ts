// Shared input state (spec §9.1). A plain singleton written by the keyboard
// hook and touch controls, read inside useFrame — never through React state.

export interface InputState {
  keys: Set<string>;
  touch: { x: number; z: number };
}

export const input: InputState = {
  keys: new Set(),
  touch: { x: 0, z: 0 },
};

const FORWARD = ['KeyW', 'ArrowUp'];
const BACK = ['KeyS', 'ArrowDown'];
const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];

export const MOVEMENT_CODES = new Set([...FORWARD, ...BACK, ...LEFT, ...RIGHT]);

/** Combined normalized movement vector on the XZ plane (screen-up = −Z). */
export function moveVector(): [number, number] {
  let x = 0;
  let z = 0;
  const has = (codes: string[]) => codes.some((c) => input.keys.has(c));
  if (has(FORWARD)) z -= 1;
  if (has(BACK)) z += 1;
  if (has(LEFT)) x -= 1;
  if (has(RIGHT)) x += 1;
  x += input.touch.x;
  z += input.touch.z;
  const len = Math.hypot(x, z);
  if (len < 0.15) return [0, 0]; // dead zone
  const scale = Math.min(1, len) / len;
  return [x * scale, z * scale];
}

export function clearInput(): void {
  input.keys.clear();
  input.touch.x = 0;
  input.touch.z = 0;
}
