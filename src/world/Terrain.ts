import * as THREE from 'three';
import { toon } from '../art/toon';
import { RAMP } from '../art/palette';
import { hash } from '../art/geometry';
import type { IslandTheme } from '../data/types';

// Terrain mesh construction (spec §6.2). Walk the grid once, emit merged buffers
// for grass tops, banded cliff faces, the signature grass lip, and the underside.
// A whole island is a handful of draw calls.

export const TILE = 1;
export const LEVEL_HEIGHT = 0.6;
export const SKIRT = 2.2;

const LIP_OUT = 0.08;
const LIP_DROP = 0.14;
const DIRT_BAND = 0.35;

type V3 = [number, number, number];

/** Accumulates triangles into a position buffer, computing normals at the end. */
class MeshBuf {
  private pos: number[] = [];
  quad(a: V3, b: V3, c: V3, d: V3): void {
    // two triangles a,b,c and a,c,d (CCW when viewed from front)
    this.tri(a, b, c);
    this.tri(a, c, d);
  }
  tri(a: V3, b: V3, c: V3): void {
    this.pos.push(...a, ...b, ...c);
  }
  build(): THREE.BufferGeometry | null {
    if (this.pos.length === 0) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.pos), 3));
    g.computeVertexNormals();
    return g;
  }
}

const topRampFor = (theme: IslandTheme): readonly string[] =>
  theme === 'vault' || theme === 'industrial' ? RAMP.stone : RAMP.grass;

const lipRampFor = (theme: IslandTheme): readonly string[] =>
  theme === 'vault' || theme === 'industrial' ? RAMP.stone : RAMP.grass;

export interface TerrainResult {
  group: THREE.Group;
  dispose: () => void;
}

export function buildTerrain(grid: number[][], theme: IslandTheme): TerrainResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const y = (h: number) => h * LEVEL_HEIGHT;
  const at = (r: number, c: number) => (r < 0 || c < 0 || r >= rows || c >= cols ? 0 : grid[r][c]);

  const topBuf = new MeshBuf();
  const lipBuf = new MeshBuf();
  const dirtBuf = new MeshBuf();
  const stoneBuf = new MeshBuf();
  const underBuf = new MeshBuf();

  const jit = (c: number, r: number) => (hash(c * 7 + 3, r * 13 + 5) - 0.5) * 0.04;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = grid[r][c];
      if (h === 0) continue;
      const yt = y(h);
      const x0 = c * TILE;
      const x1 = x0 + TILE;
      const z0 = r * TILE;
      const z1 = z0 + TILE;

      // — grass top quad (slight per-corner jitter) —
      topBuf.quad(
        [x0, yt + jit(c, r), z1],
        [x1, yt + jit(c + 1, r), z1],
        [x1, yt + jit(c + 1, r + 1), z0],
        [x0, yt + jit(c, r + 1), z0],
      );

      // underside (down-facing) at -SKIRT
      underBuf.quad(
        [x0, -SKIRT, z0],
        [x1, -SKIRT, z0],
        [x1, -SKIRT, z1],
        [x0, -SKIRT, z1],
      );

      // — cliff faces on edges where the neighbour is lower —
      // neighbour dirs: N (r-1,z0 side), S (r+1,z1 side), W (c-1,x0), E (c+1,x1)
      const faces: { nh: number; corners: [V3, V3, V3, V3]; edge: 'n' | 's' | 'e' | 'w' }[] = [];
      const boundaryLow = -SKIRT;
      // North edge (z = z0), face normal -Z
      if (at(r - 1, c) < h) {
        const nh = at(r - 1, c);
        const low = nh > 0 ? y(nh) : boundaryLow;
        faces.push({ nh, edge: 'n', corners: [[x0, yt, z0], [x0, low, z0], [x1, low, z0], [x1, yt, z0]] });
      }
      // South edge (z = z1), normal +Z
      if (at(r + 1, c) < h) {
        const nh = at(r + 1, c);
        const low = nh > 0 ? y(nh) : boundaryLow;
        faces.push({ nh, edge: 's', corners: [[x1, yt, z1], [x1, low, z1], [x0, low, z1], [x0, yt, z1]] });
      }
      // West edge (x = x0), normal -X
      if (at(r, c - 1) < h) {
        const nh = at(r, c - 1);
        const low = nh > 0 ? y(nh) : boundaryLow;
        faces.push({ nh, edge: 'w', corners: [[x0, yt, z1], [x0, low, z1], [x0, low, z0], [x0, yt, z0]] });
      }
      // East edge (x = x1), normal +X
      if (at(r, c + 1) < h) {
        const nh = at(r, c + 1);
        const low = nh > 0 ? y(nh) : boundaryLow;
        faces.push({ nh, edge: 'e', corners: [[x1, yt, z0], [x1, low, z0], [x1, low, z1], [x1, yt, z1]] });
      }

      for (const f of faces) {
        const [tl, bl, br, tr] = f.corners;
        const faceH = tl[1] - bl[1];
        const bandY = tl[1] - Math.min(DIRT_BAND, faceH);
        // dirt band (top)
        const dtl = tl;
        const dtr = tr;
        const dbl: V3 = [bl[0], bandY, bl[2]];
        const dbr: V3 = [br[0], bandY, br[2]];
        dirtBuf.quad(dtl, dbl, dbr, dtr);
        // stone band (below), only if there is depth beyond the dirt band
        if (faceH > DIRT_BAND) {
          stoneBuf.quad(dbl, bl, br, dbr);
        }

        // — grass lip overhanging this edge —
        addLip(lipBuf, f.edge, tl, tr, LIP_OUT, LIP_DROP);
      }
    }
  }

  const group = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const addMesh = (buf: MeshBuf, mat: THREE.Material) => {
    const g = buf.build();
    if (!g) return;
    geoms.push(g);
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };

  const topR = topRampFor(theme);
  const lipR = lipRampFor(theme);
  addMesh(topBuf, toon(topR[3]));
  addMesh(lipBuf, toon(lipR[2]));
  addMesh(dirtBuf, toon(RAMP.dirt[2]));
  addMesh(stoneBuf, toon(RAMP.stone[1]));
  addMesh(underBuf, toon(RAMP.dirt[0]));

  return { group, dispose: () => geoms.forEach((g) => g.dispose()) };
}

/** Emit the overhanging grass lip along a top edge (from tl→tr at the top). */
function addLip(buf: MeshBuf, edge: 'n' | 's' | 'e' | 'w', tl: V3, tr: V3, out: number, drop: number): void {
  // outward direction in XZ for this edge
  const dir: Record<string, [number, number]> = {
    n: [0, -1],
    s: [0, 1],
    w: [-1, 0],
    e: [1, 0],
  };
  const [ox, oz] = dir[edge];
  const yTop = tl[1];
  // overhang top face (juts outward at the top height)
  const o1: V3 = [tl[0] + ox * out, yTop, tl[2] + oz * out];
  const o2: V3 = [tr[0] + ox * out, yTop, tr[2] + oz * out];
  buf.quad(tl, o1, o2, tr);
  // the little drop face hanging down from the overhang lip
  const d1: V3 = [o1[0], yTop - drop, o1[2]];
  const d2: V3 = [o2[0], yTop - drop, o2[2]];
  buf.quad(o1, d1, d2, o2);
}
