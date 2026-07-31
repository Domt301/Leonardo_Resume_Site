import { RAMP } from '../art/palette';
import { labelTexture, stoneTexture, woodTexture } from '../art/textures';
import { profile } from '../../content/profile';

/**
 * The grand identity monument on the north plaza (spec §4): stone base,
 * gold-trimmed frame, name + title + tagline. Texture text is acceptable here
 * because it duplicates HTML content.
 */
export default function IdentityBoard({ position }: { position: [number, number, number] }) {
  const face = labelTexture(
    'identity-board-v2',
    [profile.name.toUpperCase(), profile.headline.toUpperCase(), profile.tagline.toUpperCase()],
    { width: 1024, height: 384, sub: RAMP.gold[1] },
  );

  return (
    <group position={position}>
      {/* stone base plinth */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 0.5, 1.3]} />
        <meshStandardMaterial color={RAMP.stone[2]} map={stoneTexture()} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <boxGeometry args={[8.2, 0.14, 1.1]} />
        <meshStandardMaterial color={RAMP.stone[3]} flatShading />
      </mesh>

      {/* posts */}
      {[-3.7, 3.7].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.75, 0]} castShadow>
            <boxGeometry args={[0.4, 2.6, 0.4]} />
            <meshStandardMaterial color={RAMP.wood[1]} map={woodTexture()} />
          </mesh>
          {/* gold finial */}
          <mesh position={[x, 3.25, 0]}>
            <octahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial
              color={RAMP.gold[3]}
              emissive={RAMP.gold[2]}
              emissiveIntensity={0.35}
              flatShading
            />
          </mesh>
        </group>
      ))}

      {/* board face */}
      <mesh position={[0, 2.0, 0.06]} castShadow>
        <boxGeometry args={[7.6, 2.5, 0.2]} />
        <meshStandardMaterial color={RAMP.bone[4]} map={face} />
      </mesh>

      {/* gold-trimmed frame */}
      {[3.36, 0.66].map((y) => (
        <mesh key={y} position={[0, y, 0.08]}>
          <boxGeometry args={[8, 0.2, 0.28]} />
          <meshStandardMaterial color={RAMP.gold[2]} emissive={RAMP.gold[1]} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {[-3.85, 3.85].map((x) => (
        <mesh key={x} position={[x, 2.0, 0.08]} >
          <boxGeometry args={[0.16, 2.7, 0.26]} />
          <meshStandardMaterial color={RAMP.gold[2]} emissive={RAMP.gold[1]} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* crest above the board */}
      <mesh position={[0, 3.68, 0.05]}>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 6]} />
        <meshStandardMaterial
          color={RAMP.gold[3]}
          emissive={RAMP.gold[2]}
          emissiveIntensity={0.4}
          flatShading
        />
      </mesh>

      {/* flanking braziers */}
      {[-4.6, 4.6].map((x) => (
        <group key={x} position={[x, 0, 0.2]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.9, 6]} />
            <meshStandardMaterial color={RAMP.stone[2]} flatShading />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <coneGeometry args={[0.22, 0.42, 6]} />
            <meshStandardMaterial
              color={RAMP.gold[4]}
              emissive={RAMP.crimson[3]}
              emissiveIntensity={0.9}
              flatShading
            />
          </mesh>
          <pointLight position={[0, 1.3, 0]} intensity={1.4} distance={4.5} color={RAMP.gold[3]} />
        </group>
      ))}
    </group>
  );
}
