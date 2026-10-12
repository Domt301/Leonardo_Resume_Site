import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../../art/palette';
import { useSettingsStore } from '../../../state/useSettingsStore';
import { useGameStore } from '../../../state/useGameStore';
import { flock } from '../../chickenRuntime';
import { playerRuntime } from '../../playerRuntime';
import { HOP_S, isAngry, stepChicken } from '../../systems/chickenSystem';
import type { Rect } from '../../../types/game';

/**
 * Tiny chicken, clamped to its pen. Calm: deterministic wander (seeded, no
 * Math.random, static under reduced motion). Angry: chases the player, glows
 * red, and bites. All state lives in the shared `flock` runtime slot so the
 * Player can resolve contacts; this component only moves and poses it.
 */
export default function Chicken({ index, pen }: { index: number; pen: Rect }) {
  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const headMat = useRef<THREE.MeshStandardMaterial>(null);
  const comb = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, rawDt) => {
    const g = group.current;
    const c = flock.chickens[index];
    if (!g || !c) return;
    const now = clock.elapsedTime;
    const dt = Math.min(rawDt, 1 / 20);
    const reduced = useSettingsStore.getState().reducedMotion;
    const { movementEnabled, fainted } = useGameStore.getState();
    const angry = isAngry(flock, now);

    // Freeze while a panel is open or the player is fainting.
    let walking = false;
    if (movementEnabled && !fainted) {
      walking = stepChicken(c, flock, pen, playerRuntime, now, dt, reduced);
    }

    const hopT = c.hopUntil - now;
    const hopY = !reduced && hopT > 0 ? Math.sin((hopT / HOP_S) * Math.PI) * 0.22 : 0;
    g.position.set(c.x, hopY, c.z);
    g.rotation.y = c.heading;
    const peck = !reduced && !walking && !angry ? Math.max(0, Math.sin(now * 6 + c.seed)) * 0.25 : 0;
    g.rotation.x = peck;

    const glow = angry ? (reduced ? 0.5 : 0.45 + 0.3 * Math.sin(now * 10)) : 0;
    if (bodyMat.current) bodyMat.current.emissiveIntensity = glow;
    if (headMat.current) headMat.current.emissiveIntensity = glow;
    if (comb.current) comb.current.scale.setScalar(angry ? 1.5 : 1);
  });

  return (
    <group ref={group}>
      {/* body */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.26, 0.24, 0.36]} />
        <meshStandardMaterial
          ref={bodyMat}
          color={RAMP.bone[4]}
          emissive={RAMP.crimson[2]}
          emissiveIntensity={0}
          flatShading
        />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.42, 0.16]}>
        <boxGeometry args={[0.16, 0.18, 0.16]} />
        <meshStandardMaterial
          ref={headMat}
          color={RAMP.bone[4]}
          emissive={RAMP.crimson[2]}
          emissiveIntensity={0}
          flatShading
        />
      </mesh>
      {/* comb */}
      <mesh ref={comb} position={[0, 0.54, 0.16]}>
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
