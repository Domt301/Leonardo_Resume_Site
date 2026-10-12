import { create } from 'zustand';
import type { Vec3 } from '../types/game';

// Low-frequency game state only (spec §13.3). Per-frame player position and
// velocity live in refs inside the game layer — never here. Hearts, faint and
// aggro flags change a few times a minute at most, so they qualify.

export const MAX_HEARTS = 3;

interface GameState {
  /** False while a panel/help/resume overlay is open. */
  movementEnabled: boolean;
  activeInteractableId: string | null;
  currentZoneId: string | null;
  spawnPoint: Vec3;
  /** Current health, 0..MAX_HEARTS. */
  hearts: number;
  /** True from the moment hearts hit 0 until the faint overlay has finished. */
  fainted: boolean;
  /** Incremented on each respawn; the Player watches it to teleport home. */
  respawnToken: number;
  /** Animation keys: bump once per hit / per heal so the HUD can restart CSS. */
  hurtCount: number;
  healCount: number;
  /** Mirrored from the chicken runtime at ~10 Hz for HUD/minimap/toasts. */
  chickensAngry: boolean;
  setMovementEnabled(v: boolean): void;
  setActiveInteractable(id: string | null): void;
  setCurrentZone(id: string | null): void;
  setSpawnPoint(p: Vec3): void;
  damage(n?: number): void;
  /** Returns false (and does nothing) when already at full hearts. */
  heal(n?: number): boolean;
  resetHearts(): void;
  /** Refill hearts and ask the Player to teleport to spawn. */
  respawn(): void;
  setFainted(v: boolean): void;
  setChickensAngry(v: boolean): void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  movementEnabled: true,
  activeInteractableId: null,
  currentZoneId: null,
  spawnPoint: [0, 0, 0.5],
  hearts: MAX_HEARTS,
  fainted: false,
  respawnToken: 0,
  hurtCount: 0,
  healCount: 0,
  chickensAngry: false,
  setMovementEnabled: (movementEnabled) => {
    if (get().movementEnabled !== movementEnabled) set({ movementEnabled });
  },
  setActiveInteractable: (activeInteractableId) => {
    if (get().activeInteractableId !== activeInteractableId) set({ activeInteractableId });
  },
  setCurrentZone: (currentZoneId) => {
    if (get().currentZoneId !== currentZoneId) set({ currentZoneId });
  },
  setSpawnPoint: (spawnPoint) => set({ spawnPoint }),
  damage: (n = 1) => {
    const { hearts, fainted } = get();
    if (hearts <= 0 || fainted) return;
    const next = Math.max(0, hearts - n);
    set((s) => ({ hearts: next, hurtCount: s.hurtCount + 1, fainted: next === 0 }));
  },
  heal: (n = 1) => {
    const { hearts } = get();
    if (hearts >= MAX_HEARTS) return false;
    set((s) => ({ hearts: Math.min(MAX_HEARTS, hearts + n), healCount: s.healCount + 1 }));
    return true;
  },
  resetHearts: () => set({ hearts: MAX_HEARTS }),
  respawn: () => set((s) => ({ hearts: MAX_HEARTS, respawnToken: s.respawnToken + 1 })),
  setFainted: (fainted) => {
    if (get().fainted !== fainted) set({ fainted });
  },
  setChickensAngry: (chickensAngry) => {
    if (get().chickensAngry !== chickensAngry) set({ chickensAngry });
  },
}));
