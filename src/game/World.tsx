import Island from './world/Island';
import IdentityBoard from './world/IdentityBoard';
import SignPost from './world/props/SignPost';
import Tree from './world/props/Tree';
import Rock from './world/props/Rock';
import Fence from './world/props/Fence';
import House from './world/props/House';
import CaveArch from './world/props/CaveArch';
import Shrine from './world/props/Shrine';
import Chicken from './world/props/Chicken';
import BridgeSpan from './world/props/BridgeSpan';
import Water from './effects/Water';
import Waterfall from './effects/Waterfall';
import Lighting from './Lighting';
import { INTERACTABLES } from './world/interactables';
import { POSITIONS, TREES, ROCKS } from './world/layout';
import { heightAt } from './systems/heightSystem';
import { useSettingsStore } from '../state/useSettingsStore';

/** The whole island scene, assembled from layout.ts (spec §8). */
export default function World() {
  const quality = useSettingsStore((s) => s.quality);
  const pen = POSITIONS.fencePen;

  return (
    <group>
      <Lighting />
      <Water />
      <Island />

      {/* Identity board on the terrace */}
      <IdentityBoard
        position={[POSITIONS.identityBoard[0], 0.9, POSITIONS.identityBoard[1]]}
      />

      {/* Landmarks */}
      <House position={[POSITIONS.house[0], 1.0, POSITIONS.house[1]]} />
      <CaveArch position={[POSITIONS.caveArch[0], 1.2, POSITIONS.caveArch[1]]} />
      <Shrine position={[POSITIONS.shrine[0], 0, POSITIONS.shrine[1]]} />
      <BridgeSpan position={[POSITIONS.bridge[0], 0, POSITIONS.bridge[1]]} />

      {/* Routed signposts */}
      {INTERACTABLES.map((it) => (
        <SignPost key={it.id} section={it.section} label={it.label} position={it.position} />
      ))}

      {/* Skills Grove pen: fences with an east gate + chickens */}
      <Fence from={[pen.min[0], pen.min[1]]} to={[pen.min[0], pen.max[1]]} />
      <Fence from={[pen.min[0], pen.min[1]]} to={[pen.max[0], pen.min[1]]} />
      <Fence from={[pen.min[0], pen.max[1]]} to={[pen.max[0], pen.max[1]]} />
      <Fence from={[pen.max[0], pen.min[1]]} to={[pen.max[0], pen.min[1] + 1.2]} />
      <Fence from={[pen.max[0], pen.max[1] - 0.8]} to={[pen.max[0], pen.max[1]]} />
      {quality !== 'low' && (
        <>
          <Chicken pen={pen} seed={1} />
          <Chicken pen={pen} seed={2} />
          <Chicken pen={pen} seed={3} />
        </>
      )}

      {/* About Overlook: bench + scroll pedestal by the pond */}
      <group position={[8.6, 0, 4.6]} rotation={[0, -0.6, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[1.4, 0.1, 0.45]} />
          <meshStandardMaterial color="#956a3f" flatShading />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.14, 0]}>
            <boxGeometry args={[0.12, 0.28, 0.4]} />
            <meshStandardMaterial color="#6e4c2e" flatShading />
          </mesh>
        ))}
      </group>

      {/* Trees & rocks */}
      {TREES.map((t, i) => (
        <Tree
          key={`tree-${i}`}
          position={[t.pos[0], heightAt(t.pos[0], t.pos[1]), t.pos[1]]}
          scale={t.scale}
          swayOffset={i * 1.7}
        />
      ))}
      {ROCKS.map((r, i) => (
        <Rock
          key={`rock-${i}`}
          position={[r.pos[0], heightAt(r.pos[0], r.pos[1]), r.pos[1]]}
          scale={r.scale}
        />
      ))}

      {/* Waterfalls off the east cliff (quality-gated) */}
      {quality !== 'low' && (
        <>
          <Waterfall position={[15.05, -0.2, -3]} rotation={[0, Math.PI / 2, 0]} height={1.6} />
          <Waterfall position={[15.05, -0.2, 5]} rotation={[0, Math.PI / 2, 0]} height={1.6} width={1.8} />
        </>
      )}
    </group>
  );
}
