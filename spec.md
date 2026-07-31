# Interactive Resume World — Product & Technical Specification

## 1. Overview

### 1.1 Product name

**Leonardo Wildt — Interactive Resume World**

### 1.2 Summary

Build a playable, navigable personal resume website using **React**, **React Three Fiber**, and **Three.js**.

The experience presents the resume as a small stylized 3D island diorama. Visitors control a character, walk between themed locations, interact with signs and structures, and open resume content through in-world interactions.

The visual direction is:

- Retro adventure-game inspired
- Low-poly 3D geometry
- Pixel-art textures and UI
- Isometric or elevated third-person camera
- Warm fantasy-world presentation
- Original visual identity rather than a direct imitation of any existing game

The site must remain usable as a professional resume, not merely as a visual experiment. Every major piece of resume content must be reachable through keyboard, pointer, touch, and a conventional fallback navigation interface.

---

## 2. Product goals

### 2.1 Primary goals

1. Create a memorable interactive resume experience.
2. Let users explore resume content through movement and discovery.
3. Maintain fast load times and smooth performance on modern desktop and mobile devices.
4. Preserve professional readability and accessibility.
5. Make the content easy to update without editing gameplay code.
6. Support direct links to sections such as `/experience`, `/projects`, and `/contact`.
7. Allow the site to degrade gracefully when WebGL is unavailable or reduced motion is preferred.

### 2.2 Secondary goals

- Support gamepad controls.
- Add optional ambient audio and sound effects.
- Add lightweight achievements or discoveries.
- Make the world reusable as a portfolio framework.
- Support analytics for section visits and interaction events.
- Keep the architecture simple enough to maintain.

### 2.3 Non-goals

The first release will not include:

- Combat
- Enemies
- Complex inventory systems
- Procedural world generation
- Multiplayer
- Physics-heavy gameplay
- Full cinematic cutscenes
- A large open world
- Backend account systems
- User-generated content

---

## 3. Target users

### 3.1 Recruiters and hiring managers

Need:

- Immediate understanding of the owner’s role and value
- Fast access to experience, projects, certifications, and contact information
- A conventional navigation path if they do not want to play

### 3.2 Engineers and technical leaders

Need:

- Evidence of architecture experience
- Project details
- Technology stack
- Links to GitHub, LinkedIn, and demos
- A polished implementation that demonstrates technical judgment

### 3.3 Casual visitors

Need:

- Clear controls
- A short learning curve
- A rewarding and visually interesting experience
- No forced tutorial longer than a few seconds

---

## 4. Experience concept

The visitor arrives on a floating low-poly island.

A player character stands at the central arrival path facing a large identity board:

> LEONARDO WILDT  
> ENGINEER. LEADER. BUILDER.

The island is divided into themed resume locations:

- **Experience Ridge**
- **Skills Grove**
- **Projects Workshop**
- **About Overlook**
- **Contact Dock**
- **Certifications Shrine**
- Optional hidden **Current Quest** area

The player moves through the world and approaches a location. When within interaction range, the location receives a visual highlight and an interaction prompt appears:

> Press E to view Projects

Selecting the location opens a readable content panel layered over the 3D world. The world may pause or continue subtly in the background.

---

## 5. Visual direction

## 5.1 Art style

Use an original retro low-poly fantasy style.

Key properties:

- Chunky geometry
- Hand-painted or pixelated textures
- Limited texture resolution
- Soft directional lighting
- Strong silhouettes
- Slightly exaggerated proportions
- Minimal realism
- Clean, readable environment composition

Avoid direct copies of:

- Existing characters
- Existing logos
- Existing UI frames
- Existing map layouts
- Existing iconography
- Existing item designs

### 5.2 Color palette

Suggested palette:

- Grass: moss green, olive, forest green
- Stone: warm gray, brown-gray
- Water: dark blue with lighter foam
- Wood: amber, walnut, dark oak
- UI background: navy-black
- UI border: warm gold
- Text: parchment, cream, muted gold
- Accent: emerald, cobalt, crimson

All colors should be stored as reusable theme tokens.

### 5.3 Camera

Default camera:

- Perspective camera
- Elevated third-person angle
- Approximately 35–50 degree downward pitch
- Slight isometric feel without a strict orthographic projection
- Camera follows the player with smooth damping
- Camera yaw may be fixed in the first release
- Optional mouse drag or right-stick look mode

Recommended initial values:

