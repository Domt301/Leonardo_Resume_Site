import * as THREE from 'three';

// Interaction targets (spec §10). Each declares a world position, a trigger
// radius, a hint line, and an action the Engine interprets. The nearest eligible
// target within range shows a bobbing gold "!" and its hint.

export type InteractionAction =
  | { type: 'sign'; jobId: string }
  | { type: 'summary' }
  | { type: 'skills' }
  | { type: 'contact' }
  | { type: 'enter'; interior: string; islandName: string }
  | { type: 'bridge'; to: string }
  | { type: 'npc'; npc: string; jobId?: string; section?: 'sigils' | 'academy' }
  | { type: 'bullet'; jobId: string; index: number }
  | { type: 'chest'; jobId: string }
  | { type: 'sigil'; certId: string }
  | { type: 'education'; eduId: string }
  | { type: 'exit' };

export interface InteractionTarget {
  id: string;
  action: InteractionAction;
  position: THREE.Vector3;
  radius: number;
  hint: string;
}

/** Nearest target whose radius contains the player, or null. */
export function nearestTarget(
  targets: InteractionTarget[],
  player: THREE.Vector3,
): InteractionTarget | null {
  let best: InteractionTarget | null = null;
  let bestD = Infinity;
  for (const t of targets) {
    const d = t.position.distanceTo(player);
    if (d <= t.radius && d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best;
}
