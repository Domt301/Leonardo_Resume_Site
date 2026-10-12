// Per-bush heart state shared between Bush props (visuals) and the Player
// (pickup checks). Outside React/zustand (spec §13.3).

import { createBushStates } from './systems/pickupSystem';
import { BUSHES } from './world/layout';

export const bushStates = createBushStates(BUSHES);
