import { RAMP } from '../../art/palette';
import { stoneTexture } from '../../art/textures';

/** Experience Ridge cave mouth: two rock pillars + lintel + rubble. */
export default function CaveArch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-1.1, 1, 0]} rotation={[0, 0.15, 0.05]} castShadow>
        <boxGeometry args={[1.1, 2.4, 1.4]} />
        <meshStandardMaterial color={RAMP.stone[2]} map={stoneTexture()} flatShading />
      </mesh>
      <mesh position={[1.1, 1, 0]} rotation={[0, -0.12, -0.06]} castShadow>
        <boxGeometry args={[1.1, 2.4, 1.4]} />
        <meshStandardMaterial color={RAMP.stone[2]} map={stoneTexture()} flatShading />
      </mesh>
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0.03]} castShadow>
        <boxGeometry args={[3.4, 0.9, 1.5]} />
        <meshStandardMaterial color={RAMP.stone[3]} map={stoneTexture()} flatShading />
      </mesh>
      {/* dark mouth */}
      <mesh position={[0, 0.95, 0.05]}>
        <boxGeometry args={[1.15, 1.9, 1.35]} />
        <meshStandardMaterial color="#07060d" />
      </mesh>
      {/* rubble */}
      <mesh position={[-1.9, 0.2, 0.9]} rotation={[0.2, 0.5, 0]}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={RAMP.stone[1]} flatShading />
      </mesh>
      <mesh position={[1.8, 0.18, 1]} rotation={[0.1, 0.9, 0.2]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={RAMP.stone[2]} flatShading />
      </mesh>
      {/* crest flag */}
      <mesh position={[2.2, 2, 0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 3.4, 6]} />
        <meshStandardMaterial color={RAMP.wood[2]} flatShading />
      </mesh>
      <mesh position={[2.63, 3.35, 0.4]}>
        <boxGeometry args={[0.8, 0.5, 0.04]} />
        <meshStandardMaterial color={RAMP.crimson[2]} flatShading />
      </mesh>
    </group>
  );
}
