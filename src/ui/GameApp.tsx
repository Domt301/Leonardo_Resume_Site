import { useEffect, useRef, useState } from 'react';
import { Engine } from '../engine/Engine';
import { runAction } from '../engine/actions';
import { useGameStore, type Phase } from '../store/useGameStore';
import { DEEP_LINKS } from '../data/islands';
import { hasArt, type HotspotAction } from '../data/scenes';
import TitleScreen from './TitleScreen';
import Hud from './Hud';
import Panels from './Panels';
import PauseMenu from './PauseMenu';
import MapScreen from './MapScreen';
import ControlsCard from './ControlsCard';
import TouchControls from './TouchControls';
import TitleCard, { type CardData } from './TitleCard';
import ResumeOverlay from './ResumeOverlay';
import IllustratedScene from './IllustratedScene';

// Mounts the engine once (StrictMode-safe) and renders either the illustrated
// scene (static art + hotspots) or the phase-driven 3D overlays. The engine loop
// is paused while the illustration is showing.
export default function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const cardCounter = useRef(0);
  const prevPhase = useRef<Phase>('title');

  const [card, setCard] = useState<CardData | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [booted, setBooted] = useState(false);
  const [artFailed, setArtFailed] = useState<Record<string, boolean>>({});

  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const view = useGameStore((s) => s.view);
  const setView = useGameStore((s) => s.setView);
  const currentIsland = useGameStore((s) => s.currentIsland);
  const setCurrentIsland = useGameStore((s) => s.setCurrentIsland);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const calibrate = typeof window !== 'undefined' && window.location.search.includes('calibrate');

  // whether the current scene should render as illustration
  const artActive = view === 'art' && hasArt(currentIsland) && !artFailed[currentIsland];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || engineRef.current) return;

    const engine = new Engine(canvas);
    engineRef.current = engine;
    engine.onTitleCard = (name, subtitle) => {
      cardCounter.current += 1;
      setCard({ name, subtitle, key: cardCounter.current });
    };
    engine.attachInput();

    const resize = () => engine.resize(window.innerWidth, window.innerHeight);
    resize();
    window.addEventListener('resize', resize);
    engine.start();

    const store = useGameStore.getState();
    const hash = window.location.hash;
    if (hash === '#/resume') {
      engine.init('home', false);
      store.setView('3d');
      setPhase('resume');
    } else if (DEEP_LINKS[hash]) {
      const id = DEEP_LINKS[hash];
      engine.init(id, true);
      // a deep-linked scene shows its art if it has any, else 3D
      store.setView(hasArt(id) ? 'art' : '3d');
    } else {
      engine.init('home', false);
      store.setView(hasArt('home') ? 'art' : '3d');
    }
    setBooted(true);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') setShowControls(true);
      // in art view the engine loop is paused, so close overlays here
      if (e.key === 'Escape') {
        const st = useGameStore.getState();
        if (st.view === 'art') {
          if (st.panel) st.closePanel();
          else if (st.phase === 'map' || st.phase === 'paused') st.setPhase('playing');
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pause the 3D loop while an illustration is showing
  useEffect(() => {
    const e = engineRef.current;
    if (!e || !booted) return;
    if (artActive) e.stop();
    else e.start();
  }, [artActive, booted]);

  useEffect(() => {
    if (phase !== 'resume') prevPhase.current = phase;
  }, [phase]);

  // ── dispatch a hotspot action ──────────────────────────────────────────────
  const enter3d = (islandId?: string) => {
    setView('3d');
    const e = engineRef.current;
    if (!e) return;
    e.start();
    if (islandId) e.fastTravel(islandId);
    else e.beginGame();
  };

  const goTo = (id: string) => {
    setCurrentIsland(id);
    if (hasArt(id) && !artFailed[id]) {
      setView('art');
      setPhase('playing');
    } else {
      enter3d(id);
    }
  };

  const handleAction = (a: HotspotAction) => {
    switch (a.type) {
      case 'begin':
      case 'view3d':
        enter3d(currentIsland === 'home' ? undefined : currentIsland);
        return;
      case 'resume':
        setPhase('resume');
        return;
      case 'travel':
        goTo(a.to);
        return;
      case 'enter':
        // interiors are 3D-only for now
        enter3d(currentIsland);
        engineRef.current?.enterInterior(a.interior, a.islandName);
        return;
      default:
        // panels, map, marks, sigils, education — work without the engine
        runAction(a);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#07060d]">
      <canvas ref={canvasRef} className={`h-full w-full ${artActive ? 'invisible' : ''}`} />

      {booted && artActive && (
        <>
          <IllustratedScene
            sceneId={currentIsland}
            onAction={handleAction}
            onMissing={() => {
              setArtFailed((m) => ({ ...m, [currentIsland]: true }));
              setView('3d');
              if (currentIsland === 'home') setPhase('title');
            }}
            calibrate={calibrate}
          />
          <ArtBar
            onExplore={() => enter3d(currentIsland === 'home' ? undefined : currentIsland)}
            onResume={() => setPhase('resume')}
          />
        </>
      )}

      {booted && !artActive && view === '3d' && phase === 'title' && (
        <TitleScreen onBegin={() => engineRef.current?.beginGame()} onSkip={() => setPhase('resume')} />
      )}

      {booted && !artActive && view === '3d' && (phase === 'playing' || phase === 'paused' || phase === 'map') && (
        <>
          <Hud onControls={() => setShowControls(true)} />
          <TitleCard card={card} reducedMotion={reducedMotion} />
          <TouchControls
            onAxis={(x, y) => engineRef.current?.touchAxis(x, y)}
            onInteract={() => engineRef.current?.touchInteract()}
          />
        </>
      )}

      {/* panels work in both views */}
      {booted && <Panels />}

      {booted && phase === 'paused' && (
        <PauseMenu
          onResume={() => setPhase('playing')}
          onReadResume={() => setPhase('resume')}
          onControls={() => setShowControls(true)}
        />
      )}

      {booted && phase === 'map' && (
        <MapScreen onClose={() => setPhase('playing')} onTravel={(id) => goTo(id)} />
      )}

      {booted && phase === 'resume' && (
        <div className="fixed inset-0 z-50">
          <ResumeOverlay onClose={() => setPhase(prevPhase.current === 'resume' ? 'title' : prevPhase.current)} />
        </div>
      )}

      {showControls && <ControlsCard onClose={() => setShowControls(false)} />}
    </div>
  );
}

// Small control cluster shown over an illustrated scene.
function ArtBar({ onExplore, onResume }: { onExplore: () => void; onResume: () => void }) {
  return (
    <div className="font-pixel pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-end gap-2 p-3">
      <button
        onClick={onResume}
        className="pointer-events-auto rounded border border-[#404763] bg-[#0a0812]/70 px-3 py-1 text-xs text-[#dacfb6] hover:border-[#f2c750] hover:text-[#f2c750]"
      >
        ▤ Read the résumé
      </button>
      <button
        onClick={onExplore}
        className="pointer-events-auto rounded border border-[#a36f1b] bg-[#0a0812]/70 px-3 py-1 text-xs text-[#f2c750] hover:brightness-125"
      >
        ▶ Explore in 3D
      </button>
    </div>
  );
}
