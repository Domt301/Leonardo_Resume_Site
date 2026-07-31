import * as THREE from 'three';
import { islands as islandSpecs, islandById, neighborIds } from '../data/islands';
import { Island } from './Island';
import { buildSea, type Sea } from './Water';
import { buildBridge, projectToBridge, type BridgeMesh } from './Bridge';
import { LEVEL_HEIGHT } from './Terrain';
import type { InteractionTarget } from './Interactable';

// The archipelago (spec §9, §18). Streams islands — only the current island and
// its bridge neighbours are in the scene graph; others are disposed and rebuilt
// on approach. Owns the sea, the bridge network, and global collision sampling.

export interface Sample {
  tier: number;
  y: number;
  islandId?: string;
  onBridge?: boolean;
}

export class Archipelago {
  readonly group = new THREE.Group();
  private loaded = new Map<string, Island>();
  private bridges: BridgeMesh[] = [];
  private sea: Sea;
  private active = 'home';

  constructor() {
    // sea spans the whole archipelago plus margin
    let maxR = 0;
    for (const s of islandSpecs) {
      maxR = Math.max(maxR, Math.abs(s.origin[0]) + s.grid[0].length, Math.abs(s.origin[1]) + s.grid.length);
    }
    this.sea = buildSea(maxR * 2 + 80);
    this.group.add(this.sea.mesh);
  }

  /** Ensure the given island + its neighbours are loaded; dispose the rest. */
  setActive(id: string): void {
    this.active = id;
    const keep = new Set([id, ...neighborIds(id)]);
    // unload
    for (const [key, isl] of this.loaded) {
      if (!keep.has(key)) {
        isl.dispose();
        this.loaded.delete(key);
      }
    }
    // load
    for (const key of keep) {
      if (!this.loaded.has(key)) {
        const spec = islandById(key);
        if (spec) {
          const isl = new Island(spec);
          this.loaded.set(key, isl);
          this.group.add(isl.group);
        }
      }
    }
    this.rebuildBridges();
  }

  private rebuildBridges(): void {
    for (const b of this.bridges) {
      b.group.removeFromParent();
      b.dispose();
    }
    this.bridges = [];
    const seen = new Set<string>();
    for (const [id, isl] of this.loaded) {
      for (const br of isl.spec.bridges) {
        const other = this.loaded.get(br.to);
        if (!other) continue;
        const key = [id, br.to].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const pa = this.edgeLandingWorld(isl, other);
        const pb = this.edgeLandingWorld(other, isl);
        const bridge = buildBridge(pa, pb, 2.6, id, br.to);
        this.bridges.push(bridge);
        this.group.add(bridge.group);
      }
    }
  }

  /** World point on island A's border nearest island B's centre. */
  private edgeLandingWorld(a: Island, b: Island): THREE.Vector3 {
    const target = b.worldCenter;
    let best = a.worldCenter;
    let bestD = Infinity;
    const spec = a.spec;
    for (let r = 0; r < spec.grid.length; r++) {
      for (let c = 0; c < spec.grid[0].length; c++) {
        if (spec.grid[r][c] === 0) continue;
        // border cell only
        const border =
          spec.grid[r - 1]?.[c] === 0 ||
          spec.grid[r + 1]?.[c] === 0 ||
          spec.grid[r]?.[c - 1] === 0 ||
          spec.grid[r]?.[c + 1] === 0 ||
          r === 0 ||
          c === 0 ||
          r === spec.grid.length - 1 ||
          c === spec.grid[0].length - 1;
        if (!border) continue;
        const w = a.worldCellCenter(c, r);
        const d = w.distanceTo(target);
        if (d < bestD) {
          bestD = d;
          best = w;
        }
      }
    }
    return best.clone();
  }

  sample(x: number, z: number): Sample | null {
    let best: Sample | null = null;
    for (const [id, isl] of this.loaded) {
      const s = isl.sample(x, z);
      if (s && (!best || s.y > best.y)) best = { ...s, islandId: id };
    }
    if (best) return best;
    // bridges
    for (const b of this.bridges) {
      const pr = projectToBridge(b, x, z);
      if (pr && pr.dist <= b.width / 2) {
        return { tier: Math.max(1, Math.round(pr.y / LEVEL_HEIGHT)), y: pr.y, onBridge: true };
      }
    }
    return null;
  }

  targets(): InteractionTarget[] {
    const out: InteractionTarget[] = [];
    for (const isl of this.loaded.values()) out.push(...isl.targets);
    return out;
  }

  islandBounds(id: string): { min: THREE.Vector2; max: THREE.Vector2 } | null {
    const spec = islandById(id);
    if (!spec) return null;
    return {
      min: new THREE.Vector2(spec.origin[0] - 6, spec.origin[1] - 6),
      max: new THREE.Vector2(spec.origin[0] + spec.grid[0].length + 6, spec.origin[1] + spec.grid.length + 6),
    };
  }

  spawnPoint(id: string): { pos: THREE.Vector3; tier: number } {
    const isl = this.loaded.get(id) ?? new Island(islandById(id)!);
    // south-centre lowest cell
    const spec = isl.spec;
    const cc = Math.floor((spec.grid[0].length - 1) / 2);
    for (let r = spec.grid.length - 2; r > spec.grid.length / 2; r--) {
      if (spec.grid[r][cc] > 0) {
        const pos = isl.worldCellCenter(cc, r);
        return { pos, tier: spec.grid[r][cc] };
      }
    }
    return { pos: isl.worldCenter, tier: 1 };
  }

  update(t: number, dt: number): void {
    this.sea.update(t);
    for (const isl of this.loaded.values()) isl.update(t, dt);
  }

  get activeId(): string {
    return this.active;
  }

  dispose(): void {
    for (const isl of this.loaded.values()) isl.dispose();
    this.loaded.clear();
    for (const b of this.bridges) b.dispose();
    this.bridges = [];
    this.sea.dispose();
    this.group.removeFromParent();
  }
}
