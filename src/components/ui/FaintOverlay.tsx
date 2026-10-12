import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../state/useGameStore';
import { useUIStore } from '../../state/useUIStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Fade-to-black when hearts hit zero. Midway through it asks the store to
 * respawn (the Player teleports to the stairway and hearts refill), then
 * lifts. Deliberately NOT part of `overlayOpen`: the Player checks `fainted`
 * itself so movement stays locked for exactly this long.
 */
export default function FaintOverlay() {
  const fainted = useGameStore((s) => s.fainted);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!fainted) return;
    const respawnAt = reducedMotion ? 150 : 500;
    const liftAt = reducedMotion ? 400 : 1000;
    const a = setTimeout(() => {
      useGameStore.getState().respawn();
      useUIStore.getState().showNotice('The chickens got you...');
    }, respawnAt);
    const b = setTimeout(() => useGameStore.getState().setFainted(false), liftAt);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [fainted, reducedMotion]);

  return (
    <AnimatePresence>
      {fainted && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[35] flex items-center justify-center bg-[#07060d]"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: reducedMotion ? 0.85 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
        >
          <p className="font-pixel text-sm uppercase tracking-wider text-[#dacfb6]">You fainted</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
