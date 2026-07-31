import { describe, expect, it } from 'vitest';
import { parseRoute, SECTION_ROUTES } from '../routeMap';
import { RESUME_SECTIONS } from '../../types/resume';

describe('parseRoute', () => {
  it('maps / to home', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' });
  });

  it('is total and bijective over the section routes', () => {
    for (const section of RESUME_SECTIONS) {
      expect(parseRoute(SECTION_ROUTES[section])).toEqual({ kind: 'section', section });
    }
    // bijective: no two sections share a route
    const routes = Object.values(SECTION_ROUTES);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('tolerates trailing slashes', () => {
    expect(parseRoute('/experience/')).toEqual({ kind: 'section', section: 'experience' });
  });

  it('parses project detail routes', () => {
    expect(parseRoute('/projects/self-hosted-ai-platform')).toEqual({
      kind: 'project',
      projectId: 'self-hosted-ai-platform',
    });
    expect(parseRoute('/projects/a%20b')).toEqual({ kind: 'project', projectId: 'a b' });
  });

  it('returns notFound for unknown paths', () => {
    expect(parseRoute('/nope')).toEqual({ kind: 'notFound' });
    expect(parseRoute('/projects/a/b')).toEqual({ kind: 'notFound' });
  });
});
