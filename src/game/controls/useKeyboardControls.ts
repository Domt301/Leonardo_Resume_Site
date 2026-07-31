import { useEffect } from 'react';
import { input, MOVEMENT_CODES, clearInput } from './inputMap';
import { useGameStore } from '../../state/useGameStore';
import { useUIStore } from '../../state/useUIStore';
import { useSettingsStore } from '../../state/useSettingsStore';

function isTypingTarget(el: EventTarget | null): boolean {
  return (
    el instanceof HTMLElement &&
    (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
  );
}

/**
 * Global keyboard controls (spec §9.1): WASD/arrows move, E/Enter interact,
 * M audio, H/? help. Escape is handled by the open dialog itself.
 */
export function useKeyboardControls(onInteract: () => void): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const ui = useUIStore.getState();
      const game = useGameStore.getState();

      if (MOVEMENT_CODES.has(e.code)) {
        input.keys.add(e.code);
        if (game.movementEnabled) e.preventDefault();
        return;
      }
      if (e.code === 'KeyM') {
        useSettingsStore.getState().toggleAudio();
        return;
      }
      if (e.code === 'KeyH' || (e.key === '?' && !e.ctrlKey && !e.metaKey)) {
        ui.toggleHelp();
        return;
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        // Only interact when walking the world (no dialog open) and near a sign.
        if (game.movementEnabled && game.activeInteractableId && !isTypingTarget(document.activeElement)) {
          // Let Enter keep working for focused buttons/links.
          if (e.code === 'Enter' && document.activeElement !== document.body) return;
          onInteract();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      input.keys.delete(e.code);
    };
    const onBlur = () => clearInput();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      clearInput();
    };
  }, [onInteract]);
}
