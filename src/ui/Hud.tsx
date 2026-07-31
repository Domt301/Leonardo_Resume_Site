import { useGameStore } from '../store/useGameStore';
import { jobs } from '../data/jobs';
import { certs } from '../data/certs';
import { education } from '../data/education';
import { profile } from '../data/profile';

// The HUD (spec §11.1): Mark pips + progress (top-left), controls hint
// (top-right), Info Panel (bottom-left), Controls Card (bottom-right), and the
// centre-bottom interaction hint. It is not health — there is no damage.

export default function Hud({ onControls }: { onControls: () => void }) {
  const marks = useGameStore((s) => s.marks);
  const sigils = useGameStore((s) => s.sigils);
  const creds = useGameStore((s) => s.credentials);
  const signs = useGameStore((s) => s.signsRead);
  const hint = useGameStore((s) => s.hint);
  const sound = useGameStore((s) => s.settings.sound);
  const setSound = useGameStore((s) => s.updateSettings);

  const total = jobs.length * 2 + certs.length + education.length; // sign+mark per job, each cert, each edu
  const viewed =
    signs.length +
    Object.values(marks).filter(Boolean).length +
    Object.values(sigils).filter(Boolean).length +
    Object.values(creds).filter(Boolean).length;
  const pct = Math.min(100, Math.round((viewed / total) * 100));

  return (
    <div className="font-pixel pointer-events-none fixed inset-0 z-20 select-none">
      {/* top-left: Mark pips + progress */}
      <div className="absolute left-3 top-3 flex flex-col gap-1">
        <div className="flex gap-1" aria-label="Marks earned">
          {jobs.map((j) => (
            <Pip key={j.id} filled={!!marks[j.id]} title={j.mark.name} />
          ))}
        </div>
        <div className="h-2 w-40 border border-[#141120] bg-[#0a0812]">
          <div className="h-full bg-[#d49d2b]" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] text-[#8890b0]">{pct}% explored</span>
      </div>

      {/* top-right: controls + sound */}
      <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2">
        <button
          onClick={() => setSound({ sound: !sound })}
          className="text-[11px] text-[#b6a78d] hover:text-[#f2c750]"
          aria-label={sound ? 'Mute sound' : 'Unmute sound'}
        >
          {sound ? '♪ ON' : '♪ OFF'}
        </button>
        <button onClick={onControls} className="text-[11px] text-[#b6a78d] hover:text-[#f2c750]">
          PRESS ? FOR CONTROLS
        </button>
      </div>

      {/* bottom-left: Info Panel */}
      <div className="rq-panel pointer-events-auto absolute bottom-3 left-3 flex items-center gap-3 px-3 py-2">
        <span className="rq-corner-tr" aria-hidden />
        <span className="rq-corner-bl" aria-hidden />
        <div className="grid h-9 w-9 place-items-center rounded-sm bg-[#1e1a30] text-lg">🧑🏻‍💻</div>
        <div>
          <p className="text-xs text-[#f6efdd]">{profile.name}</p>
          <p className="text-[10px] text-[#d49d2b]">{profile.title}</p>
          <p className="text-[9px] text-[#8890b0]">
            {profile.links.map((l) => l.label).join(' | ')}
          </p>
        </div>
      </div>

      {/* bottom-right: Controls Card */}
      <div className="rq-panel pointer-events-none absolute bottom-3 right-3 px-3 py-2 text-[10px] text-[#b6a78d]">
        <span className="rq-corner-tr" aria-hidden />
        <span className="rq-corner-bl" aria-hidden />
        <span className="rq-key">W A S D</span> move&nbsp;·&nbsp;
        <span className="rq-key">drag</span> look&nbsp;·&nbsp;
        <span className="rq-key">E</span> select&nbsp;·&nbsp;
        <span className="rq-key">M</span> map
      </div>

      {/* centre-bottom: interaction hint */}
      {hint && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <div className="rq-panel px-3 py-1 text-xs text-[#f2c750]">
            <span className="rq-corner-tr" aria-hidden />
            <span className="rq-corner-bl" aria-hidden />
            <span className="mr-1 text-[#f2c750]">!</span>
            {hint} <span className="text-[#8890b0]">[E]</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Pip({ filled, title }: { filled: boolean; title: string }) {
  return (
    <span
      title={title}
      className={`inline-block h-3 w-3 rotate-45 border ${
        filled ? 'border-[#f2c750] bg-[#d49d2b]' : 'border-[#404763] bg-transparent'
      }`}
    />
  );
}
