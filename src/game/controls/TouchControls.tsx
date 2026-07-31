import { useRef } from 'react';
import { input } from './inputMap';
import { useGameStore } from '../../state/useGameStore';

const STICK_RADIUS = 48;

/**
 * Touch controls (spec §9.1): bottom-left virtual joystick + bottom-right
 * interact button. Writes to the shared input singleton.
 */
export default function TouchControls({ onInteract }: { onInteract: () => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const activeInteractable = useGameStore((s) => s.activeInteractableId);

  const updateStick = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > STICK_RADIUS) {
      dx = (dx / len) * STICK_RADIUS;
      dy = (dy / len) * STICK_RADIUS;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    input.touch.x = dx / STICK_RADIUS;
    input.touch.z = dy / STICK_RADIUS;
  };

  const releaseStick = () => {
    pointerId.current = null;
    input.touch.x = 0;
    input.touch.z = 0;
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 md:hidden">
      {/* joystick */}
      <div
        ref={baseRef}
        className="pointer-events-auto absolute bottom-6 left-6 flex h-32 w-32 touch-none items-center justify-center rounded-full border-2 border-[#4c5473]/70 bg-[#131022]/50"
        onPointerDown={(e) => {
          pointerId.current = e.pointerId;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerId.current === e.pointerId) updateStick(e.clientX, e.clientY);
        }}
        onPointerUp={releaseStick}
        onPointerCancel={releaseStick}
        aria-hidden
      >
        <div
          ref={knobRef}
          className="h-14 w-14 rounded-full border border-[#8a7d68] bg-[#363c53]/90"
        />
      </div>

      {/* interact button */}
      <button
        onClick={onInteract}
        disabled={!activeInteractable}
        aria-label="Interact"
        className={`pointer-events-auto absolute bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-full border-2 text-2xl transition-opacity ${
          activeInteractable
            ? 'border-[#f2c750] bg-[#a36f1b]/60 text-[#ffe89c] opacity-100'
            : 'border-[#4c5473]/70 bg-[#131022]/50 text-[#8a7d68] opacity-50'
        }`}
      >
        <span className="font-pixel">E</span>
      </button>
    </div>
  );
}
