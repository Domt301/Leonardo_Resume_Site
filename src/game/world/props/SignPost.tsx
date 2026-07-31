import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RAMP } from '../../art/palette';
import { labelTexture, woodTexture } from '../../art/textures';
import { useGameStore } from '../../../state/useGameStore';
import { useSettingsStore } from '../../../state/useSettingsStore';
import { useRoutePanel } from '../../../hooks/useRoutePanel';
import type { ResumeSection } from '../../../types/resume';

/**
 * Routed landmark signpost. Highlights (emissive lift + ground ring pulse) when
 * it is the active interactable (spec §9.5); clicking opens the section.
 */
export default function SignPost({
  section,
  label,
  position,
}: {
  section: ResumeSection;
  label: string;
  position: [number, number, number];
}) {
  const active = useGameStore((s) => s.activeInteractableId === section);
  const { openSection } = useRoutePanel();
  const ring = useRef<THREE.Mesh>(null);
  const board = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const reduced = useSettingsStore.getState().reducedMotion;
    if (ring.current) {
      ring.current.visible = active;
      const pulse = reduced ? 1 : 1 + Math.sin(clock.elapsedTime * 3) * 0.08;
      ring.current.scale.setScalar(pulse);
    }
    if (board.current) {
      const mat = board.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = active ? 0.35 : 0;
    }
  });

  // Board width scales with the label so long words stay legible.
  const boardWidth = Math.max(2.2, label.length * 0.19 + 0.5);
  const postX = boardWidth / 2 - 0.35;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        openSection(section, 'world');
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {/* posts */}
      <mesh position={[-postX, 0.55, 0]} castShadow>
        <boxGeometry args={[0.14, 1.1, 0.14]} />
        <meshStandardMaterial color={RAMP.wood[2]} map={woodTexture()} />
      </mesh>
      <mesh position={[postX, 0.55, 0]} castShadow>
        <boxGeometry args={[0.14, 1.1, 0.14]} />
        <meshStandardMaterial color={RAMP.wood[2]} map={woodTexture()} />
      </mesh>
      {/* board */}
      <mesh ref={board} position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[boardWidth, 0.75, 0.1]} />
        <meshStandardMaterial
          color={RAMP.bone[3]}
          map={labelTexture(`sign-${section}`, [label.toUpperCase()], {
            width: Math.round(boardWidth * 128),
            height: 96,
          })}
          emissive={RAMP.gold[3]}
          emissiveIntensity={0}
        />
      </mesh>
      {/* ground highlight ring */}
      <mesh ref={ring} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.9, 1.15, 24]} />
        <meshBasicMaterial color={RAMP.gold[3]} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
