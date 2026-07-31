import { projects } from '../../content/projects';

export default function ProjectsPanel({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <li key={p.id}>
          <button
            onClick={() => onOpenProject(p.id)}
            className="block h-full w-full rounded border border-[#363c53] bg-[#131022] p-4 text-left hover:border-[#a36f1b]"
          >
            <h3 className="text-base font-semibold text-[#f6efdd]">{p.name}</h3>
            <p className="mt-1 text-sm text-[#96a8ff]">{p.tagline}</p>
            <p className="mt-2 line-clamp-3 text-sm text-[#d7cfbd]">{p.description}</p>
            <p className="mt-2 text-xs text-[#8890b0]">{p.technologies.join(' · ')}</p>
            {p.status && (
              <span className="mt-2 inline-block rounded bg-[#176272]/40 px-1.5 py-0.5 text-[10px] uppercase text-[#8ee9ef]">
                {p.status}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
