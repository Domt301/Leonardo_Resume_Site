import { create } from 'zustand';
import type { ResumeSection } from '../types/resume';

interface UIState {
  helpOpen: boolean;
  mobileNavOpen: boolean;
  /** "Browse resume" full-document overlay (spec §21.4). */
  resumeOpen: boolean;
  /** Sections the visitor has opened this session — drives the HUD progress bar. */
  visited: ResumeSection[];
  setHelpOpen(v: boolean): void;
  toggleHelp(): void;
  setMobileNavOpen(v: boolean): void;
  setResumeOpen(v: boolean): void;
  markVisited(section: ResumeSection): void;
}

export const useUIStore = create<UIState>()((set) => ({
  helpOpen: false,
  mobileNavOpen: false,
  resumeOpen: false,
  visited: [],
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setResumeOpen: (resumeOpen) => set({ resumeOpen }),
  markVisited: (section) =>
    set((s) => (s.visited.includes(section) ? s : { visited: [...s.visited, section] })),
}));
