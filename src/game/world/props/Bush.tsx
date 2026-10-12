import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../../art/palette';
import { useSettingsStore } from '../../../state/useSettingsStore';
import { bushStates } from '../../pickupRuntime';
import { HEART_POP_S, RUSTLE_S } from '../../systems/pickupSystem';

/**
 * Low-poly bush the player can walk into. Reads its slot in `bushStates`:
 * rustles on entry, glows faintly while a heart is hiding inside, and plays a
 * rising heart when one is picked up. Not a blocker.
 */
export default function Bush({
  index,
  position,
  scale = 1,
  swayOffset = 0,
}: {
  index: number;
  position: [number, number, number];
  scale?: number;
  swayOffset?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const canopy = useRef<THREE.Group>(null);
  const hintMat = useRef<THREE.MeshStandardMaterial>(null);
  const heart = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    const s = bushStates[index];
    if (!g || !s) return;
    const now = clock.elapsedTime;
    const reduced = useSettingsStore.getState().reducedMotion;

    if (canopy.current) {
      canopy.current.rotation.z = reduced ? 0 : Math.sin(now * 0.8 + swayOffset) * 0.03;
    }

    const rustleT = s.rustleUntil - now;
    let k = 1;
    if (rustleT > 0) k = reduced ? 1.06 : 1 + 0.1 * (rustleT / RUSTLE_S) * Math.sin(now * 35);
    g.scale.setScalar(scale * k);

    if (hintMat.current) {
      hintMat.current.emissiveIntensity = s.heart
        ? reduced
          ? 0.14
          : 0.1 + 0.08 * Math.sin(now * 2.5)
        : 0;
    }

    const h = heart.current;
    if (!h) return;
    const popT = s.popStartedAt > 0 ? now - s.popStartedAt : Infinity;
    if (s.heart) {
      h.visible = true;
      h.position.set(0.05, 0.55 + (reduced ? 0 : Math.sin(now * 2 + swayOffset) * 0.03), 0.15);
      h.scale.setScalar(1);
      h.rotation.y = reduced ? 0 : now * 1.5;
    } else if (popT < HEART_POP_S) {
      const p = popT / HEART_POP_S;
      h.visible = true;
      h.position.set(0.05, 0.55 + 1.1 * p, 0.15);
      h.scale.setScalar(Math.max(0.01, 1 - p));
      h.rotation.y += dt * 6;
    } else {
      h.visible = false;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <group ref={canopy}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <dodecahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            ref={hintMat}
            color={RAMP.leaf[1]}
            emissive={RAMP.crimson[3]}
            emissiveIntensity={0}
            flatShading
          />
        </mesh>
        <mesh position={[0.22, 0.42, 0.12]} castShadow>
          <dodecahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial color={RAMP.leaf[2]} flatShading />
        </mesh>
        <mesh position={[-0.2, 0.4, -0.14]} castShadow>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={RAMP.leaf[3]} flatShading />
        </mesh>
      </group>
      {/* pixel heart: two cubes + one rotated cube */}
      <group ref={heart} position={[0.05, 0.55, 0.15]}>
        <mesh position={[-0.06, 0.08, 0]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={RAMP.crimson[3]} emissive={RAMP.crimson[4]} emissiveIntensity={0.4} flatShading />
        </mesh>
        <mesh position={[0.06, 0.08, 0]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={RAMP.crimson[3]} emissive={RAMP.crimson[4]} emissiveIntensity={0.4} flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.17, 0.17, 0.17]} />
          <meshStandardMaterial color={RAMP.crimson[3]} emissive={RAMP.crimson[4]} emissiveIntensity={0.4} flatShading />
        </mesh>
      </group>
    </group>
  );
}
