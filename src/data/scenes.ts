import type { InteractionAction } from '../world/Interactable';

// Scene art manifest (hybrid illustration layer). Each scene (home + every job
// island + Hall of Sigils + Academy) can be backed by a static illustration with
// clickable hotspots. When a scene has no `image`, the app falls back to the 3D
// renderer for it — so nothing breaks before Leonardo supplies art.
//
// Hotspot rects are NORMALIZED to the image (top-left origin, 0..1), so they
// track the letterboxed image at any window size. Author them with the in-app
// calibrator (?calibrate). Actions reuse the engine's InteractionAction union,
// plus a few view-level actions handled by the shell.

export type HotspotAction =
  | InteractionAction
  | { type: 'begin' } // leave the illustrated landing, enter the 3D world
  | { type: 'view3d' } // view the current scene in 3D
  | { type: 'resume' }; // open the HTML résumé overlay

export interface Hotspot {
  /** Normalized rect on the image (top-left origin). */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  action: HotspotAction;
}

export interface SceneArt {
  /** Path under /public, e.g. "art/home.png". Undefined → use the 3D renderer. */
  image?: string;
  hotspots: Hotspot[];
}

// Home hotspots pre-authored to the reference composition. If a `home.png` with a
// similar layout is dropped in, these light up immediately; otherwise tune them
// with ?calibrate. Labels map to OUR content (spec §14 decision).
const home: SceneArt = {
  // Drop an original illustration at public/art/home.png to activate the
  // illustrated landing; if the file is absent the app falls back to 3D.
  image: 'art/home.png',
  hotspots: [
    { x: 0.17, y: 0.275, w: 0.14, h: 0.07, label: 'Experience', action: { type: 'openmap' } },
    { x: 0.66, y: 0.275, w: 0.14, h: 0.07, label: 'Certifications', action: { type: 'travel', to: 'sigils' } },
    { x: 0.165, y: 0.545, w: 0.15, h: 0.075, label: 'Skills', action: { type: 'skills' } },
    { x: 0.655, y: 0.545, w: 0.15, h: 0.075, label: 'About', action: { type: 'summary' } },
    { x: 0.215, y: 0.715, w: 0.15, h: 0.075, label: 'Contact', action: { type: 'contact' } },
    { x: 0.43, y: 0.64, w: 0.14, h: 0.18, label: 'Begin the quest', action: { type: 'begin' } },
  ],
};

export const scenes: Record<string, SceneArt> = {
  home,
  // Job islands, sigils, academy: add { image: 'art/<id>.png', hotspots: [...] }
  // once art exists. Absent entries fall back to the 3D renderer.
};

export function sceneArt(id: string): SceneArt {
  return scenes[id] ?? { hotspots: [] };
}

export function hasArt(id: string): boolean {
  return !!scenes[id]?.image;
}
