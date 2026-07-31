import { useMemo } from 'react';

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

/**
 * Capability gate (spec §20.2). If WebGL is unavailable or the viewport is too
 * small, the HTML resume IS the page.
 */
export function useWebGLSupport(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    const bigEnough = Math.min(window.innerWidth, window.innerHeight) >= 320;
    return detectWebGL() && bigEnough;
  }, []);
}
