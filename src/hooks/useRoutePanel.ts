import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ResumeSection } from '../types/resume';
import { parseRoute, SECTION_ROUTES, type RouteMatch } from '../app/routeMap';
import { useUIStore } from '../state/useUIStore';

/**
 * Route-driven panel state (spec §18). Opening a section pushes history so the
 * browser back button closes the panel; closing a deep-linked panel replaces
 * to `/` so back still leaves the site.
 */
export function useRoutePanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const match: RouteMatch = useMemo(() => parseRoute(location.pathname), [location.pathname]);

  const activeSection: ResumeSection | null =
    match.kind === 'section' ? match.section : match.kind === 'project' ? 'projects' : null;
  const activeProjectId = match.kind === 'project' ? match.projectId : null;
  const notFound = match.kind === 'notFound';

  const openSection = useCallback(
    (section: ResumeSection, _source: 'world' | 'nav') => {
      useUIStore.getState().markVisited(section);
      navigate(SECTION_ROUTES[section], { state: { fromApp: true } });
    },
    [navigate],
  );

  const openProject = useCallback(
    (projectId: string) => {
      navigate(`/projects/${encodeURIComponent(projectId)}`, { state: { fromApp: true } });
    },
    [navigate],
  );

  const closePanel = useCallback(() => {
    const fromApp = (location.state as { fromApp?: boolean } | null)?.fromApp;
    if (fromApp) navigate(-1);
    else navigate('/', { replace: true });
  }, [location.state, navigate]);

  return { activeSection, activeProjectId, notFound, openSection, openProject, closePanel };
}