```ts
fov: 35
near: 0.1
far: 100
cameraOffset: [0, 7, 9]
lookAtOffset: [0, 0.8, 0]
```

### 5.4 World scale

Use a small world to preserve focus and performance.

Recommended dimensions:

```txt
Island width: 26–34 world units
Island depth: 20–28 world units
Player height: 1.6–1.9 units
Primary structure height: 2–4 units
Interaction radius: 1.75–2.5 units
```

---

## 6. Core user flow

### 6.1 First visit

1. Site loads.
2. A lightweight loading screen appears.
3. The 3D island fades in.
4. The player is visible in the center.
5. A small control hint appears:
   - WASD or arrows to move
   - E or Enter to interact
   - Mouse or drag to look, if enabled
6. The visitor can move immediately.
7. The nearest landmark is the identity board.
8. The visitor explores locations and opens resume sections.
9. The visitor may use the persistent top-level menu at any time.
10. Contact links are available in-world and in the standard footer.

### 6.2 Returning visit

- Skip the extended control hint.
- Restore audio preference.
- Restore quality preference.
- Optionally restore the last visited section.
- Do not restore the player position unless intentionally enabled.

### 6.3 Direct-link visit

Example:

```txt
/experience
/projects/ai-platform
/contact
```

Behavior:

1. Load the world.
2. Place the player near the corresponding location or keep the default spawn.
3. Open the requested content panel.
4. Update browser history correctly when closing the panel.

---

## 7. Information architecture

## 7.1 Primary sections

### Home

Contains:

- Name
- Positioning statement
- Short professional summary
- Location
- Social links
- Current professional focus

### Experience

Contains a chronological list of roles.

Each role includes:

- Company
- Title
- Dates
- Location
- Summary
- Impact bullets
- Technologies
- Leadership scope
- Optional media
- Optional external link

### Skills

Grouped by domain:

- AI and machine learning
- Cloud and infrastructure
- Backend engineering
- Frontend engineering
- Platform engineering
- Architecture
- Leadership
- Delivery
- Security
- Certifications

### Projects

Each project includes:

- Name
- Short description
- Problem
- Solution
- Architecture
- Technical stack
- Role
- Outcomes
- Screenshots or diagrams
- Demo link
- Repository link
- Status

### Certifications

Each certification includes:

- Name
- Issuer
- Date
- Expiration date, if relevant
- Credential URL
- Badge image
- Category

### About

Contains:

- Professional narrative
- Leadership philosophy
- Engineering principles
- Career arc
- Personal interests, optionally
- Downloadable resume

### Contact

Contains:

- Email
- LinkedIn
- GitHub
- Location
- Contact form, optional
- Resume download
- Call-to-action

---

## 8. World map

## 8.1 Island layout

The island should be arranged around a central hub.

Suggested layout:

```txt
                [Identity Board]
        [Experience]       [Projects]

             [Central Spawn]

        [Skills]             [About]

      [Certifications]      [Contact Dock]
```

### 8.2 Location concepts

#### Experience Ridge

Visuals:

- Stone path
- Archway or cave entrance
- Timeline markers
- Flag or crest
- Elevated terrain

Interaction:

- Opens experience panel
- Optional timeline animation inside the environment

#### Skills Grove

Visuals:

- Trees
- Training posts
- Rune stones
- Tool icons
- Small fenced clearing

Interaction:

- Opens grouped skills panel
- Nearby objects can represent categories

#### Projects Workshop

Visuals:

- Small workshop or house
- Crates
- Workbench
- Mechanical props
- Glowing device or terminal

Interaction:

- Opens project browser
- Project cards may appear as floating blueprint panels

#### About Overlook

Visuals:

- Pond
- Waterfall
- Bench or lookout
- Scroll or journal pedestal

Interaction:

- Opens narrative about section

#### Certifications Shrine

Visuals:

- Stone pedestal
- Floating badges or crystals
- Monument wall
- Soft emissive glow

Interaction:

- Opens certification grid

#### Contact Dock

Visuals:

- Bridge or dock
- Mailbox
- Signal beacon
- Boat or portal

Interaction:

- Opens contact panel
- External contact links remain standard HTML anchors

---

## 9. Gameplay

## 9.1 Character movement

Movement must be responsive and simple.

Supported controls:

### Keyboard

```txt
W / Arrow Up       Move forward
S / Arrow Down     Move backward
A / Arrow Left     Move left
D / Arrow Right    Move right
E / Enter          Interact
Escape             Close panel
M                   Toggle audio
H                   Show help
```

