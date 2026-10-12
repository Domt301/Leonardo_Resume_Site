import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../state/useUIStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const TOAST_MS = 1800;

/** Short gameplay notice ("Ouch!", "Found a heart!") stacked above the interaction prompt. */
export default function Toast() {
  const notice = useUIStore((s) => s.notice);
  const clearNotice = useUIStore((s) => s.clearNotice);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => clearNotice(notice.id), TOAST_MS);
    return () => clearTimeout(t);
  }, [notice, clearNotice]);

  const transition = reducedMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' as const };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex justify-center sm:bottom-36"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            className="rq-panel px-4 py-2"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            <span className="rq-corner-tr" aria-hidden />
            <span className="rq-corner-bl" aria-hidden />
            <p className="font-pixel text-xs uppercase tracking-wider text-[#f6efdd]">{notice.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
