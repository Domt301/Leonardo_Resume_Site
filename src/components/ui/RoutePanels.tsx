import { AnimatePresence } from 'framer-motion';
import { useRoutePanel } from '../../hooks/useRoutePanel';
import { SECTION_LABELS } from '../../app/routeMap';
import { projectById } from '../../content/projects';
import PanelShell from './PanelShell';
import ExperiencePanel from '../resume/ExperiencePanel';
import SkillsPanel from '../resume/SkillsPanel';
import ProjectsPanel from '../resume/ProjectsPanel';
import ProjectDetailPanel from '../resume/ProjectDetailPanel';
import CertificationsPanel from '../resume/CertificationsPanel';
import AboutPanel from '../resume/AboutPanel';
import ContactPanel from '../resume/ContactPanel';

/** Renders the panel matching the current route (spec §18). */
export default function RoutePanels() {
  const { activeSection, activeProjectId, notFound, openProject, closePanel } = useRoutePanel();

  let panel: React.ReactNode = null;

  if (notFound) {
    panel = (
      <PanelShell key="404" title="Lost at sea" onClose={closePanel}>
        <p className="text-sm text-[#d7cfbd]">
          This page doesn&apos;t exist. The tide must have taken it.
        </p>
        <button
          onClick={closePanel}
          className="mt-4 rounded border border-[#a36f1b] px-3 py-1 text-sm text-[#f2c750] hover:bg-[#a36f1b]/20"
        >
          Return to the island
        </button>
      </PanelShell>
    );
  } else if (activeProjectId) {
    const project = projectById(activeProjectId);
    panel = (
      <PanelShell
        key={`project-${activeProjectId}`}
        title={project ? project.name : 'Project not found'}
        onClose={closePanel}
      >
        {project ? (
          <ProjectDetailPanel project={project} />
        ) : (
          <p className="text-sm text-[#d7cfbd]">No project with that id. Try the Projects panel.</p>
        )}
      </PanelShell>
    );
  } else if (activeSection) {
    panel = (
      <PanelShell key={activeSection} title={SECTION_LABELS[activeSection]} onClose={closePanel}>
        {activeSection === 'experience' && <ExperiencePanel />}
        {activeSection === 'skills' && <SkillsPanel />}
        {activeSection === 'projects' && <ProjectsPanel onOpenProject={openProject} />}
        {activeSection === 'certifications' && <CertificationsPanel />}
        {activeSection === 'about' && <AboutPanel />}
        {activeSection === 'contact' && <ContactPanel />}
      </PanelShell>
    );
  }

  return <AnimatePresence>{panel}</AnimatePresence>;
}
