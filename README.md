# Resume Quest v2 — Leonardo Wildt

An interactive résumé rendered as a **floating archipelago**: a low-poly 3D world
viewed through an orthographic **isometric camera** with a **pixelation
post-process**. Each island is a job; enterable buildings hold the detail; a Hall
of Sigils and an Academy branch off the home island. Built from the
`resume-quest-v2` isometric build spec.

Everything is generated procedurally in code — **no 3D model files, no image
assets** beyond the résumé PDF and an optional pixel font. Audio is synthesised in
WebAudio at runtime. minor

## The résumé always survives the game

Per the non-negotiable in the spec, 100% of the content is reachable without
playing:

- **"Skip the quest — read the résumé"** on the title screen and pause menu opens
  a clean, accessible, printable HTML résumé (`src/ui/ResumeOverlay.tsx`).
- If **WebGL is unavailable** or the viewport is under 320px, that HTML résumé
  **is** the page (`src/App.tsx` capability gate).
- All content lives in typed data files (`src/data/*`) consumed by **both** the
  game and the HTML overlay — one source of truth.
- The PDF downloads from the overlay and the pause menu.

## Two ways each scene can render (hybrid illustration layer)

The real-time 3D world has a quality ceiling below a hand-painted illustration.
So every scene (the home/landing + each job island + Hall of Sigils + Academy)
can optionally be backed by a **static illustration with clickable hotspots** —
giving a pixel-perfect, reference-grade look on the screens that matter — while
the 3D world remains for exploration behind "Begin the quest / Explore in 3D".

- Drop an original illustration at **`public/art/<scene>.png`** and set its
  `image` path in `src/data/scenes.ts`. If a scene has no image, it simply uses
  the 3D renderer (graceful fallback — nothing breaks before art exists).
- **Author hotspots visually:** open the app with **`?calibrate`** in the URL,
  drag a box over each interactive element, and copy the printed `{x,y,w,h}` into
  that scene's `hotspots` in `src/data/scenes.ts`. Hotspot actions reuse the same
  `InteractionAction`s the 3D world uses (open a panel, fast-travel, open the map,
  claim a Mark/sigil), so both renderers behave identically.
- `home` hotspots are pre-authored to the reference layout (EXPERIENCE →
  archipelago map, CERTIFICATIONS → Hall of Sigils, SKILLS, ABOUT, CONTACT, and a
  Begin-the-quest area). See `public/art/README.txt` for filenames + the
  originality guardrail (original art only — Leonardo, never Link/Nintendo).

## Tech

Vite · React 18 + TypeScript (strict) · three.js (plain, no react-three-fiber) ·
Zustand · Tailwind. The fixed-timestep engine loop is fully decoupled from React:
React owns the DOM UI, the engine owns the canvas, and the single Zustand store is
an imperative event-bus bridge between them.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build → dist/
npm run preview    # serve the production build
```

Deploy `dist/` to any static host. The build uses relative asset paths, so it
works from any subpath.

**Vercel** (configured): `vercel.json` sets framework `vite`, build
`npm run build`, output `dist/`, and long-cache headers on hashed assets. Import
the repo in Vercel (or `vercel` / `vercel --prod` from the CLI) — no extra
settings needed. Deep links use hash routes (`/#/aws`), so no SPA rewrites are
required.

### Deep links (spec §15)

`#/aws`, `#/travelers`, `#/cox`, `#/rentready`, `#/ncourt`, `#/atlantic`,
`#/ruralmetro`, `#/merrill`, `#/sigils`, `#/academy`, `#/resume`. A hash skips the
title screen and spawns at that island (or opens the résumé).

## Controls

`WASD` / arrows move (camera-relative) · drag or `Q`/`R` rotate 90° · wheel zoom ·
`E` / click select · `M` map & fast travel · `Esc` pause · `?` controls. Touch:
virtual stick + A button.

## Before launch — action items

- **⚠️ Unverified bullets.** Bullets flagged `unverified: true` in
  `src/data/jobs.ts` and `src/data/education.ts` are inferred elaborations
  (`⚠️ ADDED` in the spec). They render with an "(added)" marker in the HTML
  résumé. **Approve or delete each before launch.** No metrics, dollar figures,
  percentages, team sizes, or client names were invented.
- **Pixel font.** The HUD falls back to a system monospace. To ship the intended
  look, drop an open-licensed pixel font (e.g. Departure Mono, SIL OFL) at
  `public/fonts/DepartureMono-Regular.woff2` — the `@font-face` in
  `src/index.css` already points there.
- **Résumé PDF.** `public/LeonardoWildt-Resume.pdf` is the download target;
  replace it any time with an updated file at the same path.

## Project structure

```
src/
  engine/    Engine (loop), Renderer (3 post passes), IsoCamera, Input, Picker, Audio
  world/     Archipelago (streaming), Island, Terrain, Water, Bridge, Interior, Interactable
  props/     procedural prop registry (static parts + dynamic/animated props)
  character/ Player (16-box rig, procedural animation), Npc
  art/       palette (RAMP), toon materials, geometry helpers
  data/      profile, jobs, certs, education, skills, islands  ← single source of truth
  ui/        TitleScreen, Hud, Panels, MapScreen, PauseMenu, ControlsCard,
             TouchControls, ResumeOverlay, GameApp (React↔engine mount)
  store/     useGameStore (Zustand)
```

## Notes on the look

The three things that make the style: the **grass lip** overhanging every cliff
edge, **hard shadows** (`BasicShadowMap`), and a **colour-preserving outline**
(the Sobel edge multiplies toward each object's own dark tone, never pure black).
The pixel size (3/4/6) and iso angle (30° / 26.565°) are adjustable in the
controls panel.
