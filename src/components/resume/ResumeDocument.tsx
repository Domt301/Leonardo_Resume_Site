import { useEffect } from 'react';
import { profile } from '../../content/profile';
import { experience, formatDates } from '../../content/experience';
import { certifications } from '../../content/certifications';
import { education } from '../../content/education';
import { skills } from '../../content/skills';
import { useUIStore } from '../../state/useUIStore';

// ─────────────────────────────────────────────────────────────────────────────
// The HTML resume — the non-negotiable "the resume must survive the game" path
// (spec §20.2). 100% of the world's content, rendered from the SAME typed
// content files the game consumes. Semantic, scrollable, keyboard-navigable,
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

export default function ResumeDocument({ standalone = false, onClose, fallbackNote }: Props) {
  const printPending = useUIStore((s) => s.printPending);
  const clearPrintPending = useUIStore((s) => s.clearPrintPending);

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

  // Buttons elsewhere in the app open this document and request a print; wait for
  // the overlay to paint (double rAF) before invoking the browser print dialog.
  useEffect(() => {
    if (!printPending) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.print();
        clearPrintPending();
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [printPending, clearPrintPending]);

  const externalLinks = [
    { label: 'LinkedIn', href: profile.linkedinUrl },
    { label: 'GitHub', href: profile.githubUrl },
  ];

  return (
    <div
      data-resume-doc
      className={`min-h-full w-full overflow-y-auto bg-[#0a0812] text-[#e7e1d2] ${standalone ? '' : 'fixed inset-0 z-50'}`}
      role="document"
      aria-label={`Resume of ${profile.name}`}
    >
      <style>{PRINT_CSS}</style>

      {!standalone && (
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-[#242838] bg-[#0a0812]/95 px-4 py-2 backdrop-blur">
          <span className="font-pixel text-xs text-[#b6a78d]">RESUME</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="rounded border border-[#626a8b] px-3 py-1 text-sm text-[#dacfb6] hover:bg-white/10"
              aria-label="Close resume and return to the island"
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

        <header className="mb-6 border-b border-[#242838] pb-5">
          <h1 className="font-pixel text-2xl leading-tight text-[#f6efdd] sm:text-3xl">{profile.name}</h1>
          <p className="mt-1 text-lg text-[#d49d2b]">{profile.headline}</p>
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
            {externalLinks.map((l) => (
              <li key={l.label}>
                <a
                  className="underline hover:text-[#f2c750]"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>{profile.languages}</li>
          </ul>
          {standalone && (
            <button
              onClick={() => window.print()}
              className="no-print mt-4 inline-block rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
            >
              Download PDF resume
            </button>
          )}
        </header>

        <Section title="Summary">
          {profile.summary.map((p, i) => (
            <p key={i} className="mb-2 leading-relaxed text-[#d7cfbd]">
              {p}
            </p>
          ))}
        </Section>

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

        <Section title="Experience">
          {experience.map((job) => (
            <article key={job.id} id={`job-${job.id}`} className="mb-6 break-inside-avoid">
              <header className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-lg font-semibold text-[#f6efdd]">
                  {job.company} <span className="text-[#b6a78d]">— {job.title}</span>
                </h3>
                <span className="text-sm text-[#b6a78d]">{formatDates(job)}</span>
              </header>
              {job.location && <p className="text-sm italic text-[#96a8ff]">{job.location}</p>}
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[#d7cfbd]">
                {job.achievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[#8890b0]">{job.technologies.join(' · ')}</p>
            </article>
          ))}
        </Section>

        <Section title="Certifications">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {certifications.map((c) => (
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

const PRINT_CSS = `
@media print {
  /* Let the resume flow across pages instead of being clipped to one viewport. */
  html, body, #root, [data-site-shell] {
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
  }
  /* Isolate the resume: when it is the modal overlay, hide the game and chrome
     (its siblings inside the SiteShell root) so only the resume prints. */
  [data-site-shell] > *:not([data-resume-doc]) { display: none !important; }
  [data-resume-doc] {
    position: static !important;
    inset: auto !important;
    overflow: visible !important;
    height: auto !important;
    min-height: 0 !important;
  }
  /* Drop the dark theme so text is legible on white regardless of the
     browser's "print background graphics" setting. */
  [data-resume-doc], [data-resume-doc] * { background: transparent !important; }
  .no-print { display: none !important; }
  * { color: #111 !important; }
  a { text-decoration: none; }
  .break-inside-avoid, article { break-inside: avoid; }
}
`;
