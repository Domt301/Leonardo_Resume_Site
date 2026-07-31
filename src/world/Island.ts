import * as THREE from 'three';
import type { IslandSpec, StairSpec, PropPlacement } from '../data/types';
import { buildTerrain, LEVEL_HEIGHT, TILE } from './Terrain';
import { buildFoamRing, buildWaterfall } from './Water';
import { STATIC_PROPS, DYNAMIC_PROPS, isDynamic, mergePartsByColor } from '../props/registry';
import { buildSignboard, type SignboardHandle } from '../props/signboard';
import { signTexture, titleTexture, type IconKind } from '../art/labelTexture';
import { RAMP } from '../art/palette';
import { box } from '../art/geometry';
import { profile } from '../data/profile';
import { jobById } from '../data/jobs';
import type { Part, DynamicProp } from '../props/types';
import type { InteractionTarget } from './Interactable';

// An outdoor island scene (spec §6). Owns its terrain, props, foam and
// waterfalls, plus a local height sampler and its interaction targets. Positioned
// at its world origin; everything inside is built in island-local coordinates.

export interface CellSample {
  tier: number;
  y: number;
}

export class Island {
  readonly spec: IslandSpec;
  readonly group = new THREE.Group();
  readonly rows: number;
  readonly cols: number;
  private dyn: DynamicProp[] = [];
  private signboards: SignboardHandle[] = [];
  private terrainDispose: () => void;
  private geoms: THREE.BufferGeometry[] = [];
  readonly targets: InteractionTarget[] = [];

  constructor(spec: IslandSpec) {
    this.spec = spec;
    this.rows = spec.grid.length;
    this.cols = spec.grid[0].length;
    this.group.position.set(spec.origin[0], 0, spec.origin[1]);

    // terrain
    const terrain = buildTerrain(spec.grid, spec.theme);
    this.terrainDispose = terrain.dispose;
    this.group.add(terrain.group);

    // static prop parts collected & merged per colour
    const staticParts: Part[] = [];

    // stairs
    for (const st of spec.stairs) staticParts.push(...this.stairParts(st));

    // props
    for (const pl of spec.props) {
      const [wx, , wz] = this.cellLocalCenter(pl.cell[0], pl.cell[1]);
      const topY = this.cellTop(pl.cell[0], pl.cell[1]);
      if (pl.kind === 'titleBoard' || pl.kind === 'signpost' || pl.kind.startsWith('board:')) {
        this.placeSignboard(pl, wx, topY, wz);
        continue;
      }
      if (isDynamic(pl.kind)) {
        const seed = pl.cell[0] * 91 + pl.cell[1] * 13;
        const d = DYNAMIC_PROPS[pl.kind](seed);
        d.object.position.set(wx, topY, wz);
        if (pl.rot) d.object.rotation.y = pl.rot;
        if (pl.scale) d.object.scale.setScalar(pl.scale);
        this.group.add(d.object);
        this.dyn.push(d);
      } else {
        const builder = STATIC_PROPS[pl.kind];
        if (!builder) continue;
        const parts = builder(pl.cell[0] * 7 + pl.cell[1]);
        for (const part of parts) {
          transformGeo(part.geo, wx, topY, wz, pl.rot ?? 0, pl.scale ?? 1);
          staticParts.push(part);
        }
      }
    }

    for (const mesh of mergePartsByColor(staticParts)) {
      this.geoms.push(mesh.geometry);
      this.group.add(mesh);
    }

    // job-island outdoor signpost (labeled) at the sign cell
    const cid = spec.contentId;
    if (spec.sign && cid && cid !== 'sigils' && cid !== 'academy' && spec.id !== 'home') {
      const job = jobById(cid);
      const [swx, , swz] = this.cellLocalCenter(spec.sign.cell[0], spec.sign.cell[1]);
      const sy = this.cellTop(spec.sign.cell[0], spec.sign.cell[1]);
      const h = buildSignboard(signTexture(job ? job.company : spec.name, 'experience'), 'sign');
      // offset beside the spawn point so the board doesn't overlap the player
      h.group.position.set(swx + 1.8, sy, swz);
      this.signboards.push(h);
      this.group.add(h.group);
    }

    // foam ring
    const foam = buildFoamRing(this.cols, this.rows);
    this.geoms.push(foam.geometry);
    this.group.add(foam);

    // waterfalls
    for (const edge of spec.waterfalls ?? []) {
      const wf = this.buildEdgeWaterfall(edge);
      if (wf) this.group.add(wf);
    }

    this.buildTargets();
  }

  // ── coordinates ────────────────────────────────────────────────────────────
  private cellLocalCenter(c: number, r: number): [number, number, number] {
    return [c * TILE + TILE / 2, 0, r * TILE + TILE / 2];
  }
  private cellTop(c: number, r: number): number {
    const t = this.spec.grid[r]?.[c] ?? 0;
    return t * LEVEL_HEIGHT;
  }
  worldCellCenter(c: number, r: number): THREE.Vector3 {
    return new THREE.Vector3(
      this.spec.origin[0] + c + 0.5,
      this.cellTop(c, r),
      this.spec.origin[1] + r + 0.5,
    );
  }
  get worldCenter(): THREE.Vector3 {
    return new THREE.Vector3(
      this.spec.origin[0] + this.cols / 2,
      LEVEL_HEIGHT,
      this.spec.origin[1] + this.rows / 2,
    );
  }

  /** Local height sample in world coordinates; null over water/off-grid. */
  sample(worldX: number, worldZ: number): CellSample | null {
    const c = Math.floor(worldX - this.spec.origin[0]);
    const r = Math.floor(worldZ - this.spec.origin[1]);
    if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return null;
    const tier = this.spec.grid[r][c];
    if (tier === 0) return null;
    return { tier, y: tier * LEVEL_HEIGHT };
  }

