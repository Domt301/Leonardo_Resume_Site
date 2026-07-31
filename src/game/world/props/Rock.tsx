import { RAMP } from '../../art/palette';

export default function Rock({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]} rotation={[0.3, 0.8, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={RAMP.stone[2]} flatShading />
      </mesh>
      <mesh position={[0.35, 0.12, 0.2]} rotation={[0.1, 0.3, 0.4]}>
        <dodecahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={RAMP.stone[1]} flatShading />
      </mesh>
    </group>
  );
}