### Pointer

- Click-to-move is optional.
- Pointer may select visible landmarks.
- UI buttons must remain fully clickable.
- Dragging may rotate the camera if camera rotation is enabled.

### Touch

Use a virtual joystick and interaction button.

Recommended mobile controls:

- Left-bottom joystick
- Right-bottom interact button
- Optional swipe to rotate camera
- Tap landmark to move or open

### Gamepad

Recommended mapping:

```txt
Left stick         Move
A / Cross          Interact
B / Circle         Close
Start              Pause or help
Right stick        Camera, optional
```

## 9.2 Movement model

Recommended implementation:

- Kinematic character controller
- Acceleration and deceleration
- No jumping in version 1
- No gravity-driven platforming
- Character rotates toward movement direction
- Collision constrained to walkable surfaces
- Use simple capsule or cylinder collision

Suggested values:

```ts
walkSpeed: 3.2
acceleration: 18
deceleration: 22
rotationSpeed: 12
interactionRadius: 2.2
```

## 9.3 Collision

Use simple collision geometry rather than mesh-level collision.

Colliders:

- Island boundary
- Cliffs
- Water
- Buildings
- Fences
- Trees
- Signposts
- Decorative obstacles only when necessary

Recommended approaches:

### Preferred for version 1

Use custom 2D collision on the XZ plane:

- Player represented as a circle
- Obstacles represented as circles or axis-aligned boxes
- Terrain is largely flat
- Height changes handled through ramps or region-based Y values

Advantages:

- Easy to debug
- Minimal dependencies
- Predictable
- Fast

### Alternative

Use `@react-three/rapier`.

Use only if the design includes:

- More complex slopes
- Moving objects
- Physical interactions
- Dynamic props

Avoid introducing physics solely for movement if simple collision is sufficient.

## 9.4 Interaction system

Each interactive landmark implements:

```ts
interface WorldInteractable {
  id: string;
  label: string;
  position: [number, number, number];
  interactionRadius: number;
  route: string;
  prompt: string;
  priority?: number;
  disabled?: boolean;
}
```

Interaction logic:

1. Compute player distance to all enabled interactables.
2. Filter by interaction radius.
3. Select the nearest interactable.
4. Display its prompt.
5. Highlight it.
6. On interaction input, open the corresponding section.
7. Track analytics event.

Example prompt:

```txt
E  View Projects
```

## 9.5 Highlights

Nearby interactables may use:

- Subtle outline
- Emissive material increase
- Floating icon
- Animated arrow
- Gentle scale pulse
- Ground ring

Avoid flashing or excessive motion.

## 9.6 Content panels

When a section opens:

- Display an HTML panel over the Canvas.
- Keep text in the DOM for accessibility and SEO.
- Dim or blur the 3D world.
- Pause character movement.
- Preserve ambient animation.
- Trap focus inside the panel.
- Close with Escape, close button, or back action.
- Update URL.

Content should not be rendered as texture-only text inside the 3D scene.

---

## 10. UI specification

## 10.1 HUD

Desktop HUD elements:

- Name or logo
- Optional health-style decorative indicator
- Help icon
- Audio toggle
- Fullscreen toggle
- Current location
- Interaction prompt
- Conventional section menu

Decorative health indicators should not imply gameplay consequences unless they serve a real function.

Recommended practical interpretation:

- Three heart icons represent three portfolio themes:
  - Engineering
  - Leadership
  - Delivery

Alternative: omit hearts entirely to avoid looking derivative.

## 10.2 Persistent navigation

Provide a standard HTML nav outside the Canvas.

Example:

```txt
Home
Experience
Skills
Projects
Certifications
About
Contact
Resume PDF
```

Behavior:

- Visible on desktop
- Collapsible on mobile
- Keyboard accessible
- Directly updates route
- Opens the same section panels as world interactions

## 10.3 Interaction prompt

Position:

- Bottom center or above the nearest object

Contents:

```txt
[E] View Experience
```

Touch equivalent:

```txt
Tap to view Experience
```

## 10.4 Content panel

Desktop:

- Maximum width: 900–1100 px
- Maximum height: 80–85 vh
- Internal scroll
- Parchment or dark navy styling
- Strong typography hierarchy
- Clear close button

Mobile:

- Full-screen sheet
- Sticky close/header
- Large touch targets
- Reduced decorative framing

## 10.5 Loading screen

Display:

- Name
- Short subtitle
- Loading progress
- Small original pixel-art icon
- Optional rotating tip

