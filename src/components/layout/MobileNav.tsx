import { useRef } from 'react';
import { RESUME_SECTIONS } from '../../types/resume';
import { SECTION_LABELS } from '../../app/routeMap';
import { profile } from '../../content/profile';
import { useUIStore } from '../../state/useUIStore';
import { useRoutePanel } from '../../hooks/useRoutePanel';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/** Collapsible mobile menu (spec §10.2). */
export default function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const setResumeOpen = useUIStore((s) => s.setResumeOpen);
  const { openSection } = useRoutePanel();
  const menuRef = useRef<HTMLDivElement>(null);
  useFocusTrap(menuRef, open);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="rq-key !min-w-0 px-3 py-2 text-base"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div
          ref={menuRef}
          id="mobile-nav-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="rq-panel fixed inset-x-3 top-14 z-50 p-4"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <nav aria-label="Resume sections">
            <ul className="flex flex-col gap-1">
              {RESUME_SECTIONS.map((section) => (
                <li key={section}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      openSection(section, 'nav');
                    }}
                    className="w-full rounded px-3 py-2 text-left text-sm uppercase tracking-wide text-[#dacfb6] hover:bg-white/10"
                  >
                    {SECTION_LABELS[section]}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setOpen(false);
                    setResumeOpen(true);
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm uppercase tracking-wide text-[#dacfb6] hover:bg-white/10"
                >
                  Browse resume
                </button>
              </li>
              <li>
                <a
                  href={profile.resumeUrl}
                  download
                  className="mt-1 block rounded border border-[#a36f1b] px-3 py-2 text-center text-sm uppercase tracking-wide text-[#f2c750]"
                >
                  Resume PDF
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
