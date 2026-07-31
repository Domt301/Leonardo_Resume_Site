import { profile } from '../../content/profile';
import PixelAvatar from '../ui/PixelAvatar';

/**
 * Bottom info bar (reference image): avatar, one-line summary, contact links.
 * Present in both game and fallback modes so contact links are always one
 * click away (spec §6.1.10).
 */
export default function Footer() {
  const links = [
    { label: 'ATLANTA, GA', href: null },
    { label: 'LINKEDIN', href: profile.linkedinUrl },
    { label: 'GITHUB', href: profile.githubUrl },
    { label: 'EMAIL', href: `mailto:${profile.email}` },
  ];

  return (
    <footer className="rq-panel pointer-events-auto absolute bottom-3 left-3 z-30 hidden max-w-2xl items-center gap-3 px-3 py-2 sm:flex">
      <span className="rq-corner-tr" aria-hidden />
      <span className="rq-corner-bl" aria-hidden />
      <PixelAvatar className="h-12 w-12 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-xs leading-relaxed text-[#dacfb6] lg:whitespace-normal">{profile.heroLine}</p>
        <ul className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px]">
          {links.map((l, i) => (
            <li key={l.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#4c5473]" aria-hidden>|</span>}
              {l.href ? (
                <a
                  href={l.href}
                  target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="font-pixel text-[#b6a78d] hover:text-[#f2c750]"
                >
                  {l.label}
                </a>
              ) : (
                <span className="font-pixel text-[#b6a78d]">{l.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
