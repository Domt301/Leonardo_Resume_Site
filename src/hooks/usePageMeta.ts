import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parseRoute, SECTION_LABELS } from '../app/routeMap';
import { profile } from '../content/profile';
import { projectById } from '../content/projects';

const BASE_TITLE = `${profile.name} — ${profile.headline}`;

const SECTION_DESCRIPTIONS: Record<string, string> = {
  experience: `Professional experience of ${profile.name}: Travelers, Cox Automotive, AWS, and more.`,
  skills: `Technical skills of ${profile.name}: languages, frameworks, cloud, IaC, and containers.`,
  projects: `Selected projects by ${profile.name}.`,
  certifications: `Certifications held by ${profile.name}, including AWS Professional-level credentials.`,
  about: `About ${profile.name} — professional narrative, education, and training.`,
  contact: `Contact ${profile.name}: email, LinkedIn, GitHub.`,
};

/** Per-route document title + meta description (spec §19). */
export function usePageMeta(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = parseRoute(pathname);
    let title = BASE_TITLE;
    let description =
      `${profile.name} — ${profile.headline} specializing in UI and API design, development, and integration. ` +
      'An interactive 3D resume island, fully readable as plain HTML.';
    if (match.kind === 'section') {
      title = `${SECTION_LABELS[match.section]} — ${profile.name}`;
      description = SECTION_DESCRIPTIONS[match.section] ?? description;
    } else if (match.kind === 'project') {
      const project = projectById(match.projectId);
      title = project ? `${project.name} — ${profile.name}` : `Projects — ${profile.name}`;
      if (project) description = project.tagline;
    }
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [pathname]);
}
