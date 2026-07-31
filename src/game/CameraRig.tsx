import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerRuntime } from './playerRuntime';
import { useSettingsStore } from '../state/useSettingsStore';

// Follow camera (spec §16.1): fixed yaw, exponential damping, no motion sickness.
const CAMERA_OFFSET = new THREE.Vector3(0, 7, 9);
const LOOK_AT_OFFSET = new THREE.Vector3(0, 0.8, 0);
const CAMERA_DAMPING = 4;
const LOOK_DAMPING = 6;

export default function CameraRig() {
  const lookTarget = useRef(new THREE.Vector3(0, 0.8, 0.5));
  const desired = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const reduced = useSettingsStore.getState().reducedMotion;
    // Reduced motion → near-instant follow (no swimming camera).
    const camLambda = reduced ? 30 : CAMERA_DAMPING;
    const lookLambda = reduced ? 30 : LOOK_DAMPING;

    desired.current.set(
      playerRuntime.x + CAMERA_OFFSET.x,
      playerRuntime.y + CAMERA_OFFSET.y,
      playerRuntime.z + CAMERA_OFFSET.z,
    );

    if (!initialized.current) {
      initialized.current = true;
      state.camera.position.copy(desired.current);
      lookTarget.current.set(
        playerRuntime.x + LOOK_AT_OFFSET.x,
        playerRuntime.y + LOOK_AT_OFFSET.y,
        playerRuntime.z + LOOK_AT_OFFSET.z,
      );
    } else {
      state.camera.position.lerp(desired.current, 1 - Math.exp(-camLambda * dt));
      lookTarget.current.lerp(
        new THREE.Vector3(
          playerRuntime.x + LOOK_AT_OFFSET.x,
          playerRuntime.y + LOOK_AT_OFFSET.y,
          playerRuntime.z + LOOK_AT_OFFSET.z,
        ),
        1 - Math.exp(-lookLambda * dt),
      );
    }
    state.camera.lookAt(lookTarget.current);
  });

  return null;
}
