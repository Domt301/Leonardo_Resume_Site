import { profile } from '../../content/profile';
import { education } from '../../content/education';

export default function AboutPanel() {
  return (
    <div className="text-sm leading-relaxed text-[#d7cfbd]">
      {profile.summary.map((p, i) => (
        <p key={i} className="mb-3">
          {p}
        </p>
      ))}
      <p className="mb-6 text-xs text-[#8890b0]">{profile.languages}</p>

      <h3 className="font-pixel mb-3 text-xs uppercase tracking-wider text-[#d49d2b]">
        Education &amp; Training
      </h3>
      {education.map((e) => (
        <div key={e.id} className="mb-3">
          <h4 className="text-sm font-semibold text-[#f6efdd]">
            {e.name}
            {e.year && <span className="ml-2 text-xs font-normal text-[#b6a78d]">{e.year}</span>}
          </h4>
          <p className="text-xs text-[#96a8ff]">{e.institution}</p>
          <p className="text-xs text-[#b6a78d]">{e.blurb}</p>
        </div>
      ))}

      <a
        href={profile.resumeUrl}
        download
        className="mt-4 inline-block rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
      >
        Download PDF resume
      </a>
    </div>
  );
}
