# Leonardo Wildt — Interactive Resume World

A playable resume: one stylized low-poly **floating island** rendered with
**React Three Fiber**. Walk a character between themed landmarks — Experience
Ridge, Skills Grove, Projects Workshop, About Overlook, Certifications Shrine,
Contact Dock — and open resume sections through in-world interactions. Built
from `spec.md`.

Everything is generated procedurally in code — **no 3D model files, no image
assets** beyond the resume PDF and an optional pixel font.

## The resume always survives the game

100% of the content is reachable without playing:

- Every section is in the **persistent top nav** and opens the same accessible
  HTML panel as the in-world interaction.
- **Browse resume** opens a clean, printable HTML resume
  (`src/components/resume/ResumeDocument.tsx`).
- If **WebGL is unavailable** or the viewport is under 320px, that HTML resume
  **is** the page (`src/app/App.tsx` capability gate).
- All content lives in typed files (`src/content/*`) consumed by **both** the
  world and the HTML views — one source of truth.

## Routes

`/` `/experience` `/skills` `/projects` `/projects/:projectId`
`/certifications` `/about` `/contact` — deep-linkable; opening a panel pushes
history so the browser back button closes it. SPA fallback is configured in
`vercel.json`.

## Controls

- **WASD / arrows** move · **E / Enter** interact · **Esc** close
- **M** audio toggle · **H / ?** help
- Touch: virtual joystick (bottom-left) + interact button (bottom-right)

## Architecture

```
src/
  app/         App (capability gate, deep-link spawn), routes, routeMap
  components/  layout (shell, header, footer, nav) · ui (panels, HUD, help,
               loading) · resume (section panels + ResumeDocument)
  game/        GameCanvas (R3F), World, Player, CameraRig, Lighting
    art/       color ramps + procedural CanvasTextures (nearest-filter)
    controls/  keyboard, touch joystick, shared input singleton
    systems/   pure 2D XZ collision, region heights, interaction selection
    world/     layout.ts (single source of truth), Island terrain, props
    effects/   water, waterfalls
  content/     profile, experience, skills, projects, certifications, education
  state/       zustand stores: game / ui / settings (persisted)
```

Per-frame state (position, velocity) lives in refs and a shared
`playerRuntime` object — never in React state. Collision is custom 2D circle /
AABB resolution on the XZ plane (`src/game/systems/collisionSystem.ts`), unit
tested with Vitest.

## Commands

```
npm run dev         # local dev server
npm run build       # typecheck + production build
npm run typecheck
npm run test        # vitest (collision, interaction, route mapping)
```

## Accessibility

Skip link, focus-trapped dialogs with focus restore, `aria-current` nav,
keyboard-complete navigation, reduced-motion mode (auto-detected, toggleable),
quality presets (low/medium/high), print stylesheet, and the no-WebGL fallback.
