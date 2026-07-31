import { useGameStore } from '../../state/useGameStore';
import { INTERACTABLES } from '../../game/world/interactables';
import { useIsTouch } from '../../hooks/useMediaQuery';

/** Bottom-center prompt for the nearest interactable (spec §10.3). */
export default function InteractionPrompt() {
  const activeId = useGameStore((s) => s.activeInteractableId);
  const isTouch = useIsTouch();
  if (!activeId) return null;
  const target = INTERACTABLES.find((i) => i.id === activeId);
  if (!target) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center sm:bottom-24"
      role="status"
      aria-live="polite"
    >
      <div className="rq-panel px-4 py-2">
        <span className="rq-corner-tr" aria-hidden />
        <span className="rq-corner-bl" aria-hidden />
        <p className="font-pixel text-xs uppercase tracking-wider text-[#f6efdd]">
          {isTouch ? (
            <>Tap to {target.prompt}</>
          ) : (
            <>
              <kbd className="rq-key mr-2">E</kbd>
              {target.prompt}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
