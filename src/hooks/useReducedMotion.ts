import { useSettingsStore } from '../state/useSettingsStore';

/**
 * Effective reduced-motion flag: OS preference seeds the persisted setting,
 * and the user can override it from the help overlay (spec §20.3).
 */
export function useReducedMotion(): boolean {
  return useSettingsStore((s) => s.reducedMotion);
}
