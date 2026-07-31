import { useEffect } from 'react';
import { Panel } from './Panel';
import { useGameStore } from '../store/useGameStore';
import { jobById } from '../data/jobs';
import { certById } from '../data/certs';
import { educationById } from '../data/education';
import { profile } from '../data/profile';
import { skills } from '../data/skills';

// The centre-bottom, on-demand panels (spec §10, §11). One component switches on
// the active panel kind. Every panel is dismissable and keyboard-accessible.

export default function Panels() {
  const panel = useGameStore((s) => s.panel);
  const close = useGameStore((s) => s.closePanel);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, close]);

  if (!panel) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-xl">{renderPanel(panel, close)}</div>
    </div>
  );
}

function renderPanel(panel: NonNullable<ReturnType<typeof useGameStore.getState>['panel']>, close: () => void) {
  switch (panel.kind) {
    case 'sign': {
      const job = jobById(panel.jobId);
      if (!job) return null;
      return (
        <Panel onClose={close} labelledBy="sign-title">
          <h2 id="sign-title" className="text-base text-[#f6efdd]">
            {job.company}
          </h2>
          <p className="text-sm text-[#d49d2b]">
            {job.role} · {job.location}
          </p>
          <p className="text-xs text-[#8890b0]">{job.dates}</p>
          <p className="mt-2 text-sm italic text-[#96a8ff]">“{job.signLine}”</p>
          <p className="mt-2 text-xs leading-relaxed text-[#b6a78d]">{job.plaque.join(' · ')}</p>
        </Panel>
      );
    }
    case 'summary':
      return (
        <Panel onClose={close} labelledBy="sum-title">
          <h2 id="sum-title" className="text-base text-[#f6efdd]">
            {profile.name}
          </h2>
          <p className="text-sm text-[#d49d2b]">{profile.title}</p>
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-[#d7cfbd]">
            {profile.summary.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Panel>
      );
    case 'skills':
      return (
        <Panel onClose={close} labelledBy="sk-title">
          <h2 id="sk-title" className="text-base text-[#f6efdd]">
            The Armory
          </h2>
          <dl className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
            {skills.map((cat) => (
              <div key={cat.name}>
                <dt className="text-[#8ee9ef]">{cat.name}</dt>
                <dd className="text-[#d7cfbd]">{cat.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      );
    case 'contact':
      return (
        <Panel onClose={close} labelledBy="ct-title">
          <h2 id="ct-title" className="text-base text-[#f6efdd]">
            Contact
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-[#d7cfbd]">
            <li>{profile.location}</li>
            <li>
              <a className="underline hover:text-[#f2c750]" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </li>
            <li>{profile.phone}</li>
            {profile.links
              .filter((l) => l.href !== '#')
              .map((l) => (
                <li key={l.label}>
                  <a className="underline hover:text-[#f2c750]" href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
          </ul>
        </Panel>
      );
    case 'dialogue':
      return (
        <Panel onClose={close} labelledBy="dlg-title">
          <h2 id="dlg-title" className="text-sm text-[#d49d2b]">
            {panel.npc}
          </h2>
          <div className="mt-1 space-y-2 text-sm leading-relaxed text-[#dacfb6]">
            {panel.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
          <p className="mt-3 text-right text-[10px] text-[#626a8b]">E / Esc to close</p>
        </Panel>
      );
    case 'mark': {
      const job = jobById(panel.jobId);
      if (!job) return null;
      return (
        <Panel onClose={close} labelledBy="mk-title">
          <p className="text-[10px] uppercase tracking-widest text-[#8ee9ef]">Mark earned</p>
          <h2 id="mk-title" className="text-base text-[#f6efdd]">
            {job.mark.name}
          </h2>
          <p className="mt-1 text-sm italic text-[#f2c750]">“{job.mark.quote}”</p>
          <p className="mt-2 text-xs text-[#b6a78d]">
            {job.company} — {job.role}, {job.dates}
          </p>
        </Panel>
      );
    }
    case 'cert': {
      const c = certById(panel.certId);
      if (!c) return null;
      return (
        <Panel onClose={close} labelledBy="cert-title">
          <div className="flex items-center gap-2">
            <h2 id="cert-title" className="text-base text-[#f6efdd]">
              {c.name}
            </h2>
            <span
              className={`rounded px-1 text-[10px] uppercase ${
                c.status === 'active' ? 'bg-[#255431]/60 text-[#95d772]' : 'bg-[#7a2029]/50 text-[#ee9297]'
              }`}
            >
              {c.status}
            </span>
          </div>
          <p className="text-xs text-[#8890b0]">{c.issuer}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#d7cfbd]">{c.blurb}</p>
        </Panel>
      );
    }
    case 'education': {
      const e = educationById(panel.eduId);
      if (!e) return null;
      return (
        <Panel onClose={close} labelledBy="ed-title">
          <h2 id="ed-title" className="text-base text-[#f6efdd]">
            {e.name}
          </h2>
          <p className="text-xs text-[#96a8ff]">
            {e.institution}
            {e.year ? ` · ${e.year}` : ''}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#d7cfbd]">{e.blurb}</p>
        </Panel>
      );
    }
    default:
      return null;
  }
}
