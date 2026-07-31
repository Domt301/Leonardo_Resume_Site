import type {
  IslandSpec,
  IslandTheme,
  PropPlacement,
  StairSpec,
  BridgeSpec,
} from './types';
import { jobs } from './jobs';

// ─────────────────────────────────────────────────────────────────────────────
// The archipelago — spec §9. The home island sits at the centre; the eight job
// islands form a ring clockwise from due north (most-recent role at north).
// Two spurs branch east (Hall of Sigils) and west (The Academy).
//
// Grids, prop scatter, stairs and bridge landings are generated procedurally
// from a compact per-island config so this file stays readable. Everything is
// deterministic (seeded hash, never Math.random) so the world is stable.
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic 0..1 hash from two ints. */
function hash2(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x9e3779b9;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 100000) / 100000;
}

interface IslandConfig {
  id: string;
  name: string;
  contentId?: string;
  theme: IslandTheme;
  size: number;
  tiers: number;
  ringIndex: number;
  /** Ring angle in degrees, 0 = north, clockwise. undefined = placed manually. */
  angle?: number;
  radius: number;
  interior?: string;
  waterfalls?: ('n' | 's' | 'e' | 'w')[];
  /** Theme hero props placed on the top tier in addition to scatter. */
  hero?: string[];
}

const RING_RADIUS = 58;
const SPUR_RADIUS = 26;

// Ring order: index 1..8 clockwise from north = most-recent → oldest role.
const RING_JOB_IDS = [
  'travelers', // 1  N
  'cox', // 2  NE
  'aws', // 3  E
  'rentready', // 4  SE
  'ncourt', // 5  S
  'atlantic', // 6  SW
  'ruralmetro', // 7  W
  'merrill', // 8  NW
];

const SIZE_BY_ID: Record<string, number> = {
  travelers: 26,
  cox: 20,
  aws: 34,
  rentready: 26,
  ncourt: 22,
  atlantic: 26,
  ruralmetro: 22,
  merrill: 18,
};
const TIERS_BY_ID: Record<string, number> = {
  travelers: 3,
  cox: 2,
  aws: 3,
  rentready: 2,
  ncourt: 2,
  atlantic: 2,
  ruralmetro: 1,
  merrill: 2,
};
const THEME_BY_ID: Record<string, IslandTheme> = {
  travelers: 'civic',
  cox: 'industrial',
  aws: 'arcane',
  rentready: 'wooded',
  ncourt: 'civic',
  atlantic: 'coastal',
  ruralmetro: 'twilight',
  merrill: 'vault',
};
const HERO_BY_THEME: Record<IslandTheme, string[]> = {
  verdant: ['tree', 'tree', 'bush'],
  industrial: ['waterwheel', 'brazier', 'crate'],
  arcane: ['temple', 'pedestal', 'rockArch'],
  wooded: ['pine', 'pine', 'tree'],
  civic: ['lantern', 'lantern', 'bush'],
  coastal: ['lighthouse', 'dock', 'rock'],
  twilight: ['brazier', 'pine', 'rock'],
  vault: ['brazier', 'rock', 'crate'],
};

const CONFIGS: IslandConfig[] = [
  {
    id: 'home',
    name: 'Chinquapin Hollow',
    theme: 'verdant',
    size: 30,
    tiers: 3,
    ringIndex: 0,
    radius: 0,
    hero: ['titleBoard', 'rockArch', 'house', 'armory', 'mailbox', 'fence'],
  },
  ...RING_JOB_IDS.map((id, i) => ({
    id,
    name: jobs.find((j) => j.id === id)!.island,
    contentId: id,
    theme: THEME_BY_ID[id],
    size: SIZE_BY_ID[id],
    tiers: TIERS_BY_ID[id],
    ringIndex: i + 1,
    angle: i * 45,
    radius: RING_RADIUS,
    interior: id,
    waterfalls: id === 'aws' ? (['e'] as ('e')[]) : undefined,
    hero: HERO_BY_THEME[THEME_BY_ID[id]],
  })),
  {
    id: 'sigils',
    name: 'The Hall of Sigils',
    contentId: 'sigils',
    theme: 'arcane',
    size: 24,
    tiers: 2,
    ringIndex: 10,
    angle: 90,
    radius: SPUR_RADIUS,
    interior: 'sigils',
    hero: ['temple', 'pedestal', 'pedestal'],
  },
  {
    id: 'academy',
    name: 'The Academy',
    contentId: 'academy',
    theme: 'wooded',
    size: 24,
    tiers: 2,
    ringIndex: 11,
    angle: 270,
    radius: SPUR_RADIUS,
    interior: 'academy',
    hero: ['house', 'pine', 'pine'],
  },
];

