import { Panel } from './Panel';

// Pause menu (spec §0.2, §11). Includes the résumé escape hatch + PDF download.
export default function PauseMenu({
  onResume,
  onReadResume,
  onControls,
}: {
  onResume: () => void;
  onReadResume: () => void;
  onControls: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4">
      <Panel className="w-full max-w-xs text-center" labelledBy="pause-title">
        <h2 id="pause-title" className="mb-4 text-lg text-[#f6efdd]">
          Paused
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          <MenuButton onClick={onResume}>▶ Resume</MenuButton>
          <MenuButton onClick={onReadResume}>▤ Read the résumé</MenuButton>
          <a
            href="LeonardoWildt-Resume.pdf"
            download
            className="rounded border border-[#a36f1b] px-3 py-2 text-[#f2c750] hover:bg-[#a36f1b]/20"
          >
            ⭳ Download PDF
          </a>
          <MenuButton onClick={onControls}>⚙ Controls &amp; settings</MenuButton>
        </div>
      </Panel>
    </div>
  );
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded border border-[#404763] px-3 py-2 text-[#dacfb6] hover:bg-white/10">
      {children}
    </button>
  );
}
