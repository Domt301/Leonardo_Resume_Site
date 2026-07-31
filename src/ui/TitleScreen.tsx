import { profile } from '../data/profile';

// Title screen (spec §11.5). The home island floats behind (rendered live by the
// engine); this is the DOM overlay with two doors.
export default function TitleScreen({ onBegin, onSkip }: { onBegin: () => void; onSkip: () => void }) {
  return (
    <div className="font-pixel fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-transparent via-transparent to-[#07060d]/55 px-4 text-center">
      <div>
        <h1 className="text-4xl text-[#f6efdd] sm:text-6xl" style={{ textShadow: '3px 3px 0 #07060d' }}>
          RESUME QUEST
        </h1>
        <p className="mt-2 text-sm text-[#d49d2b] sm:text-base">
          {profile.name} — {profile.title}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onBegin}
          className="rq-panel px-6 py-3 text-sm text-[#f2c750] transition hover:brightness-125"
        >
          <span className="rq-corner-tr" aria-hidden />
          <span className="rq-corner-bl" aria-hidden />
          ▶ Begin the quest
        </button>
        <button
          onClick={onSkip}
          className="rq-panel px-6 py-3 text-sm text-[#dacfb6] transition hover:brightness-125"
        >
          <span className="rq-corner-tr" aria-hidden />
          <span className="rq-corner-bl" aria-hidden />
          ▤ Skip the quest — read the résumé
        </button>
      </div>
      <p className="text-[10px] text-[#8890b0]">WASD move · drag look · E select · M map</p>
    </div>
  );
}
