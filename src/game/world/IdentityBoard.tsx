import { RAMP } from '../art/palette';
import { labelTexture, woodTexture } from '../art/textures';
import { profile } from '../../content/profile';

/**
 * The large identity board on the north terrace (spec §4). Texture text is
 * acceptable here because it duplicates HTML content (name + tagline).
 */
export default function IdentityBoard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* posts */}
      <mesh position={[-3, 1.2, 0]} castShadow>
        <boxGeometry args={[0.3, 2.4, 0.3]} />
        <meshStandardMaterial color={RAMP.wood[1]} map={woodTexture()} />
      </mesh>
      <mesh position={[3, 1.2, 0]} castShadow>
        <boxGeometry args={[0.3, 2.4, 0.3]} />
        <meshStandardMaterial color={RAMP.wood[1]} map={woodTexture()} />
      </mesh>
      {/* board face */}
      <mesh position={[0, 1.9, 0.05]} castShadow>
        <boxGeometry args={[6.4, 2.3, 0.18]} />
        <meshStandardMaterial
          color={RAMP.bone[4]}
          map={labelTexture('identity-board', [profile.name.toUpperCase(), profile.tagline.toUpperCase()], {
            width: 512,
            height: 192,
          })}
        />
      </mesh>
      {/* frame */}
      <mesh position={[0, 3.12, 0.05]}>
        <boxGeometry args={[6.8, 0.22, 0.26]} />
        <meshStandardMaterial color={RAMP.wood[2]} map={woodTexture()} />
      </mesh>
      <mesh position={[0, 0.68, 0.05]}>
        <boxGeometry args={[6.8, 0.22, 0.26]} />
        <meshStandardMaterial color={RAMP.wood[2]} map={woodTexture()} />
      </mesh>
    </group>
  );
}
