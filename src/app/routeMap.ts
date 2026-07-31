// Route ↔ section mapping (spec §18). Pure module — unit-testable, no React.

import type { ResumeSection } from '../types/resume';
import { RESUME_SECTIONS } from '../types/resume';

export const SECTION_ROUTES: Record<ResumeSection, string> = {
  experience: '/experience',
  skills: '/skills',
  projects: '/projects',
  certifications: '/certifications',
  about: '/about',
  contact: '/contact',
};

export const SECTION_LABELS: Record<ResumeSection, string> = {
  experience: 'Experience',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  about: 'About',
  contact: 'Contact',
};

/** In-world landmark names shown in the HUD location label. */
export const ZONE_LABELS: Record<ResumeSection, string> = {
  experience: 'Experience Ridge',
  skills: 'Skills Grove',
  projects: 'Projects Workshop',
  certifications: 'Certifications Shrine',
  about: 'About Overlook',
  contact: 'Contact Dock',
};

export type RouteMatch =
  | { kind: 'home' }
  | { kind: 'section'; section: ResumeSection }
  | { kind: 'project'; projectId: string }
  | { kind: 'notFound' };

export function parseRoute(pathname: string): RouteMatch {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { kind: 'home' };
  for (const section of RESUME_SECTIONS) {
    if (path === SECTION_ROUTES[section]) return { kind: 'section', section };
  }
  const project = /^\/projects\/([^/]+)$/.exec(path);
  if (project) return { kind: 'project', projectId: decodeURIComponent(project[1]) };
  return { kind: 'notFound' };
}
