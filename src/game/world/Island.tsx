import { useMemo } from 'react';
import { RAMP } from '../art/palette';
import { dirtTexture, grassTexture, stoneTexture, waterTexture } from '../art/textures';
import { ISLAND, PLATEAUS, POSITIONS, RAMPS } from './layout';

const CLIFF_DEPTH = 1.8;

/**
 * Terrain built directly from layout.ts: lowland slab, plateau slabs, stone
 * stairs matching the ramp rects, dirt paths, and the pond.
 */
export default function Island() {
  const grass = useMemo(() => {
    const t = grassTexture();
    t.repeat.set(15, 12);
    return t;
  }, []);
  const dirt = useMemo(() => {
    const t = dirtTexture();
    t.repeat.set(2, 8);
    return t;
  }, []);
  const pondWater = useMemo(() => {
    const t = waterTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(3, 3);
    return t;
  }, []);

  const width = ISLAND.maxX - ISLAND.minX;
  const depth = ISLAND.maxZ - ISLAND.minZ;

  return (
    <group>
      {/* Lowland slab */}
      <mesh position={[0, -CLIFF_DEPTH / 2, 0]}>
        <boxGeometry args={[width, CLIFF_DEPTH, depth]} />
        <meshStandardMaterial color={RAMP.dirt[1]} flatShading />
      </mesh>
      {/* Grass top */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={RAMP.grass[2]} map={grass} />
      </mesh>

      {/* Plateau slabs + grass tops */}
      {PLATEAUS.map((p, i) => {
        const w = p.rect.max[0] - p.rect.min[0];
        const d = p.rect.max[1] - p.rect.min[1];
        const cx = (p.rect.min[0] + p.rect.max[0]) / 2;
        const cz = (p.rect.min[1] + p.rect.max[1]) / 2;
        const h = p.y + 0.4;
        return (
          <group key={i}>
            <mesh position={[cx, p.y - h / 2, cz]} castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color={RAMP.stone[1]} flatShading />
            </mesh>
            <mesh position={[cx, p.y + 0.001, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[w, d]} />
              <meshStandardMaterial color={RAMP.grass[2]} map={grass} />
            </mesh>
          </group>
        );
      })}

      {/* Stairs: step boxes filling each ramp rect */}
      {RAMPS.map((r, ri) => {
        const steps = 6;
        const w = r.rect.max[0] - r.rect.min[0];
        const d = r.rect.max[1] - r.rect.min[1];
        const cx = (r.rect.min[0] + r.rect.max[0]) / 2;
        return (
          <group key={`ramp-${ri}`}>
            {Array.from({ length: steps }, (_, i) => {
              const t0 = i / steps;
              const t1 = (i + 1) / steps;
              const y = r.from + (r.to - r.from) * ((t0 + t1) / 2);
              const z0 = r.rect.min[1] + d * t0;
              const z1 = r.rect.min[1] + d * t1;
              return (
                <mesh key={i} position={[cx, y - 0.15, (z0 + z1) / 2]} receiveShadow>
                  <boxGeometry args={[w, 0.3, z1 - z0 + 0.02]} />
                  <meshStandardMaterial color={RAMP.stone[2]} map={stoneTexture()} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Dirt paths */}
      <mesh position={[0, 0.012, 2.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 13.4]} />
        <meshStandardMaterial color={RAMP.dirt[2]} map={dirt} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0.7, 0.011, 2.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14.5, 1.6]} />
        <meshStandardMaterial color={RAMP.dirt[2]} map={dirt} transparent opacity={0.9} />
      </mesh>

      {/* Pond + sand rim + outflow stream toward the east edge */}
      <mesh
        position={[POSITIONS.pond[0], 0.03, POSITIONS.pond[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[POSITIONS.pondRadius + 0.35, 24]} />
        <meshStandardMaterial color={RAMP.sand[2]} />
      </mesh>
      <mesh
        position={[POSITIONS.pond[0], 0.04, POSITIONS.pond[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[POSITIONS.pondRadius, 24]} />
        <meshStandardMaterial color={RAMP.water[2]} map={pondWater} transparent opacity={0.92} />
      </mesh>
      <mesh position={[14.1, 0.035, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial color={RAMP.water[2]} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
