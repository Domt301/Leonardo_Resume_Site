import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional content rendered left of the close button (e.g. a back link). */
  headerExtra?: ReactNode;
}

/**
 * Content panel chrome (spec §9.6, §10.4): HTML dialog over the canvas,
 * focus-trapped, Escape to close, internal scroll, full-screen sheet on mobile.
 */
export default function PanelShell({ title, onClose, children, headerExtra }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useFocusTrap(ref, true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const transition = reducedMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' as const };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#07060d]/70 backdrop-blur-[2px] sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        className="rq-panel flex h-full w-full flex-col sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-[1000px]"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
        transition={transition}
      >
        <span className="rq-corner-tr" aria-hidden />
        <span className="rq-corner-bl" aria-hidden />

        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#242838] bg-[#131022]/95 px-4 py-3 sm:px-6">
          <h2 id="panel-title" className="font-pixel text-sm uppercase tracking-wider text-[#f2c750]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="rounded border border-[#626a8b] px-3 py-1 text-sm text-[#dacfb6] hover:bg-white/10"
            >
              ✕ <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}