/** East/West spurs get pushed off the ring axis in Z so they clear ring jobs. */
const SPUR_Z_OFFSET: Record<string, number> = { sigils: -20, academy: 20 };

function centerFor(cfg: IslandConfig): [number, number] {
  if (cfg.radius === 0) return [0, 0];
  const a = ((cfg.angle ?? 0) * Math.PI) / 180;
  const cx = Math.sin(a) * cfg.radius;
  const cz = -Math.cos(a) * cfg.radius + (SPUR_Z_OFFSET[cfg.id] ?? 0);
  return [cx, cz];
}

/**
 * Build a rounded, multi-tier plateau. Higher tiers are concentric and biased
 * north so the tall "back" of the island faces away from the south approach —
 * matching the reference composition (upper tier north, lawn south).
 */
function makeGrid(size: number, tiers: number): number[][] {
  const grid: number[][] = [];
  const c = (size - 1) / 2;
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let cx = 0; cx < size; cx++) {
      const dx = (cx - c) / c;
      // bias tier centres north (smaller r) for the taller back
      const dzTop = (r - c * 0.7) / c;
      const dz = (r - c) / c;
      const edge = Math.sqrt(dx * dx + dz * dz);
      if (edge > 0.96) {
        row.push(0);
        continue;
      }
      // base land
      let h = 1;
      // add tiers toward the (north-biased) centre
      const inner = Math.sqrt(dx * dx * 1.15 + dzTop * dzTop);
      for (let t = 2; t <= tiers; t++) {
        const threshold = 0.62 - (t - 2) * 0.24;
        if (inner < threshold) h = t;
      }
      row.push(h);
    }
    grid.push(row);
  }
  return grid;
}

/** Cells on the outermost land ring, used for edge scatter. */
function isEdgeCell(grid: number[][], r: number, c: number): boolean {
  if (grid[r][c] === 0) return false;
  const n = [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ];
  for (const [rr, cc] of n) {
    if (rr < 0 || cc < 0 || rr >= grid.length || cc >= grid[0].length || grid[rr][cc] === 0) return true;
  }
  return false;
}

/** Generate stairs where a higher tier meets a lower one along the centre column. */
function makeStairs(grid: number[][]): StairSpec[] {
  const stairs: StairSpec[] = [];
  const size = grid.length;
  const cc = Math.floor((size - 1) / 2);
  // Walk down the centre column from north; at each downward step, place a stair
  // on the south face so the player climbs from the lawn.
  for (let r = 1; r < size; r++) {
    const here = grid[r][cc];
    const south = grid[r + 1] ? grid[r + 1][cc] : 0;
    if (here > 0 && south > 0 && here > south) {
      stairs.push({ cell: [cc, r], facing: 's', delta: here - south });
    }
  }
  return stairs;
}

/** Find the highest-tier cell nearest the north-centre, for the hero building. */
function topCenterCell(grid: number[][]): [number, number] {
  const size = grid.length;
  const cc = Math.floor((size - 1) / 2);
  let best: [number, number] = [cc, Math.floor(size / 3)];
  let bestH = 0;
  for (let r = 1; r < size / 2; r++) {
    const h = grid[r][cc];
    if (h >= bestH) {
      bestH = h;
      best = [cc, r];
    }
  }
  return best;
}

/** Lowest-tier cell near south-centre, for the spawn / sign / bridge landing. */
function southCenterCell(grid: number[][]): [number, number] {
  const size = grid.length;
  const cc = Math.floor((size - 1) / 2);
  for (let r = size - 2; r > size / 2; r--) {
    if (grid[r][cc] > 0) return [cc, r];
  }
  return [cc, size - 3];
}

