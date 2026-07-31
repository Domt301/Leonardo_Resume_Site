// ─────────────────────────────────────────────────────────────────────────────
// Data layer types — the single source of truth consumed by BOTH the 3D game
// and the HTML résumé overlay. This module imports NOTHING from three, React,
// or the store. Data flows down into renderers; it never depends sideways.
// ─────────────────────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  /** Professional role (résumé, page title, contact). */
  title: string;
  /** Hero tagline shown on the in-world title board. */
  tagline: string;
  location: string;
  email: string;
  phone: string;
  languages: string;
  links: { label: string; href: string }[];
  /** Multi-paragraph professional summary (notice board on the home island). */
  summary: string[];
}

/** A single résumé bullet, matched to an interior prop. */
export interface Bullet {
  /** Thematic prop key the bullet is attached to inside the building. */
  prop: string;
  text: string;
  /** True for `⚠️ ADDED` inferred elaborations awaiting Leonardo's sign-off. */
  unverified?: boolean;
}

export interface Job {
  id: string;
  /** Real-world company name. */
  company: string;
  role: string;
  location: string;
  /** Human-readable date range, e.g. "March 2024 – Present". */
  dates: string;
  /** Sortable start year for chronological ring ordering. */
  startYear: number;
  /** In-world island display name, e.g. "The Insurer's Keep". */
  island: string;
  /** Guildmaster NPC who runs the interior. */
  guildmaster: string;
  /** One-sentence line shown on the outdoor signpost. */
  signLine: string;
  bullets: Bullet[];
  /** Tech-stack inscription for the interior wall plaque. */
  plaque: string[];
  /** The island's collectible Mark. */
  mark: { name: string; quote: string };
}

export type CertStatus = 'active' | 'lapsed';
export type CertShape =
  | 'hex'
  | 'hex-ribbon'
  | 'octagon'
  | 'shield'
  | 'circle'
  | 'heptagon';

export interface Cert {
  id: string;
  name: string;
  issuer: string;
  shape: CertShape;
  /** RAMP key used for the sigil's emissive tint. */
  ramp: string;
  /** Short glyph descriptor rendered into the 16×16 sigil texture. */
  glyph: string;
  status: CertStatus;
  /** Two sentences: what it validates and how it was used. */
  blurb: string;
}

export interface Education {
  id: string;
  /** Reading-station credential name. */
  name: string;
  institution: string;
  /** Optional year or range. */
  year?: string;
  blurb: string;
  /** Job id this credential's skills were applied at, for the cross-link. */
  usedAt?: string;
}

export interface SkillCategory {
  name: string;
  items: string[];
}

// ── Island world specification (geometry / theme / layout) ───────────────────

export type IslandTheme =
  | 'verdant'
  | 'industrial'
  | 'arcane'
  | 'wooded'
  | 'civic'
  | 'coastal'
  | 'twilight'
  | 'vault';

export interface PropPlacement {
  /** Prop builder key (see props/*). */
  kind: string;
  /** Grid cell [col,row] the prop sits on. */
  cell: [number, number];
  /** Y-rotation in radians (optional). */
  rot?: number;
  /** Uniform scale multiplier (optional). */
  scale?: number;
  /** Free-form tag consumed by interaction logic (e.g. 'sign', 'door'). */
  tag?: string;
}

export interface StairSpec {
  cell: [number, number];
  facing: 'n' | 's' | 'e' | 'w';
  delta: number;
}

export interface BridgeSpec {
  /** Destination island id. */
  to: string;
  /** Edge cell on THIS island where the bridge departs. */
  cell: [number, number];
  facing: 'n' | 's' | 'e' | 'w';
  /** Water span length in tiles. */
  length: number;
}

export interface SignSpec {
  cell: [number, number];
  rot?: number;
}

export interface BuildingSpec {
  cell: [number, number];
  rot?: number;
  /** Interior scene id (job id, 'sigils', 'academy'). */
  interior: string;
}

export interface IslandSpec {
  id: string;
  /** Display name shown in title cards. */
  name: string;
  /** Related job/section id for content lookup (undefined for home). */
  contentId?: string;
  theme: IslandTheme;
  /** Square grid; 0 = open water, 1..3 = elevation tier. */
  grid: number[][];
  /** World position of the island's NW corner [x,z]. */
  origin: [number, number];
  props: PropPlacement[];
  stairs: StairSpec[];
  bridges: BridgeSpec[];
  sign?: SignSpec;
  building?: BuildingSpec;
  /** Ring order index (0 = home, 1..8 jobs clockwise from north, spurs). */
  ringIndex: number;
  /** Edges that spawn a waterfall: 'n'|'s'|'e'|'w'. */
  waterfalls?: ('n' | 's' | 'e' | 'w')[];
}
