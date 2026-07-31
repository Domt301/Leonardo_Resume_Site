import { useState } from 'react';
import { Panel } from './Panel';
import { islands } from '../data/islands';
import { jobById } from '../data/jobs';
import { useGameStore } from '../store/useGameStore';

// Map screen (spec §11.6). A stylised overhead of the archipelago from island
// world positions; visited islands are lit, others silhouetted. Selecting an
// island fast-travels there.
export default function MapScreen({ onClose, onTravel }: { onClose: () => void; onTravel: (id: string) => void }) {
  const visited = useGameStore((s) => s.visited);
  const current = useGameStore((s) => s.currentIsland);
  const [selected, setSelected] = useState<string | null>(current);

  // project world centres into a 0..100 viewbox
  const centers = islands.map((i) => ({
    id: i.id,
    name: i.name,
    x: i.origin[0] + i.grid[0].length / 2,
    y: i.origin[1] + i.grid.length / 2,
    contentId: i.contentId,
  }));
  const xs = centers.map((c) => c.x);
  const ys = centers.map((c) => c.y);
  const minX = Math.min(...xs) - 10;
  const maxX = Math.max(...xs) + 10;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...ys) + 10;
  const proj = (x: number, y: number) => ({
    cx: ((x - minX) / (maxX - minX)) * 100,
    cy: ((y - minY) / (maxY - minY)) * 100,
  });

  const sel = centers.find((c) => c.id === selected);
  const job = sel?.contentId ? jobById(sel.contentId) : undefined;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 px-4">
      <Panel onClose={onClose} className="w-full max-w-lg" labelledBy="map-title">
        <h2 id="map-title" className="mb-2 text-base text-[#f6efdd]">
          The Archipelago
        </h2>
        <svg viewBox="0 0 100 100" className="w-full rounded bg-[#07060d]" role="group" aria-label="Map">
          {/* bridges */}
          {islands.flatMap((i) =>
            i.bridges.map((b, k) => {
              const a = centers.find((c) => c.id === i.id)!;
              const bb = centers.find((c) => c.id === b.to);
              if (!bb) return null;
              const pa = proj(a.x, a.y);
              const pbb = proj(bb.x, bb.y);
              return (
                <line
                  key={`${i.id}-${b.to}-${k}`}
                  x1={pa.cx}
                  y1={pa.cy}
                  x2={pbb.cx}
                  y2={pbb.cy}
                  stroke="#242838"
                  strokeWidth={0.5}
                />
              );
            }),
          )}
          {centers.map((c) => {
            const { cx, cy } = proj(c.x, c.y);
            const isVisited = visited.includes(c.id) || c.id === 'home';
            const isSel = c.id === selected;
            return (
              <g key={c.id} onClick={() => setSelected(c.id)} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 3.4 : 2.6}
                  fill={isVisited ? '#438a46' : '#404763'}
                  stroke={isSel ? '#f2c750' : c.id === current ? '#8ee9ef' : 'none'}
                  strokeWidth={0.6}
                />
              </g>
            );
          })}
        </svg>

        <div className="mt-3 min-h-[3rem] text-xs">
          {sel && (
            <>
              <p className="text-sm text-[#f6efdd]">{sel.name}</p>
              {job ? (
                <p className="text-[#d49d2b]">
                  {job.company} · {job.role} · {job.dates}
                </p>
              ) : (
                <p className="text-[#8890b0]">{sel.id === 'home' ? 'Home · summary, skills, contact' : ''}</p>
              )}
              <button
                onClick={() => onTravel(sel.id)}
                className="mt-2 rounded border border-[#a36f1b] px-3 py-1 text-[#f2c750] hover:bg-[#a36f1b]/20"
              >
                Fast travel here
              </button>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
