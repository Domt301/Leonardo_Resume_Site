import { RAMP } from '../../art/palette';
import { roofTexture, woodTexture } from '../../art/textures';

/** Projects workshop: timber body, blue tiled pyramid roof, door + window. */
export default function House({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[4.2, 2.2, 3.4]} />
        <meshStandardMaterial color={RAMP.bone[3]} map={woodTexture()} />
      </mesh>
      {/* timber corner beams */}
      {[
        [-2.05, -1.65],
        [-2.05, 1.65],
        [2.05, -1.65],
        [2.05, 1.65],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.1, z]}>
          <boxGeometry args={[0.18, 2.2, 0.18]} />
          <meshStandardMaterial color={RAMP.wood[1]} flatShading />
        </mesh>
      ))}
      {/* roof */}
      <mesh position={[0, 2.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.4, 1.6, 4]} />
        <meshStandardMaterial color={RAMP.royal[2]} map={roofTexture()} flatShading />
      </mesh>
      {/* door (faces south, toward the sign) */}
      <mesh position={[0, 0.75, 1.71]}>
        <boxGeometry args={[0.9, 1.5, 0.06]} />
        <meshStandardMaterial color={RAMP.wood[1]} map={woodTexture()} />
      </mesh>
      {/* window */}
      <mesh position={[1.3, 1.35, 1.71]}>
        <boxGeometry args={[0.7, 0.7, 0.05]} />
        <meshStandardMaterial color={RAMP.gold[3]} emissive={RAMP.gold[2]} emissiveIntensity={0.5} />
      </mesh>
      {/* crates by the door */}
      <mesh position={[-1.6, 0.3, 2.1]} rotation={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={RAMP.wood[3]} map={woodTexture()} />
      </mesh>
      <mesh position={[-1.1, 0.22, 2.35]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={RAMP.wood[2]} map={woodTexture()} />
      </mesh>
    </group>
  );
}
