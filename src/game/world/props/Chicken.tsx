import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../../art/palette';
import { useSettingsStore } from '../../../state/useSettingsStore';
import type { Vec2 } from '../../../types/game';

/**
 * Tiny wandering chicken, clamped to its pen. Deterministic drift — no
 * Math.random at runtime; seeded by `seed`. Static under reduced motion.
 */
export default function Chicken({
  pen,
  seed,
}: {
  pen: { min: Vec2; max: Vec2 };
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const heading = useRef(seed * 2.4);
  const pos = useRef<Vec2>([
    pen.min[0] + 0.7 + ((seed * 7.3) % (pen.max[0] - pen.min[0] - 1.4)),
    pen.min[1] + 0.7 + ((seed * 3.7) % (pen.max[1] - pen.min[1] - 1.4)),
  ]);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    if (useSettingsStore.getState().reducedMotion) {
      g.position.set(pos.current[0], 0, pos.current[1]);
      return;
    }
    const t = clock.elapsedTime;
    // wander: slow heading drift with per-seed phase; pause cycles
    const walking = Math.sin(t * 0.5 + seed * 3) > -0.2;
    heading.current += Math.sin(t * 0.9 + seed * 5) * 0.9 * dt;
    if (walking) {
      const speed = 0.5;
      let nx = pos.current[0] + Math.sin(heading.current) * speed * dt;
      let nz = pos.current[1] + Math.cos(heading.current) * speed * dt;
      // bounce off pen walls
      if (nx < pen.min[0] + 0.4 || nx > pen.max[0] - 0.4) {
        heading.current = -heading.current;
        nx = pos.current[0];
      }
      if (nz < pen.min[1] + 0.4 || nz > pen.max[1] - 0.4) {
        heading.current = Math.PI - heading.current;
        nz = pos.current[1];
      }
      pos.current = [nx, nz];
      g.rotation.y = heading.current;
    }
    const peck = walking ? 0 : Math.max(0, Math.sin(t * 6 + seed)) * 0.25;
    g.position.set(pos.current[0], 0, pos.current[1]);
    g.rotation.x = peck;
  });

  return (
    <group ref={group}>
      {/* body */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.26, 0.24, 0.36]} />
        <meshStandardMaterial color={RAMP.bone[4]} flatShading />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.42, 0.16]}>
        <boxGeometry args={[0.16, 0.18, 0.16]} />
        <meshStandardMaterial color={RAMP.bone[4]} flatShading />
      </mesh>
      {/* comb */}
      <mesh position={[0, 0.54, 0.16]}>
        <boxGeometry args={[0.06, 0.08, 0.1]} />
        <meshStandardMaterial color={RAMP.crimson[3]} flatShading />
      </mesh>
      {/* beak */}
      <mesh position={[0, 0.4, 0.26]}>
        <boxGeometry args={[0.06, 0.05, 0.08]} />
        <meshStandardMaterial color={RAMP.gold[3]} flatShading />
      </mesh>
      {/* legs */}
      <mesh position={[-0.06, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.12, 0.03]} />
        <meshStandardMaterial color={RAMP.gold[2]} flatShading />
      </mesh>
      <mesh position={[0.06, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.12, 0.03]} />
        <meshStandardMaterial color={RAMP.gold[2]} flatShading />
      </mesh>
    </group>
  );
}
