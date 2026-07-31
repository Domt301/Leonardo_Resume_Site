import { useGameStore } from '../../state/useGameStore';
import { useUIStore } from '../../state/useUIStore';
import { useSettingsStore } from '../../state/useSettingsStore';
import { RESUME_SECTIONS, type ResumeSection } from '../../types/resume';
import { ZONE_LABELS } from '../../app/routeMap';
import { useIsTouch } from '../../hooks/useMediaQuery';
import QualityMenu from './QualityMenu';

const HEART_THEMES = ['Engineering', 'Leadership', 'Delivery'] as const;

/** HTML HUD over the canvas (spec §10.1, reference image). */
export default function Hud() {
  const visited = useUIStore((s) => s.visited);
  const toggleHelp = useUIStore((s) => s.toggleHelp);
  const currentZoneId = useGameStore((s) => s.currentZoneId);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);
  const isTouch = useIsTouch();

  const progress = visited.length / RESUME_SECTIONS.length;
  const zoneLabel =
    currentZoneId && currentZoneId !== 'spawn'
      ? ZONE_LABELS[currentZoneId as ResumeSection]
      : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden={false}>
      {/* Top-left: hearts + exploration progress */}
      <div className="absolute left-3 top-12 sm:top-14">
        <div
          className="flex gap-1"
          role="img"
          aria-label={`Portfolio themes: ${HEART_THEMES.join(', ')}`}
        >
          {HEART_THEMES.map((theme) => (
            <PixelHeart key={theme} title={theme} />
          ))}
        </div>
        <div
          className="mt-1.5 h-3 w-32 border border-[#242838] bg-[#131022] p-[2px]"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Sections explored"
        >
          <div
            className="h-full bg-gradient-to-r from-[#54a253] to-[#7ec85f]"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
        {zoneLabel && (
          <p className="font-pixel mt-1.5 text-[10px] uppercase tracking-wider text-[#b6a78d]">
            {zoneLabel}
          </p>
        )}
      </div>

      {/* Top-right: controls hint + toggles */}
      <div className="pointer-events-auto absolute right-3 top-12 flex items-center gap-2 sm:top-14">
        {!isTouch && (
          <button
            onClick={toggleHelp}
            className="font-pixel hidden text-xs uppercase tracking-wider text-[#dacfb6] hover:text-[#f2c750] sm:block"
          >
            Press <kbd className="rq-key">?</kbd> for controls
          </button>
        )}
        <button
          onClick={toggleAudio}
          aria-pressed={audioEnabled}
          aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
          className="rq-key !min-w-0 px-2 py-1"
          title="Toggle audio (M)"
        >
          {audioEnabled ? '♪' : '♪̶'}
        </button>
        <QualityMenu />
      </div>

      {/* Bottom-right: controls box (desktop only) */}
      {!isTouch && (
        <div className="rq-panel absolute bottom-3 right-3 hidden px-3 py-2 md:block">
          <span className="rq-corner-tr" aria-hidden />
          <span className="rq-corner-bl" aria-hidden />
          <table className="font-pixel text-[10px] uppercase tracking-wider text-[#dacfb6]">
            <tbody>
              <tr>
                <td className="pr-3">
                  <kbd className="rq-key">W</kbd> <kbd className="rq-key">A</kbd>{' '}
                  <kbd className="rq-key">S</kbd> <kbd className="rq-key">D</kbd>
                </td>
                <td>Move</td>
              </tr>
              <tr>
                <td className="pr-3 pt-1">
                  <kbd className="rq-key">E</kbd>
                </td>
                <td className="pt-1">Select</td>
              </tr>
              <tr>
                <td className="pr-3 pt-1">
                  <kbd className="rq-key">?</kbd>
                </td>
                <td className="pt-1">Help</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PixelHeart({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 8 8" className="pixelated h-5 w-5" aria-hidden>
      <title>{title}</title>
      <path
        d="M1 1h2v1h2V1h2v3H6v1H5v1H4v1H3V6H2V5H1V4H0V2h1z"
        fill="#d25c65"
        stroke="#48111b"
        strokeWidth="0.35"
      />
      <rect x="1.5" y="1.5" width="1" height="1" fill="#ee9297" />
    </svg>
  );
}