Do not block longer than necessary.

## 10.6 Help overlay

Include:

- Controls
- Navigation explanation
- Accessibility note
- Audio control
- Quality control
- Resume shortcut

---

## 11. Technical stack

## 11.1 Core stack

```txt
React
TypeScript
Vite or Next.js
Three.js
@react-three/fiber
@react-three/drei
React Router or Next.js App Router
Zustand
Framer Motion
```

Recommended choice:

- **Vite + React Router** for a purely client-side portfolio
- **Next.js** if server-rendered metadata, static generation, and richer SEO routing are priorities

For the first implementation, use:

```txt
Vite
React
TypeScript
React Router
React Three Fiber
Drei
Zustand
Framer Motion
```

## 11.2 Optional dependencies

```txt
@react-three/postprocessing
howler
zod
leva
react-use
@react-three/rapier
```

Use sparingly.

## 11.3 Why React Three Fiber

React Three Fiber provides:

- Declarative scene composition
- React lifecycle integration
- Component reuse
- Suspense-based asset loading
- Easy overlay coordination
- Strong ecosystem
- Easier state integration than imperative Three.js alone

---

## 12. Repository structure

```txt
src/
  app/
    App.tsx
    routes.tsx
    providers.tsx

  assets/
    models/
    textures/
    audio/
    fonts/
    icons/

  components/
    layout/
      SiteShell.tsx
      Header.tsx
      Footer.tsx
      MobileNav.tsx

    ui/
      Button.tsx
      Panel.tsx
      Dialog.tsx
      Tooltip.tsx
      LoadingScreen.tsx
      InteractionPrompt.tsx
      HelpOverlay.tsx
      QualityMenu.tsx

    resume/
      ExperiencePanel.tsx
      SkillsPanel.tsx
      ProjectsPanel.tsx
      CertificationsPanel.tsx
      AboutPanel.tsx
      ContactPanel.tsx

  game/
    GameCanvas.tsx
    World.tsx
    Player.tsx
    CameraRig.tsx
    Lighting.tsx
    Environment.tsx

    controls/
      useKeyboardControls.ts
      useGamepadControls.ts
      TouchControls.tsx
      inputMap.ts

    systems/
      movementSystem.ts
      collisionSystem.ts
      interactionSystem.ts
      audioSystem.ts
      analyticsSystem.ts

    world/
      Island.tsx
      ExperienceArea.tsx
      SkillsArea.tsx
      ProjectsArea.tsx
      CertificationsArea.tsx
      AboutArea.tsx
      ContactArea.tsx
      IdentityBoard.tsx
      interactables.ts
      collisionMap.ts

    effects/
      Water.tsx
      Waterfall.tsx
      Particles.tsx
      OutlineEffect.tsx

  content/
    profile.ts
    experience.ts
    skills.ts
    projects.ts
    certifications.ts
    about.ts
    contact.ts

  hooks/
    useMediaQuery.ts
    useReducedMotion.ts
    useQualityPreset.ts
    useRoutePanel.ts

  state/
    useGameStore.ts
    useUIStore.ts
    useSettingsStore.ts

  styles/
    globals.css
    theme.css
    pixel-ui.css

  types/
    resume.ts
    game.ts
```

---

## 13. React architecture

## 13.1 Top-level layout

```tsx
function App() {
  return (
    <AppProviders>
      <SiteShell>
        <AccessibleNavigation />
        <GameCanvas />
        <HUD />
        <RouteDrivenPanel />
        <TouchControls />
      </SiteShell>
    </AppProviders>
  );
}
```

## 13.2 Canvas

```tsx
function GameCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 35, near: 0.1, far: 100 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <World />
        <Player />
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
```

Important:

- Use low DPR on mobile.
- Disable antialiasing if pixelated output is desired.
- Consider rendering at a lower internal resolution and scaling with CSS.
- Use `frameloop="demand"` only if the scene is mostly static. A playable world generally needs `always`.

## 13.3 State boundaries

Use Zustand stores separated by concern.

### Game store

```ts
interface GameState {
  playerPosition: Vector3Tuple;
  playerRotation: number;
  movementEnabled: boolean;
  activeInteractableId: string | null;
  currentZoneId: string | null;
}
```

### UI store

```ts
interface UIState {
  activePanel: ResumeSection | null;
  helpOpen: boolean;
  mobileNavOpen: boolean;
  loading: boolean;
}
```

### Settings store

