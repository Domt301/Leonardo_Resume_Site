import { NavLink, useLocation } from 'react-router-dom';
import { RESUME_SECTIONS } from '../../types/resume';
import { SECTION_LABELS, SECTION_ROUTES } from '../../app/routeMap';
import { profile } from '../../content/profile';
import { useUIStore } from '../../state/useUIStore';
import { useRoutePanel } from '../../hooks/useRoutePanel';
import MobileNav from './MobileNav';

/** Persistent conventional navigation outside the canvas (spec §10.2). */
export default function Header() {
  const { pathname } = useLocation();
  const { openSection } = useRoutePanel();
  const setResumeOpen = useUIStore((s) => s.setResumeOpen);
  const openResumeForPrint = useUIStore((s) => s.openResumeForPrint);

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
      <NavLink
        to="/"
        className="font-pixel whitespace-nowrap text-sm text-[#f6efdd] hover:text-[#f2c750]"
        aria-label={`${profile.name} — home`}
      >
        {profile.name.toUpperCase()}
      </NavLink>

      <nav aria-label="Resume sections" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {RESUME_SECTIONS.map((section) => (
            <li key={section}>
              <button
                onClick={() => openSection(section, 'nav')}
                aria-current={pathname.startsWith(SECTION_ROUTES[section]) ? 'page' : undefined}
                className={`rounded px-2 py-1 text-xs uppercase tracking-wide hover:bg-white/10 hover:text-[#f2c750] ${
                  pathname.startsWith(SECTION_ROUTES[section]) ? 'text-[#f2c750]' : 'text-[#dacfb6]'
                }`}
              >
                {SECTION_LABELS[section]}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setResumeOpen(true)}
              className="rounded px-2 py-1 text-xs uppercase tracking-wide text-[#dacfb6] hover:bg-white/10 hover:text-[#f2c750]"
            >
              Browse resume
            </button>
          </li>
          <li>
            <button
              onClick={openResumeForPrint}
              className="ml-1 rounded border border-[#a36f1b] px-2 py-1 text-xs uppercase tracking-wide text-[#f2c750] hover:bg-[#a36f1b]/20"
            >
              Resume PDF
            </button>
          </li>
        </ul>
      </nav>

      <MobileNav />
    </header>
  );
}
