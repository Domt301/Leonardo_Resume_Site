import { Panel } from './Panel';
import { useGameStore } from '../store/useGameStore';

// The controls / settings modal (spec §11, §17). Opened with "?".
export default function ControlsCard({ onClose }: { onClose: () => void }) {
  const settings = useGameStore((s) => s.settings);
  const update = useGameStore((s) => s.updateSettings);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4">
      <Panel onClose={onClose} className="w-full max-w-md" labelledBy="ctl-title">
        <h2 id="ctl-title" className="mb-3 text-base text-[#f6efdd]">
          Controls
        </h2>
        <ul className="space-y-1 text-xs text-[#d7cfbd]">
          <li><span className="rq-key">W A S D</span> / arrows — move (camera-relative)</li>
          <li><span className="rq-key">drag</span> / <span className="rq-key">Q</span> <span className="rq-key">R</span> — rotate camera 90°</li>
          <li><span className="rq-key">wheel</span> — zoom</li>
          <li><span className="rq-key">E</span> / click — select / interact</li>
          <li><span className="rq-key">M</span> — map &amp; fast travel</li>
          <li><span className="rq-key">Esc</span> — pause / close</li>
        </ul>

        <h3 className="mb-2 mt-4 text-sm text-[#d49d2b]">Settings</h3>
        <div className="space-y-2 text-xs">
          <Row label="Pixel size">
            {([3, 4, 6] as const).map((p) => (
              <Choice key={p} active={settings.pixelSize === p} onClick={() => update({ pixelSize: p })}>
                {p}
              </Choice>
            ))}
          </Row>
          <Row label="Iso angle">
            {([30, 26.565] as const).map((a) => (
              <Choice key={a} active={settings.isoAngle === a} onClick={() => update({ isoAngle: a })}>
                {a === 30 ? '30°' : '26.6°'}
              </Choice>
            ))}
          </Row>
          <Row label="Reduced motion">
            <Choice active={settings.reducedMotion} onClick={() => update({ reducedMotion: !settings.reducedMotion })}>
              {settings.reducedMotion ? 'On' : 'Off'}
            </Choice>
          </Row>
        </div>
      </Panel>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#b6a78d]">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[2.2em] rounded border px-2 py-0.5 ${
        active ? 'border-[#f2c750] bg-[#a36f1b]/30 text-[#f2c750]' : 'border-[#404763] text-[#b6a78d]'
      }`}
    >
      {children}
    </button>
  );
}