```ts
interface SettingsState {
  audioEnabled: boolean;
  masterVolume: number;
  reducedMotion: boolean;
  quality: "low" | "medium" | "high";
}
```

Avoid storing rapidly changing Three.js vectors in global React state every frame. Keep frame-level movement state in refs and synchronize only meaningful state changes.

---

## 14. Data model

## 14.1 Resume content

```ts
export interface Profile {
  name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
}
```

```ts
export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  summary: string;
  achievements: string[];
  technologies: string[];
  leadershipScope?: string[];
}
```

```ts
export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  architecture?: string[];
  technologies: string[];
  outcomes: string[];
  image?: string;
  demoUrl?: string;
  repositoryUrl?: string;
  featured?: boolean;
}
```

```ts
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiresDate?: string;
  credentialUrl?: string;
  badgeImage?: string;
}
```

## 14.2 Zone model

```ts
export interface WorldZone {
  id: string;
  label: string;
  route: string;
  center: [number, number, number];
  radius: number;
  ambientLabel?: string;
}
```

## 14.3 Collision model

```ts
export type CollisionShape =
  | {
      type: "circle";
      center: [number, number];
      radius: number;
    }
  | {
      type: "box";
      center: [number, number];
      halfExtents: [number, number];
    };
```

---

## 15. Player implementation

## 15.1 Character model

Recommended options:

### Option A: Original GLB character

- Create in Blender
- Low-poly
- 1,000–5,000 triangles
- Idle and walk animations
- Original clothing and silhouette
- Export as GLB

### Option B: Procedural primitive character

- Capsule body
- Sphere head
- Box limbs
- Simple original adventurer look
- No external modeling dependency
- Good for prototype

The production version should use Option A.

## 15.2 Animation

Required clips:

- Idle
- Walk
- Interact or inspect, optional

Blend behavior:

- Idle when velocity is near zero
- Walk when moving
- Crossfade over 0.1–0.2 seconds

## 15.3 Movement pseudocode

```ts
useFrame((_, delta) => {
  if (!movementEnabled) return;

  const input = getMovementInput();
  const desired = normalize(input);

  velocity.lerp(
    desired.multiplyScalar(walkSpeed),
    1 - Math.exp(-acceleration * delta)
  );

  const proposedPosition = currentPosition
    .clone()
    .addScaledVector(velocity, delta);

  const resolvedPosition = resolveCollisions(
    currentPosition,
    proposedPosition,
    playerRadius,
    collisionShapes
  );

  player.position.copy(resolvedPosition);

  if (velocity.lengthSq() > 0.001) {
    const targetRotation = Math.atan2(velocity.x, velocity.z);
    player.rotation.y = dampAngle(
      player.rotation.y,
      targetRotation,
      rotationSpeed,
      delta
    );
  }
});
```

---

## 16. Camera system

## 16.1 Follow camera

The camera should follow without causing motion sickness.

Implementation:

- Maintain a desired camera position relative to player
- Smoothly damp position
- Smoothly damp look-at target
- Avoid sharp rotation
- Keep fixed world orientation in version 1

Pseudocode:

```ts
useFrame((state, delta) => {
  const targetPosition = player.position
    .clone()
    .add(cameraOffset);

  state.camera.position.lerp(
    targetPosition,
    1 - Math.exp(-cameraDamping * delta)
  );

  lookTarget.lerp(
    player.position.clone().add(lookAtOffset),
    1 - Math.exp(-lookDamping * delta)
  );

  state.camera.lookAt(lookTarget);
});
```

## 16.2 Camera constraints

- Do not allow the camera below terrain.
- Do not allow extreme zoom.
- Prevent structures from fully occluding the player.
- Use fade-out or hide behavior for foreground props if necessary.

## 16.3 Optional camera rotation

If added:

- Limit yaw to a narrow range or 90-degree steps.
- Preserve landmark readability.
- Provide a reset-camera action.
- Disable free rotation on small mobile screens unless tested.

---

## 17. World construction

## 17.1 Asset strategy

Use a mix of:

- Reusable modular GLB assets
- Primitive geometry
- Instanced meshes
- Low-resolution textures
- Baked lighting where practical

Suggested modular kit:

- Grass tiles
- Dirt path tiles
- Cliff sections
- Stone steps
- Wood fence segments
- Pine trees
- Rocks
- Flowers
- House modules
- Signs
- Water plane
- Waterfall plane
- Bridge sections

## 17.2 Geometry

Target budgets:

