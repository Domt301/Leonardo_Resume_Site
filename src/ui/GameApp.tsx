import { useEffect, useRef, useState } from 'react';
import { Engine } from '../engine/Engine';
import { useGameStore, type Phase } from '../store/useGameStore';
import { DEEP_LINKS } from '../data/islands';
import TitleScreen from './TitleScreen';
import Hud from './Hud';
import Panels from './Panels';
import PauseMenu from './PauseMenu';
import MapScreen from './MapScreen';
import ControlsCard from './ControlsCard';
import TouchControls from './TouchControls';
import TitleCard, { type CardData } from './TitleCard';
import ResumeOverlay from './ResumeOverlay';

// Mounts the engine once (StrictMode-safe) and renders the phase-driven DOM
// overlays. React owns the DOM UI; the engine owns the canvas (spec §4).
export default function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const cardCounter = useRef(0);
  const prevPhase = useRef<Phase>('title');

  const [card, setCard] = useState<CardData | null>(null);
  const [showControls, setShowControls] = useState(false);

  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

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

    // deep links (spec §15)
    const hash = window.location.hash;
    if (hash === '#/resume') {
      engine.init('home', false);
      setPhase('resume');
    } else if (DEEP_LINKS[hash]) {
      engine.init(DEEP_LINKS[hash], true);
    } else {
      engine.init('home', false);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') setShowControls(true);
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

  // remember the phase we came from so the résumé overlay can return to it
  useEffect(() => {
    if (phase !== 'resume') prevPhase.current = phase;
  }, [phase]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#07060d]">
      <canvas ref={canvasRef} className="h-full w-full" />

      {phase === 'title' && (
        <TitleScreen onBegin={() => engineRef.current?.beginGame()} onSkip={() => setPhase('resume')} />
      )}

      {(phase === 'playing' || phase === 'paused' || phase === 'map') && (
        <>
          <Hud onControls={() => setShowControls(true)} />
          <Panels />
          <TitleCard card={card} reducedMotion={reducedMotion} />
          <TouchControls
            onAxis={(x, y) => engineRef.current?.touchAxis(x, y)}
            onInteract={() => engineRef.current?.touchInteract()}
          />
        </>
      )}

      {phase === 'paused' && (
        <PauseMenu
          onResume={() => setPhase('playing')}
          onReadResume={() => setPhase('resume')}
          onControls={() => setShowControls(true)}
        />
      )}

      {phase === 'map' && (
        <MapScreen
          onClose={() => setPhase('playing')}
          onTravel={(id) => engineRef.current?.fastTravel(id)}
        />
      )}

      {phase === 'resume' && (
        <div className="fixed inset-0 z-50">
          <ResumeOverlay onClose={() => setPhase(prevPhase.current === 'resume' ? 'title' : prevPhase.current)} />
        </div>
      )}

      {showControls && <ControlsCard onClose={() => setShowControls(false)} />}
    </div>
  );
}
