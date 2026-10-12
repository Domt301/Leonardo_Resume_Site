// Per-frame chicken state shared between the Chicken props (which move them)
// and the Player (which resolves contacts). Outside React/zustand (spec §13.3).

import { createFlock } from './systems/chickenSystem';
import { POSITIONS } from './world/layout';

export const flock = createFlock(3, POSITIONS.fencePen);
