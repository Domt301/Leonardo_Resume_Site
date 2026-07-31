import { useGameStore } from '../store/useGameStore';
import { jobById } from '../data/jobs';
import type { InteractionAction } from '../world/Interactable';

// Shared action dispatcher (spec: one source of truth for what an interaction
// does). Store effects — opening panels, earning Marks, claiming sigils — run
// the same whether the trigger is a 3D interactable or a 2D illustration
// hotspot. Engine-only side effects (audio, the claim animation, entering
// interiors, fast travel) are provided as optional hooks so the illustration
// layer can dispatch without a running engine.

export interface ActionHooks {
  travel?: (islandId: string) => void;
  enter?: (interior: string, islandName: string) => void;
  npc?: () => void;
  bullet?: (jobId: string, index: number) => void;
  exit?: () => void;
  /** Player claim animation. */
  claim?: () => void;
  sound?: (kind: 'panel' | 'interact' | 'mark' | 'sigil') => void;
}

/** Default bullet opener when there is no interior (illustration layer). */
function openBulletPanel(jobId: string, index: number): void {
  const job = jobById(jobId);
  const b = job?.bullets[index];
  if (!job || !b) return;
  useGameStore.getState().openPanel({ kind: 'dialogue', npc: job.company, lines: [b.text], index: 0 });
}

export function runAction(a: InteractionAction, h: ActionHooks = {}): void {
  const s = useGameStore.getState();
  switch (a.type) {
    case 'sign':
      s.markSignRead(a.jobId);
      s.openPanel({ kind: 'sign', jobId: a.jobId });
      h.sound?.('panel');
      break;
    case 'summary':
      s.openPanel({ kind: 'summary' });
      h.sound?.('panel');
      break;
    case 'skills':
      s.openPanel({ kind: 'skills' });
      h.sound?.('panel');
      break;
    case 'contact':
      s.openPanel({ kind: 'contact' });
      h.sound?.('panel');
      break;
    case 'openmap':
      s.setPhase('map');
      h.sound?.('interact');
      break;
    case 'travel':
      h.sound?.('interact');
      h.travel?.(a.to);
      break;
    case 'enter':
      h.sound?.('interact');
      h.enter?.(a.interior, a.islandName);
      break;
    case 'npc':
      if (h.npc) h.npc();
      h.sound?.('panel');
      break;
    case 'bullet':
      (h.bullet ?? openBulletPanel)(a.jobId, a.index);
      h.sound?.('panel');
      break;
    case 'chest':
      s.earnMark(a.jobId);
      h.claim?.();
      s.openPanel({ kind: 'mark', jobId: a.jobId });
      h.sound?.('mark');
      break;
    case 'sigil':
      s.claimSigil(a.certId);
      h.claim?.();
      s.openPanel({ kind: 'cert', certId: a.certId });
      h.sound?.('sigil');
      break;
    case 'education':
      s.claimCredential(a.eduId);
      s.openPanel({ kind: 'education', eduId: a.eduId });
      h.sound?.('panel');
      break;
    case 'exit':
      h.sound?.('interact');
      h.exit?.();
      break;
    case 'bridge':
      h.travel?.(a.to);
      break;
  }
}
