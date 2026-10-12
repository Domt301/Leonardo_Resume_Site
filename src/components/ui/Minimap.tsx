import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useUIStore } from '../../state/useUIStore';
import { useGameStore } from '../../state/useGameStore';
import { useSettingsStore } from '../../state/useSettingsStore';
import { useIsTouch } from '../../hooks/useMediaQuery';
import { playerRuntime } from '../../game/playerRuntime';
import { flock } from '../../game/chickenRuntime';
import { bushStates } from '../../game/pickupRuntime';
import { RAMP, VOID } from '../../game/art/palette';
import { BUSHES, ISLAND, PLATEAUS, POSITIONS, RAMPS, TREES } from '../../game/world/layout';
import {
  MAP_H,
  MAP_W,
  describeMap,
  markerAt,
  worldToMap,
} from '../../game/systems/minimapProjection';
import { SECTION_LABELS } from '../../app/routeMap';
import { RESUME_SECTIONS, type ResumeSection } from '../../types/resume';
import type { Rect } from '../../types/game';

const SCALE = MAP_W / (ISLAND.maxX - ISLAND.minX); // px per world unit
const FRAME_INTERVAL_S = 1 / 12;

const SIGN_MARKERS = RESUME_SECTIONS.map((section) => {
  const [x, y] = worldToMap(POSITIONS.signs[section][0], POSITIONS.signs[section][1]);
  return { id: section, x, y };
});

type Ctx = CanvasRenderingContext2D;

function fillRectWorld(ctx: Ctx, r: Rect, fill: string) {
  const [x0, y0] = worldToMap(r.min[0], r.min[1]);
  const [x1, y1] = worldToMap(r.max[0], r.max[1]);
  ctx.fillStyle = fill;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

function fillCircleWorld(ctx: Ctx, x: number, z: number, radiusWorld: number, fill: string) {
  const [cx, cy] = worldToMap(x, z);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radiusWorld * SCALE), 0, Math.PI * 2);
  ctx.fill();
}

function dot(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function diamond(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
}

/** Terrain and landmarks — drawn once to an offscreen canvas. */
function drawStatic(ctx: Ctx) {
  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  ctx.fillStyle = RAMP.grass[1];
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  for (const p of PLATEAUS) fillRectWorld(ctx, p.rect, p.top === 'stone' ? RAMP.stone[2] : RAMP.grass[2]);
  for (const r of RAMPS) fillRectWorld(ctx, r.rect, RAMP.stone[1]);
  // dirt paths (dimensions from Island.tsx)
  fillRectWorld(ctx, { min: [-1.1, 2.3 - 6.7], max: [1.1, 2.3 + 6.7] }, RAMP.dirt[2]);
  fillRectWorld(ctx, { min: [0.7 - 7.25, 2.8 - 0.8], max: [0.7 + 7.25, 2.8 + 0.8] }, RAMP.dirt[2]);
  // bridge strip off the south edge
  fillRectWorld(ctx, { min: [-1.2, 9], max: [1.2, 12.3] }, RAMP.stone[3]);
  fillCircleWorld(ctx, POSITIONS.pond[0], POSITIONS.pond[1], POSITIONS.pondRadius, RAMP.water[2]);
  // pen outline
  {
    const pen = POSITIONS.fencePen;
    const [x0, y0] = worldToMap(pen.min[0], pen.min[1]);
    const [x1, y1] = worldToMap(pen.max[0], pen.max[1]);
    ctx.strokeStyle = RAMP.wood[3];
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0 - 1, y1 - y0 - 1);
  }
  fillRectWorld(
    ctx,
    { min: [POSITIONS.house[0] - 2.3, POSITIONS.house[1] - 1.9], max: [POSITIONS.house[0] + 2.3, POSITIONS.house[1] + 1.9] },
    RAMP.wood[2],
  );
  fillCircleWorld(ctx, POSITIONS.caveArch[0], POSITIONS.caveArch[1], 1.6, RAMP.stone[0]);
  fillCircleWorld(ctx, POSITIONS.shrine[0], POSITIONS.shrine[1], 0.9, RAMP.gold[1]);
  for (const t of TREES) fillCircleWorld(ctx, t.pos[0], t.pos[1], 0.5 * t.scale, RAMP.leaf[1]);
  for (const b of BUSHES) fillCircleWorld(ctx, b.pos[0], b.pos[1], 0.4 * b.scale, RAMP.leaf[3]);
}

