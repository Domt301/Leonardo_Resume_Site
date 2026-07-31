import * as THREE from 'three';
import type { IslandSpec, StairSpec } from '../data/types';
import { buildTerrain, LEVEL_HEIGHT, TILE } from './Terrain';
import { buildFoamRing, buildWaterfall } from './Water';
import { STATIC_PROPS, DYNAMIC_PROPS, isDynamic, mergePartsByColor } from '../props/registry';
import { RAMP } from '../art/palette';
import { box } from '../art/geometry';
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

    // sign
    if (spec.sign) {
      const pos = this.worldCellCenter(spec.sign.cell[0], spec.sign.cell[1]);
      pos.y += 0.6;
      if (spec.contentId && spec.contentId !== 'sigils' && spec.contentId !== 'academy') {
        this.targets.push({
          id: `${spec.id}:sign`,
          action: { type: 'sign', jobId: spec.contentId },
          position: pos,
          radius: 2,
          hint: 'Read the sign',
        });
      } else if (spec.id === 'home') {
        this.targets.push({
          id: 'home:summary',
          action: { type: 'summary' },
          position: pos,
          radius: 2,
          hint: 'Read the notice board',
        });
      }
    }

    // home-only interactables from hero props
    if (spec.id === 'home') {
      for (const pl of spec.props) {
        if (pl.kind === 'armory') {
          const pos = this.worldCellCenter(pl.cell[0], pl.cell[1]);
          pos.y += 0.6;
          this.targets.push({
            id: 'home:skills',
            action: { type: 'skills' },
            position: pos,
            radius: 2,
            hint: 'Open the Armory',
          });
        }
        if (pl.kind === 'mailbox') {
          const pos = this.worldCellCenter(pl.cell[0], pl.cell[1]);
          pos.y += 0.6;
          this.targets.push({
            id: 'home:contact',
            action: { type: 'contact' },
            position: pos,
            radius: 2,
            hint: 'Check the mailbox',
          });
        }
      }
    }
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
