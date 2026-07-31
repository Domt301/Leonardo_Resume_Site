// Interaction selection (spec §9.4): nearest enabled interactable within its
// radius; ties broken by priority (higher wins). Pure — unit-testable.

import type { WorldInteractable, WorldZone } from '../../types/game';

export function selectInteractable(
  px: number,
  pz: number,
  list: WorldInteractable[],
): WorldInteractable | null {
  let best: WorldInteractable | null = null;
  let bestDistSq = Infinity;
  for (const it of list) {
    if (it.disabled) continue;
    const dx = px - it.position[0];
    const dz = pz - it.position[2];
    const distSq = dx * dx + dz * dz;
    if (distSq > it.interactionRadius * it.interactionRadius) continue;
    if (
      distSq < bestDistSq ||
      (best !== null && Math.abs(distSq - bestDistSq) < 1e-9 && (it.priority ?? 0) > (best.priority ?? 0))
    ) {
      best = it;
      bestDistSq = distSq;
    }
  }
  return best;
}

export function zoneAt(px: number, pz: number, zones: WorldZone[]): WorldZone | null {
  let best: WorldZone | null = null;
  let bestDistSq = Infinity;
  for (const z of zones) {
    const dx = px - z.center[0];
    const dz = pz - z.center[1];
    const distSq = dx * dx + dz * dz;
    if (distSq <= z.radius * z.radius && distSq < bestDistSq) {
      best = z;
      bestDistSq = distSq;
    }
  }
  return best;
}
