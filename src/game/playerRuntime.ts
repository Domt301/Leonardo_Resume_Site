// Per-frame player state shared between Player, CameraRig, and pickers —
// deliberately OUTSIDE React state and the zustand stores (spec §13.3).

export const playerRuntime = {
  x: 0,
  y: 0,
  z: 0.5,
  rotation: 0,
  speed: 0,
};
