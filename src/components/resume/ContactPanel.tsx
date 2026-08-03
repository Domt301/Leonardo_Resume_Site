import { profile } from '../../content/profile';
import { useUIStore } from '../../state/useUIStore';

export default function ContactPanel() {
  const openResumeForPrint = useUIStore((s) => s.openResumeForPrint);
  return (
    <div className="text-sm leading-relaxed text-[#d7cfbd]">
      <p className="mb-4">
        Want to talk cloud architecture, API strategy, or engineering leadership? Let&apos;s connect.
      </p>
      <ul className="space-y-2">
        <li>
          <span className="text-[#8890b0]">Email — </span>
          <a className="underline hover:text-[#f2c750]" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        <li>
          <span className="text-[#8890b0]">Phone — </span>
          <a className="underline hover:text-[#f2c750]" href={`tel:${profile.phone.replace(/\D/g, '')}`}>
            {profile.phone}
          </a>
        </li>
        <li>
          <span className="text-[#8890b0]">LinkedIn — </span>
          <a
            className="underline hover:text-[#f2c750]"
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/leonardotrimarchi
          </a>
        </li>
        <li>
          <span className="text-[#8890b0]">GitHub — </span>
          <a
            className="underline hover:text-[#f2c750]"
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/Domt301
          </a>
        </li>
        <li>
          <span className="text-[#8890b0]">Location — </span>
          {profile.location}
        </li>
      </ul>
      <button
        onClick={openResumeForPrint}
        className="mt-5 inline-block rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
      >
        Download PDF resume
      </button>
    </div>
  );
}
