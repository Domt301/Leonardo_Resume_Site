import { useMemo } from 'react';
import { RAMP } from '../../art/palette';

/**
 * Wood fence run between two XZ points (posts + two rails). Y is constant.
 */
export default function Fence({
  from,
  to,
  y = 0,
}: {
  from: [number, number];
  to: [number, number];
  y?: number;
}) {
  const { posts, length, angle, cx, cz } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const len = Math.hypot(dx, dz);
    const count = Math.max(2, Math.round(len / 1.2) + 1);
    const p: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      p.push([from[0] + dx * t, from[1] + dz * t]);
    }
    return {
      posts: p,
      length: len,
      angle: Math.atan2(dx, dz),
      cx: (from[0] + to[0]) / 2,
      cz: (from[1] + to[1]) / 2,
    };
  }, [from, to]);

  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, y + 0.35, z]} castShadow>
          <boxGeometry args={[0.14, 0.7, 0.14]} />
          <meshStandardMaterial color={RAMP.wood[2]} flatShading />
        </mesh>
      ))}
      {[0.28, 0.52].map((railY) => (
        <mesh key={railY} position={[cx, y + railY, cz]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.08, 0.09, length]} />
          <meshStandardMaterial color={RAMP.wood[3]} flatShading />
        </mesh>
      ))}
    </group>
  );
}
