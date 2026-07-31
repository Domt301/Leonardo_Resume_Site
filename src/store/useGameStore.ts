import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────────────────
// The single React ↔ engine bridge (spec §4, §15). This store holds SHARED,
// low-frequency state only — game phase, collectibles, the active panel, and
// settings. Per-frame data (player position, camera) lives inside engine
// objects and NEVER flows through here.
//
// Engine → store: imperative writes at meaningful events only, via getState().
// Store → engine: the engine subscribes imperatively (useGameStore.subscribe)
// so UI-driven changes (fast travel, settings) reach it without React
// re-rendering the canvas.
// ─────────────────────────────────────────────────────────────────────────────

export type Phase = 'title' | 'loading' | 'playing' | 'paused' | 'map' | 'resume';

export type PanelState =
  | { kind: 'sign'; jobId: string }
  | { kind: 'summary' }
  | { kind: 'skills' }
  | { kind: 'contact' }
  | { kind: 'dialogue'; npc: string; lines: string[]; index: number }
  | { kind: 'mark'; jobId: string }
  | { kind: 'cert'; certId: string }
  | { kind: 'education'; eduId: string }
  | { kind: 'destination'; islandId: string };

export interface Settings {
  sound: boolean;
  pixelSize: 3 | 4 | 6;
  isoAngle: 26.565 | 30;
  reducedMotion: boolean;
}

export interface GameState {
  phase: Phase;
  currentIsland: string;
  inInterior: string | null;
  marks: Record<string, boolean>;
  sigils: Record<string, boolean>;
  credentials: Record<string, boolean>;
  signsRead: string[];
  visited: string[];
  coins: number;
  panel: PanelState | null;
  /** Bottom-of-screen interaction hint, or null. */
  hint: string | null;
  settings: Settings;

  // ── actions ────────────────────────────────────────────────────────────────
  setPhase: (p: Phase) => void;
  setCurrentIsland: (id: string) => void;
  enterInterior: (id: string) => void;
  exitInterior: () => void;
  earnMark: (jobId: string) => void;
  claimSigil: (certId: string) => void;
  claimCredential: (eduId: string) => void;
  markSignRead: (jobId: string) => void;
  visit: (islandId: string) => void;
  addCoins: (n: number) => void;
  openPanel: (p: PanelState) => void;
  closePanel: () => void;
  setHint: (h: string | null) => void;
  updateSettings: (s: Partial<Settings>) => void;
  hydrate: (partial: Partial<GameState>) => void;
}

const STORAGE_KEY = 'resume-quest:v2';

const defaultSettings: Settings = {
  sound: false, // audio starts muted (spec §16)
  pixelSize: 4,
  isoAngle: 30,
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
};

function loadPersisted(): Partial<GameState> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return {};
    return {
      marks: data.marks ?? {},
      sigils: data.sigils ?? {},
      credentials: data.credentials ?? {},
      signsRead: Array.isArray(data.signsRead) ? data.signsRead : [],
      visited: Array.isArray(data.visited) ? data.visited : [],
      coins: typeof data.coins === 'number' ? data.coins : 0,
      settings: { ...defaultSettings, ...(data.settings ?? {}) },
    };
  } catch {
    // Corrupt save silently starts fresh — never show a storage error.
    return {};
  }
}

const uniqPush = (arr: string[], v: string) => (arr.includes(v) ? arr : [...arr, v]);

export const useGameStore = create<GameState>((set) => ({
  phase: 'title',
  currentIsland: 'home',
  inInterior: null,
  marks: {},
  sigils: {},
  credentials: {},
  signsRead: [],
  visited: [],
  coins: 0,
  panel: null,
  hint: null,
  settings: defaultSettings,
  ...loadPersisted(),

  setPhase: (p) => set({ phase: p }),
  setCurrentIsland: (id) => set((s) => ({ currentIsland: id, visited: uniqPush(s.visited, id) })),
  enterInterior: (id) => set({ inInterior: id }),
  exitInterior: () => set({ inInterior: null }),
  earnMark: (jobId) => set((s) => ({ marks: { ...s.marks, [jobId]: true }, coins: s.coins + 10 })),
  claimSigil: (certId) => set((s) => ({ sigils: { ...s.sigils, [certId]: true }, coins: s.coins + 5 })),
  claimCredential: (eduId) => set((s) => ({ credentials: { ...s.credentials, [eduId]: true } })),
  markSignRead: (jobId) => set((s) => ({ signsRead: uniqPush(s.signsRead, jobId) })),
  visit: (islandId) => set((s) => ({ visited: uniqPush(s.visited, islandId) })),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
  openPanel: (p) => set({ panel: p }),
  closePanel: () => set({ panel: null }),
  setHint: (h) => set({ hint: h }),
  updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
  hydrate: (partial) => set(partial),
}));

// ── Debounced persistence (spec §15): everything except phase & panel. ────────
let saveTimer: ReturnType<typeof setTimeout> | null = null;
useGameStore.subscribe((state) => {
  if (typeof localStorage === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const { marks, sigils, credentials, signsRead, visited, coins, settings } = state;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ marks, sigils, credentials, signsRead, visited, coins, settings }),
      );
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, 500);
});

/** Non-reactive read for engine code. */
export const gameState = () => useGameStore.getState();