function edgeLandingCell(grid: number[][], facing: 'n' | 's' | 'e' | 'w'): [number, number] {
  const size = grid.length;
  const mid = Math.floor((size - 1) / 2);
  const scan = (fixedIsRow: boolean, fixed: number, from: number, to: number, step: number): [number, number] => {
    for (let i = from; i !== to; i += step) {
      const r = fixedIsRow ? fixed : i;
      const c = fixedIsRow ? i : fixed;
      if (grid[r] && grid[r][c] > 0) return [c, r];
    }
    return fixedIsRow ? [mid, fixed] : [fixed, mid];
  };
  switch (facing) {
    case 'n':
      return scan(false, mid, 0, size, 1);
    case 's':
      return scan(false, mid, size - 1, -1, -1);
    case 'w':
      return scan(true, mid, 0, size, 1);
    case 'e':
      return scan(true, mid, size - 1, -1, -1);
  }
}

function scatterProps(cfg: IslandConfig, grid: number[][]): PropPlacement[] {
  const props: PropPlacement[] = [];
  const size = grid.length;
  const scatterKinds =
    cfg.theme === 'wooded'
      ? ['pine', 'tree', 'bush']
      : cfg.theme === 'twilight'
      ? ['pine', 'rock', 'bush']
      : cfg.theme === 'industrial' || cfg.theme === 'vault'
      ? ['rock', 'crate', 'rock']
      : cfg.theme === 'coastal'
      ? ['rock', 'bush', 'rock']
      : cfg.theme === 'arcane'
      ? ['rock', 'bush', 'pedestalSmall']
      : ['tree', 'bush', 'rock'];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) continue;
      const h = hash2(cfg.ringIndex * 131 + c, cfg.ringIndex * 71 + r);
      const edge = isEdgeCell(grid, r, c);
      const density = edge ? 0.22 : 0.06;
      if (h < density) {
        const kind = scatterKinds[Math.floor(hash2(r, c) * scatterKinds.length)];
        props.push({ kind, cell: [c, r], rot: hash2(c, r) * Math.PI * 2, scale: 0.85 + hash2(r + 3, c) * 0.4 });
      }
    }
  }
  return props;
}

// ── Home island — hand-authored to match the reference composition (§9.3) ─────
// Cells are on a 30×30 grid: upper plateau north (title board + rock arch +
// house), a central path with stone stairs, and a lower lawn ringed with the
// reference-styled navigation boards, a fenced chicken pen, and dense flowers.
const HOME_PROPS: PropPlacement[] = [
  { kind: 'titleBoard', cell: [15, 6] },
  { kind: 'rockArch', cell: [9, 6] },
  { kind: 'house', cell: [21, 7] },
  { kind: 'lantern', cell: [12, 8] },
  { kind: 'lantern', cell: [18, 8] },
  // navigation boards (label:icon) with an action tag
  { kind: 'board:EXPERIENCE:experience', cell: [8, 13], tag: 'map' },
  { kind: 'board:CERTIFICATIONS:certifications', cell: [22, 13], tag: 'travel:sigils' },
  { kind: 'board:SKILLS:skills', cell: [8, 19], tag: 'skills' },
  { kind: 'board:EDUCATION:education', cell: [22, 19], tag: 'travel:academy' },
  { kind: 'board:ABOUT:about', cell: [11, 23], tag: 'summary' },
  { kind: 'board:CONTACT:contact', cell: [19, 23], tag: 'contact' },
  { kind: 'mailbox', cell: [17, 23] },
  { kind: 'armory', cell: [6, 17] },
  // fenced chicken pen (SW)
  { kind: 'fence', cell: [5, 22] },
  { kind: 'fence', cell: [7, 22] },
  { kind: 'chicken', cell: [6, 21] },
  { kind: 'chicken', cell: [7, 20] },
  // a few trees / bushes
  { kind: 'tree', cell: [4, 10] },
  { kind: 'tree', cell: [25, 12] },
  { kind: 'pine', cell: [26, 8] },
  { kind: 'bush', cell: [13, 20] },
  { kind: 'bush', cell: [16, 18] },
];

function homeProps(grid: number[][]): PropPlacement[] {
  const props: PropPlacement[] = HOME_PROPS.filter((p) => grid[p.cell[1]]?.[p.cell[0]] > 0);
  // dense flower + tuft scatter on the lawn
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 1) continue;
      const h = hash2(c * 17 + 1, r * 23 + 5);
      if (h < 0.16) props.push({ kind: 'flower', cell: [c, r], rot: hash2(c, r) * 6.28 });
      else if (h < 0.19) props.push({ kind: 'bush', cell: [c, r], scale: 0.7 });
    }
  }
  return props;
}

