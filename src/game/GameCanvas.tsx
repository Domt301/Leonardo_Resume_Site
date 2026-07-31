import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import World from './World';
import Player from './Player';
import CameraRig from './CameraRig';
import { VOID } from './art/palette';
import { useSettingsStore } from '../state/useSettingsStore';
import { useGameStore } from '../state/useGameStore';

const DPR_BY_QUALITY = { low: 1, medium: 1.5, high: 2 } as const;

/** The R3F canvas (spec §13.2). */
export default function GameCanvas() {
  const quality = useSettingsStore((s) => s.quality);
  const spawn = useGameStore((s) => s.spawnPoint);
  const dpr = Math.min(
    DPR_BY_QUALITY[quality],
    typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  );

  return (
    <Canvas
      shadows={quality !== 'low'}
      dpr={dpr}
      camera={{
        fov: 35,
        near: 0.1,
        far: 100,
        position: [spawn[0], spawn[1] + 8, spawn[2] + 10.5],
      }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        state.gl.setClearColor(VOID);
        if (import.meta.env.DEV) {
          const w = window as unknown as Record<string, unknown>;
          w.__r3f = state;
          void Promise.all([
            import('./controls/inputMap'),
            import('./playerRuntime'),
            import('../state/useGameStore'),
          ]).then(([im, pr, gs]) => {
            w.__debug = { input: im.input, moveVector: im.moveVector, playerRuntime: pr.playerRuntime, useGameStore: gs.useGameStore };
          });
        }
      }}
      aria-hidden="true"
      className="pixelated"
    >
      <Suspense fallback={null}>
        <World />
        <Player />
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
