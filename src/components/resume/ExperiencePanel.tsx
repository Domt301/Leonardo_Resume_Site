import { experience, formatDates } from '../../content/experience';

export default function ExperiencePanel() {
  return (
    <div>
      {experience.map((job) => (
        <article key={job.id} className="mb-6 last:mb-0">
          <header className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-lg font-semibold text-[#f6efdd]">
              {job.company} <span className="text-[#b6a78d]">— {job.title}</span>
            </h3>
            <span className="text-sm text-[#b6a78d]">{formatDates(job)}</span>
          </header>
          {job.location && <p className="text-sm italic text-[#96a8ff]">{job.location}</p>}
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#d7cfbd]">
            {job.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[#8890b0]">{job.technologies.join(' · ')}</p>
        </article>
      ))}
    </div>
  );
}
