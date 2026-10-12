import { create } from 'zustand';
import type { ResumeSection } from '../types/resume';

export interface Notice {
  id: number;
  text: string;
}

let noticeSeq = 0;

interface UIState {
  helpOpen: boolean;
  mobileNavOpen: boolean;
  /** "Browse resume" full-document overlay (spec §21.4). */
  resumeOpen: boolean;
  /** Set once the resume overlay is open and ready to be printed to PDF. */
  printPending: boolean;
  /** Sections the visitor has opened this session — drives the HUD progress bar. */
  visited: ResumeSection[];
  /** Short gameplay toast ("Ouch!", "Found a heart!"). Null when nothing is showing. */
  notice: Notice | null;
  /** HUD minimap expanded (desktop default) or collapsed to a button. */
  minimapOpen: boolean;
  setHelpOpen(v: boolean): void;
  toggleHelp(): void;
  setMobileNavOpen(v: boolean): void;
  setResumeOpen(v: boolean): void;
  /** Open the full resume and print it to PDF once it has rendered. */
  openResumeForPrint(): void;
  clearPrintPending(): void;
  markVisited(section: ResumeSection): void;
  showNotice(text: string): void;
  /** Clears the toast only if `id` is still the one showing. */
  clearNotice(id: number): void;
  setMinimapOpen(v: boolean): void;
  toggleMinimap(): void;
}

export const useUIStore = create<UIState>()((set) => ({
  helpOpen: false,
  mobileNavOpen: false,
  resumeOpen: false,
  printPending: false,
  visited: [],
  notice: null,
  minimapOpen: true,
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setResumeOpen: (resumeOpen) => set({ resumeOpen }),
  openResumeForPrint: () => set({ resumeOpen: true, printPending: true }),
  clearPrintPending: () => set({ printPending: false }),
  markVisited: (section) =>
    set((s) => (s.visited.includes(section) ? s : { visited: [...s.visited, section] })),
  showNotice: (text) => set({ notice: { id: ++noticeSeq, text } }),
  clearNotice: (id) => set((s) => (s.notice?.id === id ? { notice: null } : s)),
  setMinimapOpen: (minimapOpen) => set({ minimapOpen }),
  toggleMinimap: () => set((s) => ({ minimapOpen: !s.minimapOpen })),
}));
