import { useEffect } from 'react';
import { profile } from '../data/profile';
import { jobs } from '../data/jobs';
import { certs } from '../data/certs';
import { education } from '../data/education';
import { skills } from '../data/skills';

// ─────────────────────────────────────────────────────────────────────────────
// The HTML résumé — the non-negotiable "the résumé must survive the game" path
// (spec §0.2, §15). 100% of the world's content, rendered from the SAME typed
// data files the game consumes. Semantic, scrollable, keyboard-navigable,
// screen-reader friendly, printable via @media print. This is what an ATS
// scraper and a no-WebGL visitor see.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  /** When true this IS the page (WebGL/size fallback); no close button. */
  standalone?: boolean;
  onClose?: () => void;
  /** Optional note shown at the top of the fallback page. */
  fallbackNote?: string;
}

const PDF_HREF = 'LeonardoWildt-Resume.pdf';

export default function ResumeOverlay({ standalone = false, onClose, fallbackNote }: Props) {
  useEffect(() => {
    document.body.classList.add('resume-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('resume-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#0a0812] text-[#e7e1d2]"
      role="document"
      aria-label={`Résumé of ${profile.name}`}
    >
      <style>{PRINT_CSS}</style>

      {!standalone && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#242838] bg-[#0a0812]/95 px-4 py-2 backdrop-blur no-print">
          <span className="font-pixel text-xs text-[#b6a78d]">RÉSUMÉ</span>
          <div className="flex gap-2">
            <a
              href={PDF_HREF}
              download
              className="rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
            >
              Download PDF
            </a>
            <button
              onClick={onClose}
              className="rounded border border-[#626a8b] px-3 py-1 text-sm text-[#dacfb6] hover:bg-white/10"
              aria-label="Close résumé and return to the quest"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {fallbackNote && (
          <p className="mb-6 rounded border border-[#3c4dc6] bg-[#151b4f]/40 px-4 py-2 text-sm text-[#96a8ff]">
            {fallbackNote}
          </p>
        )}

        {/* Header */}
        <header className="mb-6 border-b border-[#242838] pb-5">
          <h1 className="font-pixel text-2xl leading-tight text-[#f6efdd] sm:text-3xl">{profile.name}</h1>
          <p className="mt-1 text-lg text-[#d49d2b]">{profile.title}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#b6a78d]">
            <li>{profile.location}</li>
            <li>
              <a className="underline hover:text-[#f2c750]" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </li>
            <li>
              <a className="underline hover:text-[#f2c750]" href={`tel:${profile.phone.replace(/\D/g, '')}`}>
                {profile.phone}
              </a>
            </li>
            {profile.links
              .filter((l) => l.href !== '#')
              .map((l) => (
                <li key={l.label}>
                  <a className="underline hover:text-[#f2c750]" href={l.href} target="_blank" rel="noreferrer">
                    {titleCase(l.label)}
                  </a>
                </li>
              ))}
            <li>{profile.languages}</li>
          </ul>
          {standalone && (
            <a
              href={PDF_HREF}
              download
              className="mt-4 inline-block rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20 no-print"
            >
              Download PDF résumé
            </a>
          )}
        </header>

        {/* Summary */}
        <Section title="Summary">
          {profile.summary.map((p, i) => (
            <p key={i} className="mb-2 leading-relaxed text-[#d7cfbd]">
              {p}
            </p>
          ))}
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {skills.map((cat) => (
              <div key={cat.name}>
                <dt className="text-sm font-semibold text-[#8ee9ef]">{cat.name}</dt>
                <dd className="text-sm text-[#d7cfbd]">{cat.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          {jobs.map((job) => (
            <article key={job.id} id={`job-${job.id}`} className="mb-6 break-inside-avoid">
              <header className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-lg font-semibold text-[#f6efdd]">
                  {job.company} <span className="text-[#b6a78d]">— {job.role}</span>
                </h3>
                <span className="text-sm text-[#b6a78d]">{job.dates}</span>
              </header>
              <p className="text-sm italic text-[#96a8ff]">{job.location}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[#d7cfbd]">
                {job.bullets.map((b, i) => (
                  <li key={i}>
                    {b.text}
                    {b.unverified && (
                      <span
                        className="ml-1 align-super text-[10px] text-[#d25c65] no-print"
                        title="Inferred elaboration awaiting sign-off"
                      >
                        (added)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[#8890b0]">{job.plaque.join(' · ')}</p>
            </article>
          ))}
        </Section>

        {/* Certifications */}
        <Section title="Certifications">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {certs.map((c) => (
              <li key={c.id} className="text-sm text-[#d7cfbd]">
                <span className="text-[#f6efdd]">{c.name}</span>
                <span className="text-[#8890b0]"> — {c.issuer}</span>
                {c.status === 'lapsed' && (
                  <span className="ml-1 rounded bg-[#7a2029]/40 px-1 text-[10px] uppercase text-[#ee9297]">
                    lapsed
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* Education */}
        <Section title="Education & Training">
          {education.map((e) => (
            <div key={e.id} className="mb-3">
              <h3 className="text-base font-semibold text-[#f6efdd]">
                {e.name}
                {e.year && <span className="ml-2 text-sm font-normal text-[#b6a78d]">{e.year}</span>}
              </h3>
              <p className="text-sm text-[#96a8ff]">{e.institution}</p>
              <p className="text-sm text-[#d7cfbd]">{e.blurb}</p>
            </div>
          ))}
        </Section>

        <footer className="mt-10 border-t border-[#242838] pt-4 text-center text-xs text-[#626a8b]">
          {profile.name} · {profile.location} · {profile.email}
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="font-pixel mb-3 text-sm uppercase tracking-wider text-[#d49d2b]">{title}</h2>
      {children}
    </section>
  );
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

const PRINT_CSS = `
@media print {
  .no-print { display: none !important; }
  body, html { background: #fff !important; overflow: visible !important; }
  * { color: #111 !important; }
  a { text-decoration: none; }
  .break-inside-avoid { break-inside: avoid; }
}
`;