```txt
Entire visible scene: 100k–250k triangles
Player: 1k–5k triangles
Large structure: 2k–12k triangles
Tree: 100–800 triangles
Rock: 50–500 triangles
```

## 17.3 Textures

Recommended:

- 32×32
- 64×64
- 128×128
- 256×256 maximum for most assets
- Nearest-neighbor filtering
- Texture atlases where useful
- Avoid unnecessary transparent textures

Texture configuration:

```ts
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestMipMapNearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
```

## 17.4 Lighting

Use:

- One hemisphere light
- One directional key light
- Optional low-intensity fill light
- Baked emissive accents
- Limited real-time shadows

Suggested setup:

```txt
Hemisphere light intensity: 0.8
Directional light intensity: 1.5
Shadow map: 1024 or 2048
Directional shadow bounds tightly constrained
```

Only major assets should cast shadows.

## 17.5 Water

Version 1 water may use:

- Flat plane
- Scrolling normal or noise texture
- Vertex displacement
- Subtle transparency
- Color gradient
- Foam sprites near rocks and waterfalls

Avoid expensive screen-space reflections.

## 17.6 Waterfalls

Use:

- Vertical plane
- Scrolling texture
- Additive or alpha-blended foam
- Small particle emitter at base
- Optional ambient audio source

## 17.7 Environment animation

Subtle animations:

- Trees sway
- Flowers move
- Water scrolls
- Waterfall flows
- Smoke rises
- Sign gently creaks
- Fireflies appear at night, optional

All motion must respect reduced-motion settings.

---

## 18. Routing

Routes:

```txt
/
 /experience
 /skills
 /projects
 /projects/:projectId
 /certifications
 /about
 /contact
```

Rules:

- Opening an in-world location updates the route.
- Loading a route opens its panel.
- Closing a panel returns to `/`.
- Browser back closes the panel.
- Deep links must work on static hosting.
- Configure SPA fallback or use framework routing.

---

## 19. SEO

Because the primary scene is WebGL, all resume content must also exist in semantic HTML.

Requirements:

- Correct page title per route
- Meta description
- Open Graph tags
- Social preview image
- Structured data for Person
- Accessible headings
- Crawlable text
- Sitemap
- Robots file
- Canonical URLs

