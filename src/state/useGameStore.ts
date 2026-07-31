import { create } from 'zustand';
import type { Vec3 } from '../types/game';

// Low-frequency game state only (spec §13.3). Per-frame player position and
// velocity live in refs inside the game layer — never here.

interface GameState {
  /** False while a panel/help/resume overlay is open. */
  movementEnabled: boolean;
  activeInteractableId: string | null;
  currentZoneId: string | null;
  spawnPoint: Vec3;
  setMovementEnabled(v: boolean): void;
  setActiveInteractable(id: string | null): void;
  setCurrentZone(id: string | null): void;
  setSpawnPoint(p: Vec3): void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  movementEnabled: true,
  activeInteractableId: null,
  currentZoneId: null,
  spawnPoint: [0, 0, 0.5],
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
}));
