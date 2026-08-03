import { lazy, Suspense, useCallback, useEffect } from 'react';
import SkipLink from './SkipLink';
import Header from './Header';
import Footer from './Footer';
import Hud from '../ui/Hud';
import RoutePanels from '../ui/RoutePanels';
import InteractionPrompt from '../ui/InteractionPrompt';
import HelpOverlay from '../ui/HelpOverlay';
import LoadingScreen from '../ui/LoadingScreen';
import ResumeDocument from '../resume/ResumeDocument';
import TouchControls from '../../game/controls/TouchControls';
import { useKeyboardControls } from '../../game/controls/useKeyboardControls';
import { useRoutePanel } from '../../hooks/useRoutePanel';
import { useUIStore } from '../../state/useUIStore';
import { useGameStore } from '../../state/useGameStore';
import { useIsTouch } from '../../hooks/useMediaQuery';
import type { ResumeSection } from '../../types/resume';

const GameCanvas = lazy(() => import('../../game/GameCanvas'));

/** Top-level layout for the interactive mode (spec §13.1). */
export default function SiteShell() {
  const { activeSection, notFound, openSection } = useRoutePanel();
  const helpOpen = useUIStore((s) => s.helpOpen);
  const resumeOpen = useUIStore((s) => s.resumeOpen);
  const setResumeOpen = useUIStore((s) => s.setResumeOpen);
  const isTouch = useIsTouch();

  // Movement is enabled only while nothing modal is on screen (spec §20.4).
  const overlayOpen = activeSection !== null || notFound || helpOpen || resumeOpen;
  useEffect(() => {
    useGameStore.getState().setMovementEnabled(!overlayOpen);
  }, [overlayOpen]);

  const interact = useCallback(() => {
    const id = useGameStore.getState().activeInteractableId;
    if (id) openSection(id as ResumeSection, 'world');
  }, [openSection]);

  useKeyboardControls(interact);

  return (
    <div data-site-shell className="relative h-full w-full overflow-hidden">
      <SkipLink />
      <Header />

      <main id="main-content" className="h-full w-full" aria-label="Interactive resume island">
        {/* Offscreen alternative for screen readers (spec §20.1). */}
        <p className="sr-only">
          Interactive island map. Use the navigation menu to read resume sections, or the Browse
          resume button for the full document.
        </p>
        <Suspense fallback={<LoadingScreen progress={30} />}>
          <GameCanvas />
        </Suspense>
      </main>

      <Hud />
      <InteractionPrompt />
      <Footer />
      {isTouch && <TouchControls onInteract={interact} />}

      <RoutePanels />
      <HelpOverlay />
      {resumeOpen && <ResumeDocument onClose={() => setResumeOpen(false)} />}
    </div>
  );
}
