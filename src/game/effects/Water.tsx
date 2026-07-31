import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { waterTexture } from '../art/textures';
import { WATER_Y } from '../world/layout';
import { useSettingsStore } from '../../state/useSettingsStore';

/** Sea plane with a slow scrolling noise texture (spec §17.5). */
export default function Water() {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const map = useMemo(() => {
    const t = waterTexture();
    t.repeat.set(24, 24);
    return t;
  }, []);

  useFrame((_, dt) => {
    if (useSettingsStore.getState().reducedMotion) return;
    map.offset.x += dt * 0.008;
    map.offset.y += dt * 0.012;
  });

  return (
    <mesh position={[0, WATER_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial
        ref={mat}
        color={RAMP.water[1]}
        map={map}
        transparent
        opacity={0.96}
      />
    </mesh>
  );
}