/** Signs, hearts, chickens, player — redrawn at ~12 Hz straight from the runtimes. */
function drawDynamic(ctx: Ctx, staticLayer: HTMLCanvasElement, t: number) {
  ctx.clearRect(0, 0, MAP_W, MAP_H);
  ctx.drawImage(staticLayer, 0, 0, MAP_W, MAP_H);
  const { activeInteractableId, chickensAngry } = useGameStore.getState();
  const { visited } = useUIStore.getState();
  const reduced = useSettingsStore.getState().reducedMotion;

  BUSHES.forEach((b, i) => {
    if (!bushStates[i]?.heart) return;
    const [x, y] = worldToMap(b.pos[0], b.pos[1]);
    dot(ctx, x, y, 1.6, RAMP.crimson[3]);
  });

  ctx.lineWidth = 1;
  for (const m of SIGN_MARKERS) {
    const isVisited = visited.includes(m.id);
    const active = activeInteractableId === m.id;
    const r = active ? (reduced ? 4 : 3.5 + Math.sin(t * 6)) : 3;
    diamond(ctx, m.x, m.y, r);
    ctx.fillStyle = isVisited ? RAMP.bone[1] : RAMP.gold[3];
    ctx.fill();
    ctx.strokeStyle = RAMP.dark[0];
    ctx.stroke();
    if (isVisited) {
      ctx.strokeStyle = RAMP.dark[0];
      ctx.beginPath();
      ctx.moveTo(m.x - 1.5, m.y);
      ctx.lineTo(m.x - 0.5, m.y + 1.2);
      ctx.lineTo(m.x + 1.6, m.y - 1.4);
      ctx.stroke();
    }
  }

  for (const c of flock.chickens) {
    const [x, y] = worldToMap(c.x, c.z);
    dot(ctx, x, y, 1.6, chickensAngry ? RAMP.crimson[3] : RAMP.bone[4]);
  }

  const [px, py] = worldToMap(playerRuntime.x, playerRuntime.z);
  const dx = Math.sin(playerRuntime.rotation);
  const dy = Math.cos(playerRuntime.rotation);
  ctx.beginPath();
  ctx.moveTo(px + dx * 5, py + dy * 5);
  ctx.lineTo(px - dx * 3 - dy * 3, py - dy * 3 + dx * 3);
  ctx.lineTo(px - dx * 3 + dy * 3, py - dy * 3 - dx * 3);
  ctx.closePath();
  ctx.fillStyle = RAMP.gold[4];
  ctx.fill();
  ctx.strokeStyle = RAMP.dark[0];
  ctx.stroke();
}

/**
 * Top-down island map in the HUD. Terrain is pre-rendered; markers and the
 * player are redrawn by a throttled rAF loop reading the runtime singletons,
 * so nothing here re-renders React per frame.
 */
export default function Minimap() {
  const open = useUIStore((s) => s.minimapOpen);
  const setMinimapOpen = useUIStore((s) => s.setMinimapOpen);
  const toggleMinimap = useUIStore((s) => s.toggleMinimap);
  const isTouch = useIsTouch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<ResumeSection | null>(null);

  // Collapsed by default on touch devices — the joystick needs the room.
  useEffect(() => {
    if (isTouch) setMinimapOpen(false);
  }, [isTouch, setMinimapOpen]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = MAP_W * dpr;
    canvas.height = MAP_H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const staticLayer = document.createElement('canvas');
    staticLayer.width = MAP_W * dpr;
    staticLayer.height = MAP_H * dpr;
    const sctx = staticLayer.getContext('2d');
    if (!sctx) return;
    sctx.scale(dpr, dpr);
    drawStatic(sctx);

    let raf = 0;
    let last = -Infinity;
    let lastLabel = -Infinity;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const t = ms / 1000;
      if (t - last < FRAME_INTERVAL_S) return;
      last = t;
      drawDynamic(ctx, staticLayer, t);
      if (t - lastLabel >= 1) {
        lastLabel = t;
        canvas.setAttribute(
          'aria-label',
          describeMap(playerRuntime.x, playerRuntime.z, POSITIONS.signs, useUIStore.getState().visited),
        );
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const onPointer = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * MAP_W;
    const y = ((e.clientY - r.top) / r.height) * MAP_H;
    setHover(markerAt(x, y, SIGN_MARKERS) as ResumeSection | null);
  };

  if (!open) {
    return (
      <button
        onClick={toggleMinimap}
        className="rq-key pointer-events-auto mt-2 !min-w-0 px-2 py-1 font-pixel text-[10px] uppercase tracking-wider"
        aria-expanded={false}
        aria-controls="minimap"
        title="Show minimap (N)"
      >
        Map
      </button>
    );
  }

  return (
    <div id="minimap" className="rq-panel pointer-events-auto mt-2 inline-block p-1">
      <span className="rq-corner-tr" aria-hidden />
      <span className="rq-corner-bl" aria-hidden />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Minimap"
        className="pixelated block cursor-crosshair"
        style={{ width: MAP_W, height: MAP_H }}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={() => setHover(null)}
      />
      <div
        className="font-pixel mt-1 flex items-start justify-between gap-1 text-[8px] uppercase leading-tight tracking-wider text-[#b6a78d]"
        style={{ width: MAP_W }}
      >
        {hover ? (
          <span className="text-[#f2c750]">{SECTION_LABELS[hover]}</span>
        ) : (
          <span className="flex flex-wrap gap-x-1.5">
            <span>
              <span className="text-[#f2c750]">◆</span> Sign
            </span>
            <span>
              <span className="text-[#ee9297]">♥</span> Heart
            </span>
            <span>
              <span className="text-[#f6efdd]">●</span> Chicken
            </span>
          </span>
        )}
        <button
          onClick={toggleMinimap}
          aria-label="Hide minimap"
          title="Hide minimap (N)"
          className="shrink-0 text-[#8890b0] hover:text-[#f2c750]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
