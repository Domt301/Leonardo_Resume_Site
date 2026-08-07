import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { moveVector } from './controls/inputMap';
import { resolveCollisions } from './systems/collisionSystem';
import { heightAt } from './systems/heightSystem';
import { selectInteractable, zoneAt } from './systems/interactionSystem';
import { INTERACTABLES } from './world/interactables';
import { BLOCKERS, PLAYER_RADIUS, WALKABLE, ZONES } from './world/layout';
import { playerRuntime } from './playerRuntime';
import { useGameStore } from '../state/useGameStore';
import { RAMP } from './art/palette';
import type { Vec2 } from '../types/game';

// Movement constants (spec §9.2).
const WALK_SPEED = 3.2;
const ACCELERATION = 18;
const DECELERATION = 22;
const ROTATION_SPEED = 12;

const COLLISION_WORLD = { walkable: WALKABLE, blockers: BLOCKERS };

function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  let delta = (target - current) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * (1 - Math.exp(-lambda * dt));
}

/**
 * Kinematic player (spec §15): procedural primitive likeness of Leonardo —
 * black polo, glasses, goatee, short brown hair. Per-frame state lives in
 * refs/playerRuntime. Local +Z is the face; spawn rotation 0 faces the camera.
 */
export default function Player() {
  const group = useRef<THREE.Group>(null);
  const bodyGroup = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);

  const velocity = useRef<Vec2>([0, 0]);
  const walkPhase = useRef(0);
  const interactionClock = useRef(0);

  const spawn = useMemo(() => useGameStore.getState().spawnPoint, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const g = group.current;
    if (!g) return;

    const { movementEnabled, setActiveInteractable, setCurrentZone } = useGameStore.getState();

    // ── movement ────────────────────────────────────────────────────────────
    const [ix, iz] = movementEnabled ? moveVector() : [0, 0];
    const moving = ix !== 0 || iz !== 0;
    const targetVx = ix * WALK_SPEED;
    const targetVz = iz * WALK_SPEED;
    const lambda = moving ? ACCELERATION : DECELERATION;
    const blend = 1 - Math.exp(-lambda * dt);
    velocity.current[0] += (targetVx - velocity.current[0]) * blend;
    velocity.current[1] += (targetVz - velocity.current[1]) * blend;

    const speed = Math.hypot(velocity.current[0], velocity.current[1]);
    if (speed > 0.01) {
      const proposed: Vec2 = [
        playerRuntime.x + velocity.current[0] * dt,
        playerRuntime.z + velocity.current[1] * dt,
      ];
      const resolved = resolveCollisions(
        [playerRuntime.x, playerRuntime.z],
        proposed,
        PLAYER_RADIUS,
        COLLISION_WORLD,
      );
      playerRuntime.x = resolved[0];
      playerRuntime.z = resolved[1];
    }

    // ground height with a slight smoothing so stair steps don't pop
    const groundY = heightAt(playerRuntime.x, playerRuntime.z);
    playerRuntime.y += (groundY - playerRuntime.y) * Math.min(1, 20 * dt);
    playerRuntime.speed = speed;

    g.position.set(playerRuntime.x, playerRuntime.y, playerRuntime.z);

    // ── facing ──────────────────────────────────────────────────────────────
    if (speed > 0.2) {
      const target = Math.atan2(velocity.current[0], velocity.current[1]);
      playerRuntime.rotation = dampAngle(playerRuntime.rotation, target, ROTATION_SPEED, dt);
    }
    g.rotation.y = playerRuntime.rotation;

    // ── walk cycle ──────────────────────────────────────────────────────────
    const speedFactor = Math.min(1, speed / WALK_SPEED);
    walkPhase.current += dt * (4 + 6 * speedFactor);
    const swing = Math.sin(walkPhase.current * 2) * 0.55 * speedFactor;
    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing;
    if (rightLeg.current) rightLeg.current.rotation.x = swing;
    if (bodyGroup.current) {
      bodyGroup.current.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.06 * speedFactor;
    }

    // ── interaction + zone selection (~10 Hz) ───────────────────────────────
    interactionClock.current += dt;
    if (interactionClock.current > 0.1) {
      interactionClock.current = 0;
      const nearest = movementEnabled
        ? selectInteractable(playerRuntime.x, playerRuntime.z, INTERACTABLES)
        : null;
      setActiveInteractable(nearest?.id ?? null);
      const zone = zoneAt(playerRuntime.x, playerRuntime.z, ZONES);
      setCurrentZone(zone?.id ?? null);
    }
  });

  // set spawn once
  playerRuntime.x = spawn[0];
  playerRuntime.z = spawn[2];
  playerRuntime.y = heightAt(spawn[0], spawn[2]);

  return (
    <group ref={group} position={[spawn[0], playerRuntime.y, spawn[2]]}>
      <group ref={bodyGroup}>
        {/* black polo torso — broad chest tapering to a trim waist (hem at the
            waist so the jeans show) */}
        <mesh position={[0, 0.71, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.26, 0.42, 8]} />
          <meshStandardMaterial color="#0d0d0d" flatShading />
        </mesh>
        {/* polo collar */}
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 0.1, 8]} />
          <meshStandardMaterial color={RAMP.cloth[0]} flatShading />
        </mesh>
        {/* placket buttons */}
        <mesh position={[0, 0.8, 0.3]}>
          <boxGeometry args={[0.045, 0.18, 0.03]} />
          <meshStandardMaterial color={RAMP.cloth[3]} flatShading />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.14, 0]} castShadow>
          <sphereGeometry args={[0.26, 10, 8]} />
          <meshStandardMaterial color={RAMP.skin[3]} flatShading />
        </mesh>
        {/* short brown hair cap */}
        <mesh position={[0, 1.24, -0.03]}>
          <sphereGeometry args={[0.265, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color={RAMP.hair[2]} flatShading />
        </mesh>
        {/* glasses: framed light lenses + bridge on the face (+Z) */}
        {[-0.1, 0.1].map((x) => (
          <group key={x}>
            <mesh position={[x, 1.17, 0.24]}>
              <boxGeometry args={[0.13, 0.11, 0.035]} />
              <meshStandardMaterial color={RAMP.cloth[0]} flatShading />
            </mesh>
            <mesh position={[x, 1.17, 0.255]}>
              <boxGeometry args={[0.09, 0.07, 0.02]} />
              <meshStandardMaterial color={RAMP.stone[4]} flatShading />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.17, 0.25]}>
          <boxGeometry args={[0.09, 0.03, 0.03]} />
          <meshStandardMaterial color={RAMP.cloth[0]} flatShading />
        </mesh>
        {/* goatee */}
        <mesh position={[0, 1, 0.2]}>
          <boxGeometry args={[0.13, 0.11, 0.08]} />
          <meshStandardMaterial color={RAMP.hair[1]} flatShading />
        </mesh>
        {/* arms: muscular skin arms with short black polo-sleeve caps over big
            deltoids (nested so they swing together) */}
        <mesh ref={leftArm} position={[-0.42, 0.82, 0]} castShadow>
          <boxGeometry args={[0.17, 0.5, 0.16]} />
          <meshStandardMaterial color={RAMP.skin[3]} flatShading />
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.21, 0.18, 0.2]} />
            <meshStandardMaterial color="#0d0d0d" flatShading />
          </mesh>
        </mesh>
        <mesh ref={rightArm} position={[0.42, 0.82, 0]} castShadow>
          <boxGeometry args={[0.17, 0.5, 0.16]} />
          <meshStandardMaterial color={RAMP.skin[3]} flatShading />
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.21, 0.18, 0.2]} />
            <meshStandardMaterial color="#0d0d0d" flatShading />
          </mesh>
        </mesh>
      </group>
      {/* denim jeans legs — thicker thighs raised to meet the waist hem so the
          jeans are visible (outside the bob group so feet stay planted) */}
      <mesh ref={leftLeg} position={[-0.15, 0.28, 0]} castShadow>
        <boxGeometry args={[0.16, 0.52, 0.17]} />
        <meshStandardMaterial color="#3b5c8f" flatShading />
      </mesh>
      <mesh ref={rightLeg} position={[0.15, 0.28, 0]} castShadow>
        <boxGeometry args={[0.16, 0.52, 0.17]} />
        <meshStandardMaterial color="#3b5c8f" flatShading />
      </mesh>
    </group>
  );
}