  // ── stairs ───────────────────────────────────────────────────────────────
  private stairParts(st: StairSpec): Part[] {
    const parts: Part[] = [];
    const [c, r] = st.cell;
    const d = st.delta;
    const lowTier = (this.spec.grid[r + 1]?.[c] ?? this.spec.grid[r][c] - d);
    const lowY = lowTier * LEVEL_HEIGHT;
    const n = 4 * d;
    const zStart = (r + 2) * TILE;
    for (let i = 0; i < n; i++) {
      const g = box(0.9, 0.15, 0.25, false);
      g.translate(c + 0.5, lowY + (i + 0.5) * 0.15, zStart - (i + 0.5) * 0.25);
      parts.push({ geo: g, color: RAMP.stone[3], cast: true, receive: true });
    }
    return parts;
  }

  private buildEdgeWaterfall(edge: 'n' | 's' | 'e' | 'w'): THREE.Group | null {
    const midR = Math.floor(this.rows / 2);
    const midC = Math.floor(this.cols / 2);
    let x = 0;
    let z = 0;
    if (edge === 'e') {
      x = this.cols;
      z = midR;
    } else if (edge === 'w') {
      x = 0;
      z = midR;
    } else if (edge === 'n') {
      x = midC;
      z = 0;
    } else {
      x = midC;
      z = this.rows;
    }
    return buildWaterfall(x, z, 2.5, LEVEL_HEIGHT);
  }

  // ── interaction targets ────────────────────────────────────────────────────
  private buildTargets(): void {
    const spec = this.spec;

    // building door → enter interior
    if (spec.building) {
      const pos = this.worldCellCenter(spec.building.cell[0], spec.building.cell[1]);
      pos.y += 0.2;
      const interior = spec.building.interior;
      this.targets.push({
        id: `${spec.id}:door`,
        action: { type: 'enter', interior, islandName: spec.name },
        position: pos,
        radius: 2.2,
        hint:
          interior === 'sigils'
            ? 'Enter the Hall of Sigils'
            : interior === 'academy'
            ? 'Enter the Academy'
            : `Enter ${spec.name}`,
      });
    }

    // job-island sign
    if (spec.sign && spec.contentId && spec.contentId !== 'sigils' && spec.contentId !== 'academy') {
      const pos = this.worldCellCenter(spec.sign.cell[0], spec.sign.cell[1]);
      pos.y += 0.6;
      this.targets.push({
        id: `${spec.id}:sign`,
        action: { type: 'sign', jobId: spec.contentId },
        position: pos,
        radius: 2.4,
        hint: 'Read the sign',
      });
    }

    // home navigation boards — action + hint derived from each board's tag
    if (spec.id === 'home') {
      for (const pl of spec.props) {
        if (!pl.kind.startsWith('board:') || !pl.tag) continue;
        const t = this.homeBoardTarget(pl);
        if (t) this.targets.push(t);
      }
    }
  }

  private homeBoardTarget(pl: PropPlacement): InteractionTarget | null {
    const pos = this.worldCellCenter(pl.cell[0], pl.cell[1]);
    pos.y += 0.7;
    const tag = pl.tag!;
    const base = { id: `home:${tag}`, position: pos, radius: 2.2 };
    if (tag === 'map') return { ...base, action: { type: 'openmap' }, hint: 'Walk the career (open map)' };
    if (tag === 'skills') return { ...base, action: { type: 'skills' }, hint: 'Open the Armory (skills)' };
    if (tag === 'summary') return { ...base, action: { type: 'summary' }, hint: 'Read about Leonardo' };
    if (tag === 'contact') return { ...base, action: { type: 'contact' }, hint: 'Check the mailbox' };
    if (tag === 'travel:sigils')
      return { ...base, action: { type: 'travel', to: 'sigils' }, hint: 'Travel to the Hall of Sigils' };
    if (tag === 'travel:academy')
      return { ...base, action: { type: 'travel', to: 'academy' }, hint: 'Travel to the Academy' };
    return null;
  }

  private placeSignboard(pl: PropPlacement, wx: number, topY: number, wz: number): void {
    let handle: SignboardHandle;
    if (pl.kind === 'titleBoard') {
      handle = buildSignboard(
        titleTexture(profile.name.toUpperCase(), profile.title.toUpperCase()),
        'title',
      );
    } else if (pl.kind.startsWith('board:')) {
      const parts = pl.kind.split(':');
      const label = parts[1] ?? '';
      const icon = (parts[2] as IconKind) ?? 'plate';
      handle = buildSignboard(signTexture(label, icon), 'sign');
    } else {
      const job = this.spec.contentId ? jobById(this.spec.contentId) : undefined;
      handle = buildSignboard(signTexture(job ? job.company : this.spec.name, 'experience'), 'sign');
    }
    handle.group.position.set(wx, topY, wz);
    if (pl.rot) handle.group.rotation.y = pl.rot;
    this.signboards.push(handle);
    this.group.add(handle.group);
  }

  update(t: number, dt: number): void {
    for (const d of this.dyn) d.update?.(t, dt);
  }

  dispose(): void {
    this.terrainDispose();
    for (const d of this.dyn) {
      d.dispose();
      if (d.light) d.light.dispose?.();
    }
    for (const s of this.signboards) s.dispose();
    for (const g of this.geoms) g.dispose();
    this.group.removeFromParent();
  }
}

/** Scale → rotateY → translate a geometry into island-local space. */
function transformGeo(g: THREE.BufferGeometry, x: number, y: number, z: number, rot: number, sc: number): void {
  if (sc !== 1) g.scale(sc, sc, sc);
  if (rot) g.rotateY(rot);
  g.translate(x, y, z);
}
