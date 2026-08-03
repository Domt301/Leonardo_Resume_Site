import { useRef } from 'react';
import { useUIStore } from '../../state/useUIStore';
import { useSettingsStore } from '../../state/useSettingsStore';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/** Help overlay (spec §10.6): controls, navigation, accessibility, settings. */
export default function HelpOverlay() {
  const open = useUIStore((s) => s.helpOpen);
  const setHelpOpen = useUIStore((s) => s.setHelpOpen);
  const setResumeOpen = useUIStore((s) => s.setResumeOpen);
  const openResumeForPrint = useUIStore((s) => s.openResumeForPrint);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#07060d]/70 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setHelpOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setHelpOpen(false);
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="rq-panel max-h-[85vh] w-full max-w-md overflow-y-auto p-5"
      >
        <span className="rq-corner-tr" aria-hidden />
        <span className="rq-corner-bl" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 id="help-title" className="font-pixel text-sm uppercase tracking-wider text-[#f2c750]">
            Controls &amp; Help
          </h2>
          <button
            onClick={() => setHelpOpen(false)}
            aria-label="Close help"
            className="rounded border border-[#626a8b] px-2 py-0.5 text-sm text-[#dacfb6] hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <dl className="mt-4 space-y-2 text-sm text-[#d7cfbd]">
          <Row k={<><kbd className="rq-key">W</kbd><kbd className="rq-key">A</kbd><kbd className="rq-key">S</kbd><kbd className="rq-key">D</kbd> / arrows</>} v="Move" />
          <Row k={<><kbd className="rq-key">E</kbd> / <kbd className="rq-key">Enter</kbd></>} v="Interact with the nearest sign" />
          <Row k={<kbd className="rq-key">Esc</kbd>} v="Close a panel" />
          <Row k={<kbd className="rq-key">M</kbd>} v="Toggle audio" />
          <Row k={<><kbd className="rq-key">H</kbd> / <kbd className="rq-key">?</kbd></>} v="This help" />
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-[#b6a78d]">
          Walk to a signpost and interact to open that resume section — or skip the walking entirely:
          every section is in the menu at the top, and the full resume is one click away.
        </p>

        <div className="mt-4 space-y-2 border-t border-[#242838] pt-4">
          <label className="flex items-center justify-between gap-3 text-sm text-[#d7cfbd]">
            Audio
            <button
              onClick={toggleAudio}
              aria-pressed={audioEnabled}
              className="rq-key !min-w-0 px-3 py-1 text-xs"
            >
              {audioEnabled ? 'On' : 'Muted'}
            </button>
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-[#d7cfbd]">
            Reduced motion
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              aria-pressed={reducedMotion}
              className="rq-key !min-w-0 px-3 py-1 text-xs"
            >
              {reducedMotion ? 'On' : 'Off'}
            </button>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#242838] pt-4">
          <button
            onClick={() => {
              setHelpOpen(false);
              setResumeOpen(true);
            }}
            className="rounded border border-[#626a8b] px-3 py-1 text-sm text-[#dacfb6] hover:bg-white/10"
          >
            Browse resume
          </button>
          <button
            onClick={() => {
              setHelpOpen(false);
              openResumeForPrint();
            }}
            className="rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1">{k}</dt>
      <dd className="text-right text-[#b6a78d]">{v}</dd>
    </div>
  );
}
