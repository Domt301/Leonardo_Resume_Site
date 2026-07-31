// The six routed landmarks (spec §9.4). Positions derive from layout.ts so
// signs and interaction points can never drift apart.

import type { WorldInteractable } from '../../types/game';
import type { ResumeSection } from '../../types/resume';
import { SECTION_LABELS, SECTION_ROUTES } from '../../app/routeMap';
import { heightAt } from '../systems/heightSystem';
import { POSITIONS } from './layout';

const INTERACTION_RADIUS = 2.2;

function fromSign(section: ResumeSection): WorldInteractable {
  const [x, z] = POSITIONS.signs[section];
  return {
    id: section,
    label: SECTION_LABELS[section],
    section,
    position: [x, heightAt(x, z), z],
    interactionRadius: INTERACTION_RADIUS,
    route: SECTION_ROUTES[section],
    prompt: `View ${SECTION_LABELS[section]}`,
  };
}

export const INTERACTABLES: WorldInteractable[] = (
  ['experience', 'projects', 'skills', 'about', 'certifications', 'contact'] as ResumeSection[]
).map(fromSign);
