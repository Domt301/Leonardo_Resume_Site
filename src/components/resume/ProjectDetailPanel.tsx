import type { Project } from '../../types/resume';

export default function ProjectDetailPanel({ project }: { project: Project }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-[#d7cfbd]">
      <p className="text-base text-[#96a8ff]">{project.tagline}</p>
      <p>{project.description}</p>

      <Section label="Problem">
        <p>{project.problem}</p>
      </Section>
      <Section label="Solution">
        <p>{project.solution}</p>
      </Section>
      {project.architecture && (
        <Section label="Architecture">
          <ul className="list-disc space-y-1 pl-5">
            {project.architecture.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
      <Section label="Outcomes">
        <ul className="list-disc space-y-1 pl-5">
          {project.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Section>
      <Section label="Stack">
        <p className="text-xs text-[#8890b0]">{project.technologies.join(' · ')}</p>
      </Section>

      <div className="flex flex-wrap gap-2 pt-2">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
          >
            Live demo →
          </a>
        )}
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-[#626a8b] px-3 py-1 text-sm text-[#dacfb6] hover:bg-white/10"
          >
            Repository →
          </a>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-pixel mb-1 text-xs uppercase tracking-wider text-[#d49d2b]">{label}</h3>
      {children}
    </section>
  );
}
