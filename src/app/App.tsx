import { useEffect, useState } from 'react';
import SiteShell from '../components/layout/SiteShell';
import ResumeDocument from '../components/resume/ResumeDocument';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { usePageMeta } from '../hooks/usePageMeta';
import { parseRoute } from './routeMap';
import { ZONES, SPAWN } from '../game/world/layout';
import { heightAt } from '../game/systems/heightSystem';
import { useGameStore } from '../state/useGameStore';
import { useUIStore } from '../state/useUIStore';
import { useSettingsStore } from '../state/useSettingsStore';

/**
 * Capability gate (spec §20.2): with WebGL and a big-enough viewport the
 * interactive island renders; otherwise the HTML resume IS the page.
 */
export default function App() {
  const capable = useWebGLSupport();
  usePageMeta();

  // Deep-link spawn (spec §6.3): computed once before the canvas mounts.
  const [ready] = useState(() => {
    const match = parseRoute(window.location.pathname);
    if (match.kind === 'section' || match.kind === 'project') {
      const section = match.kind === 'section' ? match.section : 'projects';
      useUIStore.getState().markVisited(section);
      const zone = ZONES.find((z) => z.id === section);
      if (zone) {
        // Spawn pushed 2.5 units from the zone center toward the island center.
        const len = Math.hypot(zone.center[0], zone.center[1]) || 1;
        const x = zone.center[0] - (zone.center[0] / len) * 2.5;
        const z = zone.center[1] - (zone.center[1] / len) * 2.5;
        useGameStore.getState().setSpawnPoint([x, heightAt(x, z), z]);
      }
    } else {
      useGameStore.getState().setSpawnPoint(SPAWN);
    }
    return true;
  });

  // Keep the persisted reduced-motion setting in sync if the OS preference flips.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) useSettingsStore.getState().setReducedMotion(true);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (!capable) {
    return (
      <ResumeDocument
        standalone
        fallbackNote="The interactive world isn't available on this device — here's the full resume."
      />
    );
  }

  return ready ? <SiteShell /> : null;
}
