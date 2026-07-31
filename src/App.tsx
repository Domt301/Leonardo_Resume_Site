import { useMemo } from 'react';
import GameApp from './ui/GameApp';
import ResumeOverlay from './ui/ResumeOverlay';

// Capability gate (spec §0.2, §17). If WebGL is unavailable or the viewport is
// too small, the HTML résumé IS the page. Otherwise, boot the game — which still
// contains its own "Skip the quest — read the résumé" path.
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export default function App() {
  const capable = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const bigEnough = Math.min(window.innerWidth, window.innerHeight) >= 320;
    return detectWebGL() && bigEnough;
  }, []);

  if (!capable) {
    return (
      <ResumeOverlay
        standalone
        fallbackNote="Your browser can't run the interactive version. Here's the résumé."
      />
    );
  }

  return <GameApp />;
}
