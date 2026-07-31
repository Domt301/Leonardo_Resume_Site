import { useState } from 'react';
import { useSettingsStore } from '../../state/useSettingsStore';
import type { QualityPreset } from '../../types/game';

const PRESETS: QualityPreset[] = ['low', 'medium', 'high'];

export default function QualityMenu() {
  const quality = useSettingsStore((s) => s.quality);
  const setQuality = useSettingsStore((s) => s.setQuality);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Graphics quality: ${quality}`}
        className="rq-key !min-w-0 px-2 py-1"
        title="Graphics quality"
      >
        ⚙
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Graphics quality"
          className="rq-panel absolute right-0 top-full z-50 mt-1 w-28 p-1"
        >
          {PRESETS.map((p) => (
            <li key={p} role="option" aria-selected={quality === p}>
              <button
                onClick={() => {
                  setQuality(p);
                  setOpen(false);
                }}
                className={`w-full rounded px-2 py-1 text-left text-xs uppercase tracking-wide hover:bg-white/10 ${
                  quality === p ? 'text-[#f2c750]' : 'text-[#dacfb6]'
                }`}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
