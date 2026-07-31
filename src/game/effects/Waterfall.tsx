import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { waterfallTexture } from '../art/textures';
import { useSettingsStore } from '../../state/useSettingsStore';

/**
 * Vertical scrolling waterfall plane with a foam quad at the base (spec §17.6).
 * `rotation` orients the face away from the island edge.
 */
export default function Waterfall({
  position,
  width = 2.2,
  height = 1.8,
  rotation = [0, Math.PI / 2, 0] as [number, number, number],
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
  rotation?: [number, number, number];
}) {
  const foam = useRef<THREE.Mesh>(null);
  const map = useMemo(() => {
    const t = waterfallTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(width / 1.2, height / 1.6);
    return t;
  }, [width, height]);

  useFrame(({ clock }, dt) => {
    const reduced = useSettingsStore.getState().reducedMotion;
    if (!reduced) map.offset.y -= dt * 1.4;
    if (foam.current) {
      const s = reduced ? 1 : 1 + Math.sin(clock.elapsedTime * 5) * 0.07;
      foam.current.scale.set(s, 1, s);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={RAMP.water[3]}
          map={map}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* foam at the base */}
      <mesh ref={foam} position={[0, -height / 2 + 0.05, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[width * 0.55, 12]} />
        <meshBasicMaterial color={RAMP.water[4]} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
