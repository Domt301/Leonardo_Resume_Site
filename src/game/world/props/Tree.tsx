import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../../art/palette';
import { useSettingsStore } from '../../../state/useSettingsStore';

/** Chunky pine tree: trunk + stacked cones, gentle sway (spec §17.7). */
export default function Tree({
  position,
  scale = 1,
  swayOffset = 0,
}: {
  position: [number, number, number];
  scale?: number;
  swayOffset?: number;
}) {
  const canopy = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!canopy.current) return;
    if (useSettingsStore.getState().reducedMotion) {
      canopy.current.rotation.z = 0;
      return;
    }
    canopy.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + swayOffset) * 0.02;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1, 6]} />
        <meshStandardMaterial color={RAMP.wood[2]} flatShading />
      </mesh>
      <group ref={canopy}>
        <mesh position={[0, 1.35, 0]} castShadow>
          <coneGeometry args={[1.05, 1.3, 6]} />
          <meshStandardMaterial color={RAMP.leaf[1]} flatShading />
        </mesh>
        <mesh position={[0, 2.15, 0]} castShadow>
          <coneGeometry args={[0.78, 1.1, 6]} />
          <meshStandardMaterial color={RAMP.leaf[2]} flatShading />
        </mesh>
        <mesh position={[0, 2.85, 0]} castShadow>
          <coneGeometry args={[0.5, 0.9, 6]} />
          <meshStandardMaterial color={RAMP.leaf[3]} flatShading />
        </mesh>
      </group>
    </group>
  );
}
