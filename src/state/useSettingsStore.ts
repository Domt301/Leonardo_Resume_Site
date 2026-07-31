import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QualityPreset } from '../types/game';

interface SettingsState {
  audioEnabled: boolean;
  masterVolume: number;
  quality: QualityPreset;
  reducedMotion: boolean;
  seenControlsHint: boolean;
  setAudioEnabled(v: boolean): void;
  toggleAudio(): void;
  setQuality(q: QualityPreset): void;
  setReducedMotion(v: boolean): void;
  markControlsHintSeen(): void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const defaultQuality = (): QualityPreset => {
  if (typeof window === 'undefined') return 'medium';
  return window.matchMedia('(pointer: coarse)').matches ? 'low' : 'medium';
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Audio starts muted; no autoplay with sound (spec §23).
      audioEnabled: false,
      masterVolume: 0.7,
      quality: defaultQuality(),
      reducedMotion: prefersReducedMotion(),
      seenControlsHint: false,
      setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      setQuality: (quality) => set({ quality }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      markControlsHintSeen: () => set({ seenControlsHint: true }),
    }),
    { name: 'lw-resume-settings' },
  ),
);
