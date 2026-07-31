import { useRef, useState, useEffect } from 'react';

// Mobile touch controls (spec §17): a virtual stick bottom-left, an A button
// bottom-right, fading to 40% after inactivity.
export default function TouchControls({
  onAxis,
  onInteract,
}: {
  onAxis: (x: number, y: number) => void;
  onInteract: () => void;
}) {
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bump = () => {
    setActive(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setActive(false), 3000);
  };

  useEffect(() => () => onAxis(0, 0), [onAxis]);

  const handle = (e: React.PointerEvent) => {
    const el = stickRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (e.clientX - cx) / (rect.width / 2);
    let dy = (e.clientY - cy) / (rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    setKnob({ x: dx * 26, y: dy * 26 });
    // screen up (−y) = forward (+y in engine axis)
    onAxis(dx, -dy);
    bump();
  };

  const release = () => {
    setKnob({ x: 0, y: 0 });
    onAxis(0, 0);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 md:hidden" style={{ opacity: active ? 1 : 0.4, transition: 'opacity 300ms' }}>
      <div
        ref={stickRef}
        onPointerDown={handle}
        onPointerMove={(e) => e.buttons && handle(e)}
        onPointerUp={release}
        onPointerLeave={release}
        className="pointer-events-auto absolute bottom-8 left-8 h-28 w-28 touch-none rounded-full border-2 border-[#404763] bg-[#0a0812]/50"
        aria-label="Movement stick"
      >
        <div
          className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-[#626a8b]/70"
          style={{ transform: `translate(-50%,-50%) translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>
      <button
        onPointerDown={() => {
          onInteract();
          bump();
        }}
        className="font-pixel pointer-events-auto absolute bottom-12 right-10 h-20 w-20 touch-none rounded-full border-2 border-[#a36f1b] bg-[#0a0812]/60 text-lg text-[#f2c750]"
        aria-label="Interact"
      >
        E
      </button>
    </div>
  );
}
