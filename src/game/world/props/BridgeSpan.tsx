import { RAMP } from '../../art/palette';
import { stoneTexture } from '../../art/textures';

/** Stone bridge off the south edge — dead-ends at a rail (spec §30.4). */
export default function BridgeSpan({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* deck */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.25, 3.6]} />
        <meshStandardMaterial color={RAMP.stone[2]} map={stoneTexture()} />
      </mesh>
      {/* side walls */}
      <mesh position={[-1.2, 0.22, 0]}>
        <boxGeometry args={[0.25, 0.45, 3.6]} />
        <meshStandardMaterial color={RAMP.stone[3]} map={stoneTexture()} />
      </mesh>
      <mesh position={[1.2, 0.22, 0]}>
        <boxGeometry args={[0.25, 0.45, 3.6]} />
        <meshStandardMaterial color={RAMP.stone[3]} map={stoneTexture()} />
      </mesh>
      {/* end rail */}
      <mesh position={[0, 0.3, 1.85]}>
        <boxGeometry args={[2.65, 0.6, 0.22]} />
        <meshStandardMaterial color={RAMP.stone[3]} map={stoneTexture()} />
      </mesh>
      {/* mailbox */}
      <group position={[-1.7, 0, -1.4]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.09, 0.9, 0.09]} />
          <meshStandardMaterial color={RAMP.wood[2]} flatShading />
        </mesh>
        <mesh position={[0, 0.98, 0]} castShadow>
          <boxGeometry args={[0.34, 0.3, 0.5]} />
          <meshStandardMaterial color={RAMP.crimson[2]} flatShading />
        </mesh>
        <mesh position={[0, 1.02, 0.26]}>
          <boxGeometry args={[0.1, 0.14, 0.03]} />
          <meshStandardMaterial color={RAMP.gold[3]} emissive={RAMP.gold[2]} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