Example schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Leonardo Wildt",
  "jobTitle": "Engineering Leader",
  "url": "https://example.com",
  "sameAs": [
    "https://www.linkedin.com/...",
    "https://github.com/..."
  ]
}
```

---

## 20. Accessibility

## 20.1 Required standards

Target WCAG 2.2 AA where practical.

Requirements:

- Full keyboard navigation
- Visible focus states
- Semantic HTML panels
- Skip-to-content link
- Screen-reader-friendly labels
- Color contrast
- Large touch targets
- Captions or textual alternatives for audio-relevant content
- No essential information presented only in 3D
- Reduced motion mode
- High-contrast UI mode, optional

## 20.2 Non-WebGL fallback

If WebGL initialization fails:

- Render the standard resume site.
- Display a small message:
  - “Interactive world unavailable on this device.”
- Keep all content accessible.

## 20.3 Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Reduce camera smoothing distance
- Remove pulses
- Disable particles
- Reduce environment animation
- Avoid animated panel transitions
- Disable automatic camera movement

## 20.4 Focus management

When a panel opens:

- Move focus to panel heading.
- Trap focus inside.
- Restore focus to the triggering item when closed.
- Character movement must be disabled while panel focus is active.

---

## 21. Responsive behavior

## 21.1 Desktop

- Full 3D canvas
- Persistent navigation
- Keyboard controls
- Optional mouse camera
- Floating content panels

## 21.2 Tablet

- Simplified HUD
- Touch joystick
- Reduced shadow quality
- Larger interaction prompts

## 21.3 Mobile

- Lower DPR
- Reduced asset density
- No expensive post-processing
- Full-screen content panels
- Virtual joystick
- Tap-to-open landmarks
- Conventional menu prominently available
- Optional static-camera mode

## 21.4 Small-screen alternative mode

Offer a “Browse resume” button that opens a fully conventional mobile resume without requiring gameplay.

---

## 22. Performance requirements

## 22.1 Targets

Desktop:

```txt
60 FPS target
45 FPS acceptable minimum during complex moments
Initial JS under 500 KB compressed where practical
First meaningful content under 2.5 seconds on broadband
```

Mobile:

```txt
30–60 FPS target
30 FPS acceptable floor
Initial world assets under 8–12 MB
```

## 22.2 Optimization strategies

- GLB compression with Draco or Meshopt
- KTX2 compressed textures
- Instanced meshes for repeated props
- Frustum culling
- Level of detail for trees and structures
- Lazy-load section-specific media
- Limit real-time shadows
- Avoid high-resolution transparent textures
- Use memoized geometry and materials
- Avoid React state updates inside every frame
- Pool particles
- Pause nonessential animation when tab is hidden

## 22.3 Quality presets

### Low

- DPR 1
- No post-processing
- No dynamic shadows
- Minimal particles
- Simplified water
- Reduced draw distance

### Medium

- DPR 1–1.5
- One shadow-casting light
- Limited particles
- Standard water

### High

- DPR up to 2
- Better shadows
- Ambient occlusion, optional
- More particles
- Improved water

Automatically choose a starting preset, but allow manual override.

---

## 23. Audio

Audio is optional and muted by default until user interaction.

Sound categories:

- Ambient
- Footsteps
- UI
- Interaction
- Waterfall
- Confirmation

Requirements:

- No autoplay with sound
- Persistent mute preference
- Separate master volume
- Short, original sound effects
- Compressed audio formats
- Audio must not be required for navigation

Recommended library:

```txt
Howler.js
```

---

## 24. Analytics

Track:

- Site loaded
- Interactive mode started
- Section opened
- Landmark interacted with
- Project opened
- Resume downloaded
- Contact link clicked
- External profile clicked
- Quality setting changed
- Fallback mode used
- WebGL failure

Example event:

```ts
analytics.track("resume_section_opened", {
  section: "projects",
  source: "world_interaction"
});
```

Do not collect invasive gameplay telemetry.

---

## 25. Content management

For version 1, store resume content in TypeScript files or JSON.

Example:

```ts
export const projects: Project[] = [
  {
    id: "self-hosted-ai-platform",
    name: "Self-Hosted AI Platform",
    tagline: "A deployable private LLM environment on AWS.",
    description: "...",
    problem: "...",
    solution: "...",
    technologies: [
      "React",
      "AWS CDK",
      "EKS",
      "vLLM",
      "FastAPI",
      "Cognito"
    ],
    outcomes: [
      "Validated practical in-house model hosting",
      "Created reusable infrastructure",
      "Demonstrated secure authenticated access"
    ],
    featured: true
  }
];
```

Future option:

- Headless CMS
- MDX
- Git-based content editing

Do not introduce a CMS in the first version unless nontechnical editing is required.

---

## 26. Security

Requirements:

- Sanitize any remotely loaded content.
- Do not expose private email APIs.
- Use a third-party form service or serverless endpoint for contact form.
- Add rate limiting and spam protection.
- Avoid storing secrets in the client.
- Configure Content Security Policy.
- Open external links with appropriate `rel` attributes.

For contact:

```html
<a
  href="https://external.example"
  target="_blank"
  rel="noopener noreferrer"
