import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../../art/palette';
import { stoneTexture } from '../../art/textures';
import { useSettingsStore } from '../../../state/useSettingsStore';

/** Certifications Shrine: stone pedestal + three floating emissive crystals. */
export default function Shrine({ position }: { position: [number, number, number] }) {
  const crystals = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!crystals.current) return;
    const reduced = useSettingsStore.getState().reducedMotion;
    const t = reduced ? 0 : clock.elapsedTime;
    crystals.current.rotation.y = t * 0.4;
    crystals.current.children.forEach((c, i) => {
      c.position.y = 1.7 + (reduced ? 0 : Math.sin(t * 1.4 + i * 2.1) * 0.12);
    });
  });

  const colors = [RAMP.gold[3], RAMP.teal[3], RAMP.royal[3]];

  return (
    <group position={position}>
      {/* pedestal */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.85, 1, 0.6, 8]} />
        <meshStandardMaterial color={RAMP.stone[2]} map={stoneTexture()} flatShading />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.25, 8]} />
        <meshStandardMaterial color={RAMP.stone[3]} flatShading />
      </mesh>
      {/* floating crystals */}
      <group ref={crystals}>
        {colors.map((color, i) => {
          const angle = (i / colors.length) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.55, 1.7, Math.sin(angle) * 0.55]}>
              <octahedronGeometry args={[0.24, 0]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
                flatShading
              />
            </mesh>
          );
        })}
      </group>
      {/* soft glow */}
      <pointLight position={[0, 1.8, 0]} intensity={2.2} distance={5} color={RAMP.gold[3]} />
    </group>
  );
}