function buildSpec(cfg: IslandConfig, neighbors: Record<string, BridgeSpec[]>): IslandSpec {
  const grid = makeGrid(cfg.size, cfg.tiers);
  const [cx, cz] = centerFor(cfg);
  const origin: [number, number] = [cx - cfg.size / 2, cz - cfg.size / 2];

  const stairs = makeStairs(grid);
  const isHome = cfg.id === 'home';

  let props: PropPlacement[];
  if (isHome) {
    props = homeProps(grid);
  } else {
    props = scatterProps(cfg, grid);
    // Hero props on the top tier, fanned around the building spot.
    const top = topCenterCell(grid);
    const heroKinds = cfg.hero ?? [];
    heroKinds.forEach((kind, i) => {
      const off = i - (heroKinds.length - 1) / 2;
      const cell: [number, number] = [
        Math.max(1, Math.min(cfg.size - 2, top[0] + Math.round(off * 2))),
        Math.max(1, Math.min(cfg.size - 2, top[1] + (i % 2 === 0 ? -1 : 1))),
      ];
      if (grid[cell[1]][cell[0]] > 0) props.push({ kind, cell, tag: 'hero' });
    });
  }

  const top = topCenterCell(grid);
  const south = southCenterCell(grid);
  const sign = isHome ? undefined : { cell: south };

  const building = cfg.interior ? { cell: top, interior: cfg.interior } : undefined;

  return {
    id: cfg.id,
    name: cfg.name,
    contentId: cfg.contentId,
    theme: cfg.theme,
    grid,
    origin,
    props,
    stairs,
    bridges: neighbors[cfg.id] ?? [],
    sign,
    building,
    ringIndex: cfg.ringIndex,
    waterfalls: isHome ? ['e'] : cfg.waterfalls,
  };
}

// ── Bridge network ───────────────────────────────────────────────────────────
// Full connectivity with short spans: home↔travelers(N), home↔sigils(E),
// home↔academy(W); the eight jobs form a walkable cycle by chronology.
function buildBridges(): Record<string, BridgeSpec[]> {
  const bridges: Record<string, BridgeSpec[]> = {};
  const add = (from: string, to: string, facing: 'n' | 's' | 'e' | 'w', length: number) => {
    (bridges[from] ??= []).push({ to, cell: [0, 0], facing, length });
  };
  // home spokes
  add('home', 'travelers', 'n', 8);
  add('travelers', 'home', 's', 8);
  add('home', 'sigils', 'e', 6);
  add('sigils', 'home', 'w', 6);
  add('home', 'academy', 'w', 6);
  add('academy', 'home', 'e', 6);
  // job ring cycle (chronological neighbours)
  for (let i = 0; i < RING_JOB_IDS.length; i++) {
    const a = RING_JOB_IDS[i];
    const b = RING_JOB_IDS[(i + 1) % RING_JOB_IDS.length];
    add(a, b, 'e', 9);
    add(b, a, 'w', 9);
  }
  return bridges;
}

const neighborBridges = buildBridges();

// Resolve each bridge's landing cell now that grids exist.
export const islands: IslandSpec[] = CONFIGS.map((cfg) => buildSpec(cfg, neighborBridges));

// Fill in real edge-landing cells per bridge from the finished grids.
for (const isl of islands) {
  for (const b of isl.bridges) {
    b.cell = edgeLandingCell(isl.grid, b.facing);
  }
}

export const islandById = (id: string): IslandSpec | undefined => islands.find((i) => i.id === id);
export const homeIsland = islandById('home')!;

/** Bridge-neighbour ids for streaming (current island + immediate neighbours). */
export function neighborIds(id: string): string[] {
  const isl = islandById(id);
  if (!isl) return [];
  return isl.bridges.map((b) => b.to);
}

/** Deep-link fragment → island id. */
export const DEEP_LINKS: Record<string, string> = {
  '#/home': 'home',
  '#/travelers': 'travelers',
  '#/cox': 'cox',
  '#/aws': 'aws',
  '#/rentready': 'rentready',
  '#/ncourt': 'ncourt',
  '#/atlantic': 'atlantic',
  '#/ruralmetro': 'ruralmetro',
  '#/merrill': 'merrill',
  '#/sigils': 'sigils',
  '#/academy': 'academy',
};