>
```

---

## 27. Error handling

### Asset load failure

- Continue with fallback geometry where possible.
- Show a retry option for critical failures.
- Do not leave a blank screen.

### WebGL failure

- Render standard resume.
- Log a nonfatal analytics event.

### Route failure

- Show a styled 404 panel.
- Provide a return-home action.

### Contact form failure

- Preserve user-entered data.
- Show a clear error.
- Provide direct email link.

---

## 28. Testing strategy

## 28.1 Unit tests

Test:

- Collision resolution
- Interaction selection
- Route mapping
- Content validation
- Input mapping
- Settings persistence

Recommended:

```txt
Vitest
React Testing Library
```

## 28.2 Integration tests

Test:

- Open and close panels
- Browser back behavior
- Direct route loading
- Keyboard navigation
- Settings changes
- Fallback mode

## 28.3 End-to-end tests

Recommended:

```txt
Playwright
```

Scenarios:

1. Load home page.
2. Move character to Projects.
3. Open Projects.
4. Open a project.
5. Return to world.
6. Open Contact.
7. Use keyboard-only navigation.
8. Test mobile menu.
9. Test reduced-motion mode.
10. Test WebGL-disabled fallback.

## 28.4 Performance testing

Use:

- Chrome Performance panel
- Lighthouse
- React Profiler
- Spector.js
- WebPageTest
- Mobile device testing

## 28.5 Accessibility testing

Use:

- Axe
- Lighthouse accessibility audit
- Keyboard-only testing
- VoiceOver
- NVDA
- Screen-reader review of all panel content

---

## 29. Build phases

## Phase 1 — Foundation

Deliverables:

- React project
- Routing
- Theme tokens
- Standard resume layout
- Content model
- Base panel system
- Accessibility foundation

Acceptance:

- Resume is fully usable without 3D.

## Phase 2 — World prototype

Deliverables:

- Canvas
- Basic island
- Primitive player
- Movement
- Camera
- Collision
- One interactable

Acceptance:

- Player can walk to a location and open a panel.

## Phase 3 — Complete world

Deliverables:

- All resume locations
- Final island layout
- Water
- Foliage
- Structures
- Zone labels
- Interaction prompts

Acceptance:

- Every section is reachable through world navigation.

## Phase 4 — Art pass

Deliverables:

- Final player model
- Pixel textures
- Original icons
- Lighting
- Shadows
- Animations
- UI framing

Acceptance:

- Visual identity is cohesive and original.

## Phase 5 — Mobile and accessibility

Deliverables:

- Touch controls
- Mobile layout
- Reduced-motion mode
- Keyboard audit
- Screen-reader audit
- WebGL fallback

Acceptance:

- Core content is accessible on mobile and keyboard-only.

## Phase 6 — Performance and polish

Deliverables:

- Compressed assets
- Quality presets
- Audio
- Analytics
- Loading improvements
- Error states

Acceptance:

- Meets performance targets on representative devices.

## Phase 7 — Launch

Deliverables:

- Production deployment
- Custom domain
- Metadata
- Sitemap
- Monitoring
- Final content review

---

## 30. Acceptance criteria

The project is complete when:

1. The site loads into a playable 3D island.
2. The player can move using keyboard and touch.
3. The camera follows smoothly.
4. The player cannot leave the walkable island.
5. Each resume section has an in-world landmark.
6. Nearby landmarks display a clear interaction prompt.
7. Interactions open accessible HTML panels.
8. Every panel is reachable through standard navigation.
9. Routes support deep linking.
10. The browser back button behaves correctly.
11. The resume is fully usable without WebGL.
12. Mobile controls are usable.
13. Reduced-motion settings are respected.
14. The site meets the defined performance budgets.
15. Resume content is separated from gameplay code.
16. External links and resume downloads work.
17. The visual style is original and not a direct clone of another game.
18. The project is deployed through a reproducible build pipeline.

---

## 31. Recommended implementation decisions

Use these defaults unless there is a reason to change them:

```txt
Framework: Vite + React + TypeScript
3D: React Three Fiber
Helpers: Drei
State: Zustand
Routing: React Router
Animation: Three.js AnimationMixer + Framer Motion for HTML UI
Physics: Custom 2D XZ collision
Styling: CSS Modules or plain CSS with design tokens
Content: TypeScript data files
Testing: Vitest + Playwright
Hosting: Cloudflare Pages, Vercel, Netlify, or AWS
```

Avoid:

- Full physics for simple walking
- Text rendered only inside the Canvas
- Excessive post-processing
- Large high-resolution textures
- A giant monolithic `World.tsx`
- Storing frame-by-frame player state in React state
- Recreating game-engine abstractions unnecessarily
- Requiring visitors to play before viewing resume content

---

## 32. Suggested first technical milestone

Build a gray-box prototype with:

- One rectangular island
- One primitive character
- One fixed camera
- WASD movement
- Simple boundary collision
- One Projects sign
- One accessible Projects modal
- URL update to `/projects`
- Browser back closes the modal

Do not begin final art production until this interaction loop feels good.

---

## 33. Future enhancements

Potential later additions:

- Day and night cycle
- Weather toggle
- Hidden easter eggs
- Achievement badges
- NPC guides
- Project-specific mini-scenes
- Interactive architecture diagrams
- Portal transitions
- Character customization
- Camera photo mode
- Recruiter quick-tour mode
- Guided auto-tour
- Internationalization
- Content CMS
- WebGPU rendering path

---

## 34. Definition of a successful experience

A successful visitor should be able to understand the following within 30 seconds:

- Who Leonardo Wildt is
- What type of work he does
- That he combines engineering, architecture, leadership, and delivery
- Where to view experience and projects
- How to contact him

A successful technical visitor should also recognize that:

- The experience is thoughtfully architected
- The site is accessible
- The 3D implementation is performant
- The design uses appropriate technical restraint
- The portfolio demonstrates engineering judgment rather than novelty alone
