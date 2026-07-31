import { useEffect, useRef, useState, useCallback } from 'react';
import { sceneArt, type HotspotAction } from '../data/scenes';

// Renders a scene's static illustration full-bleed (pixelated, letterboxed on
// VOID) with clickable hotspots that track the rendered image rect at any window
// size. Hotspots are real, keyboard-focusable buttons. A ?calibrate mode lets the
// author drag rects and read back normalized coords.

interface Rect {
  left: number;
  top: number;
  w: number;
  h: number;
}

function containRect(cw: number, ch: number, aspect: number): Rect {
  const ca = cw / ch;
  let w: number, h: number;
  if (ca > aspect) {
    h = ch;
    w = ch * aspect;
  } else {
    w = cw;
    h = cw / aspect;
  }
  return { left: (cw - w) / 2, top: (ch - h) / 2, w, h };
}

export default function IllustratedScene({
  sceneId,
  onAction,
  onMissing,
  calibrate = false,
}: {
  sceneId: string;
  onAction: (a: HotspotAction) => void;
  onMissing?: () => void;
  calibrate?: boolean;
}) {
  const art = sceneArt(sceneId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
  const [aspect, setAspect] = useState(16 / 10);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const rect = containRect(box.w, box.h, aspect);
  const toPx = (h: { x: number; y: number; w: number; h: number }) => ({
    left: rect.left + h.x * rect.w,
    top: rect.top + h.y * rect.h,
    width: h.w * rect.w,
    height: h.h * rect.h,
  });

  if (!art.image) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-30 bg-[#07060d]">
      <img
        src={art.image}
        alt=""
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
        }}
        onError={() => onMissing?.()}
        className="pixelated absolute select-none"
        style={{ left: rect.left, top: rect.top, width: rect.w, height: rect.h }}
      />

      {!calibrate &&
        art.hotspots.map((h, i) => {
          const s = toPx(h);
          return (
            <button
              key={i}
              onClick={() => onAction(h.action)}
              aria-label={h.label}
              title={h.label}
              className="group absolute rounded-sm border-2 border-transparent transition hover:border-[#f2c750] focus-visible:border-[#f2c750]"
              style={{ left: s.left, top: s.top, width: s.width, height: s.height }}
            >
              <span className="font-pixel pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#0a0812]/90 px-2 py-0.5 text-[11px] text-[#f2c750] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {h.label}
              </span>
            </button>
          );
        })}

      {calibrate && <Calibrator rect={rect} />}
    </div>
  );
}

// Dev overlay: drag to draw a rect, read back normalized {x,y,w,h}. Enabled with
// ?calibrate in the URL so authors can map hotspots onto supplied images.
function Calibrator({ rect }: { rect: Rect }) {
  const [drag, setDrag] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [out, setOut] = useState('');

  const norm = useCallback(
    (px: number, py: number) => ({
      x: Math.max(0, Math.min(1, (px - rect.left) / rect.w)),
      y: Math.max(0, Math.min(1, (py - rect.top) / rect.h)),
    }),
    [rect],
  );

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onPointerDown={(e) => setDrag({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY })}
      onPointerMove={(e) => setDrag((d) => (d ? { ...d, x1: e.clientX, y1: e.clientY } : d))}
      onPointerUp={() => {
        if (!drag) return;
        const a = norm(Math.min(drag.x0, drag.x1), Math.min(drag.y0, drag.y1));
        const b = norm(Math.max(drag.x0, drag.x1), Math.max(drag.y0, drag.y1));
        const r = { x: +a.x.toFixed(3), y: +a.y.toFixed(3), w: +(b.x - a.x).toFixed(3), h: +(b.y - a.y).toFixed(3) };
        const line = `{ x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h}, label: '', action: { type: '' } },`;
        setOut(line);
        // eslint-disable-next-line no-console
        console.log('[hotspot]', line);
        setDrag(null);
      }}
    >
      {drag && (
        <div
          className="absolute border-2 border-[#f2c750] bg-[#f2c750]/20"
          style={{
            left: Math.min(drag.x0, drag.x1),
            top: Math.min(drag.y0, drag.y1),
            width: Math.abs(drag.x1 - drag.x0),
            height: Math.abs(drag.y1 - drag.y0),
          }}
        />
      )}
      <div className="font-pixel pointer-events-none absolute left-2 top-2 max-w-[90vw] rounded bg-[#0a0812]/90 px-2 py-1 text-[11px] text-[#8ee9ef]">
        calibrate: drag a box → copy from console
        {out && <div className="mt-1 text-[#f2c750]">{out}</div>}
      </div>
    </div>
  );
}
