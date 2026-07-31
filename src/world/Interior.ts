import * as THREE from 'three';
import { RAMP } from '../art/palette';
import { toon, emissive } from '../art/toon';
import { STATIC_PROPS, mergePartsByColor } from '../props/registry';
import type { Part } from '../props/types';
import { buildNpc, type NpcHandle } from '../character/Npc';
import type { InteractionTarget } from './Interactable';
import { jobById } from '../data/jobs';
import { certs } from '../data/certs';
import { education } from '../data/education';
import { useGameStore } from '../store/useGameStore';
import type { Cert } from '../data/types';

// Interior scenes (spec §10.2, §13, §14). A single room per building, lit by
// lanterns rather than sun. Three kinds: a job guildhall (guildmaster + one
// interactable prop per résumé bullet + chest holding the Mark), the Hall of
// Sigils (pedestals for 14 certifications), and the Academy (5 reading stations).

interface SigilNode {
  cert: Cert;
  quad: THREE.Mesh;
  baseY: number;
  seed: number;
}

export class Interior {
  readonly group = new THREE.Group();
  readonly targets: InteractionTarget[] = [];
  title = 'Interior';
  private id: string;
  private kind: 'job' | 'sigils' | 'academy';
  private geoms: THREE.BufferGeometry[] = [];
  private lights: THREE.Light[] = [];
  private npc: NpcHandle | null = null;
  private sigilNodes: SigilNode[] = [];
  private halfW = 8;
  private halfD = 6;
  private dialogueIndex = 0;

  constructor(interiorId: string) {
    this.id = interiorId;
    this.kind = interiorId === 'sigils' ? 'sigils' : interiorId === 'academy' ? 'academy' : 'job';
    if (this.kind === 'job') this.buildJob();
    else if (this.kind === 'sigils') this.buildSigils();
    else this.buildAcademy();
  }

  spawn(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, this.halfD - 1.5);
  }

  sample(x: number, z: number): { tier: number; y: number } | null {
    if (Math.abs(x) < this.halfW - 0.6 && Math.abs(z) < this.halfD - 0.6) return { tier: 0, y: 0 };
    return null;
  }

  // ── room shell ─────────────────────────────────────────────────────────────
  private room(floorRamp: keyof typeof RAMP, wallRamp: keyof typeof RAMP, lanternCount = 3): void {
    const W = this.halfW * 2;
    const D = this.halfD * 2;
    const floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.3, D), toon(RAMP[floorRamp][1]));
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    this.geoms.push(floor.geometry);
    this.group.add(floor);

    const wallH = 3;
    const wallMat = toon(RAMP[wallRamp][1]);
    const walls: [number, number, number, number, number][] = [
      [0, wallH / 2, -this.halfD, W, 0.3], // back
      [-this.halfW, wallH / 2, 0, 0.3, D], // left
      [this.halfW, wallH / 2, 0, 0.3, D], // right
    ];
    for (const [x, y, z, w, d] of walls) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wallMat);
      wall.position.set(x, y, z);
      wall.receiveShadow = true;
      this.geoms.push(wall.geometry);
      this.group.add(wall);
    }

    // lanterns / lights
    for (let i = 0; i < lanternCount; i++) {
      const x = (i / Math.max(1, lanternCount - 1) - 0.5) * (W - 3);
      const light = new THREE.PointLight(new THREE.Color(RAMP.gold[3]), 2.4, 22, 2);
      light.position.set(x, 2.6, -this.halfD + 2);
      this.lights.push(light);
      this.group.add(light);
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), emissive(RAMP.gold[4]));
      core.position.copy(light.position);
      this.geoms.push(core.geometry);
      this.group.add(core);
    }
    // soft fill so interiors aren't black
    const fill = new THREE.HemisphereLight(new THREE.Color(RAMP.gold[2]), new THREE.Color(RAMP.dark[2]), 0.8);
    this.lights.push(fill);
    this.group.add(fill);

    // exit door (front)
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.2), toon(RAMP.wood[2]));
    door.position.set(0, 1, this.halfD - 0.1);
    this.geoms.push(door.geometry);
    this.group.add(door);
    this.targets.push({
      id: `${this.id}:exit`,
      action: { type: 'exit' },
      position: new THREE.Vector3(0, 0.6, this.halfD - 1),
      radius: 1.6,
      hint: 'Leave',
    });
  }

  private placeStatic(kind: string, x: number, z: number, rot = 0): void {
    const builder = STATIC_PROPS[kind] ?? STATIC_PROPS.crate;
    const parts: Part[] = builder(Math.round(x * 13 + z * 7));
    for (const part of parts) {
      if (rot) part.geo.rotateY(rot);
      part.geo.translate(x, 0, z);
    }
    for (const mesh of mergePartsByColor(parts)) {
      this.geoms.push(mesh.geometry);
      this.group.add(mesh);
    }
  }

  // ── job guildhall ────────────────────────────────────────────────────────
  private buildJob(): void {
    const job = jobById(this.id);
    if (!job) {
      this.room('stone', 'stone');
      return;
    }
    this.title = job.island;
    const n = job.bullets.length;
    this.halfW = Math.max(7, 3 + n * 0.9);
    this.halfD = 6.5;
    this.room('wood', 'stone', 3);

    // guildmaster
    this.npc = buildNpc('violet', 3);
    this.npc.group.position.set(0, 0, this.halfD - 3.2);
    this.group.add(this.npc.group);
    this.targets.push({
      id: `${this.id}:npc`,
      action: { type: 'npc', npc: job.guildmaster, jobId: job.id },
      position: this.npc.group.position.clone().setY(0.8),
      radius: 1.8,
      hint: `Speak with ${job.guildmaster}`,
    });

    // one interactable prop per bullet, in two rows
    const cols = Math.ceil(n / 2);
    job.bullets.forEach((b, i) => {
      const row = i < cols ? 0 : 1;
      const col = i % cols;
      const x = (col - (cols - 1) / 2) * 2.6;
      const z = -this.halfD + 2.2 + row * 2.6;
      this.placeStatic(b.prop, x, z);
      this.targets.push({
        id: `${this.id}:bullet:${i}`,
        action: { type: 'bullet', jobId: job.id, index: i },
        position: new THREE.Vector3(x, 0.8, z),
        radius: 1.5,
        hint: 'Inspect',
      });
    });

    // chest holding the Mark, back-centre
    this.buildChest(0, -this.halfD + 1.2);
    this.targets.push({
      id: `${this.id}:chest`,
      action: { type: 'chest', jobId: job.id },
      position: new THREE.Vector3(0, 0.6, -this.halfD + 1.2),
      radius: 1.6,
      hint: useGameStore.getState().marks[job.id] ? 'The chest is open' : 'Open the chest',
    });
  }

  private buildChest(x: number, z: number): void {
    const parts: Part[] = [
      { geo: new THREE.BoxGeometry(0.9, 0.55, 0.6), color: RAMP.wood[2], cast: true },
      { geo: new THREE.BoxGeometry(0.95, 0.1, 0.65), color: RAMP.gold[2], cast: true },
    ];
    parts[0].geo.translate(x, 0.28, z);
    parts[1].geo.translate(x, 0.5, z);
    for (const mesh of mergePartsByColor(parts)) {
      this.geoms.push(mesh.geometry);
      this.group.add(mesh);
    }
    const glow = new THREE.PointLight(new THREE.Color(RAMP.gold[4]), 0.8, 4, 2);
    glow.position.set(x, 0.8, z);
    this.lights.push(glow);
    this.group.add(glow);
  }

  // ── Hall of Sigils ─────────────────────────────────────────────────────────
  private buildSigils(): void {
    this.title = 'The Hall of Sigils';
    this.halfW = 9;
    this.halfD = 9;
    this.room('stone', 'stone', 4);

    const active = certs.filter((c) => c.status === 'active');
    const lapsed = certs.filter((c) => c.status === 'lapsed');

    // active pedestals along a runed aisle (two columns)
    active.forEach((cert, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const x = side * 2.6;
      const z = -this.halfD + 2 + row * 2.2;
      this.buildPedestal(cert, x, z, false);
    });

    // lapsed sigils in the sunken Alcove of Echoes (back, dim, cold)
    lapsed.forEach((cert, i) => {
      const x = (i - (lapsed.length - 1) / 2) * 2.2;
      const z = this.halfD - 2.5;
      this.buildPedestal(cert, x, z, true);
    });

    // The Archivist
    this.npc = buildNpc('teal', 7);
    this.npc.group.position.set(0, 0, -this.halfD + 1.5);
    this.group.add(this.npc.group);
    this.targets.push({
      id: 'sigils:npc',
      action: { type: 'npc', npc: 'The Archivist', section: 'sigils' },
      position: this.npc.group.position.clone().setY(0.8),
      radius: 1.8,
      hint: 'Speak with the Archivist',
    });
  }

  private buildPedestal(cert: Cert, x: number, z: number, lapsed: boolean): void {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 1.0, 7), toon(RAMP.stone[lapsed ? 1 : 3]));
    col.position.set(x, 0.5, z);
    col.castShadow = true;
    this.geoms.push(col.geometry);
    this.group.add(col);

    const tint = (RAMP as Record<string, readonly string[]>)[cert.ramp] ?? RAMP.stone;
    const quadMat = emissive(lapsed ? tint[1] : tint[3]);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), quadMat);
    quad.position.set(x, 1.5, z);
    this.geoms.push(quad.geometry);
    this.group.add(quad);
    this.sigilNodes.push({ cert, quad, baseY: 1.5, seed: x * 3 + z });

    if (!lapsed) {
      const light = new THREE.PointLight(new THREE.Color(tint[3]), 0.7, 4, 2);
      light.position.set(x, 1.6, z);
      this.lights.push(light);
      this.group.add(light);
    }

    this.targets.push({
      id: `sigil:${cert.id}`,
      action: { type: 'sigil', certId: cert.id },
      position: new THREE.Vector3(x, 1.0, z),
      radius: 1.5,
      hint: lapsed ? 'Examine the lapsed seal' : 'Take the sigil',
    });
  }

  // ── The Academy ────────────────────────────────────────────────────────────
  private buildAcademy(): void {
    this.title = 'The Academy';
    this.halfW = 9;
    this.halfD = 7;
    this.room('wood', 'wood', 3);

    education.forEach((edu, i) => {
      const x = (i - (education.length - 1) / 2) * 3.0;
      const z = -this.halfD + 3;
      this.placeStatic('scrollRack', x, z);
      this.targets.push({
        id: `edu:${edu.id}`,
        action: { type: 'education', eduId: edu.id },
        position: new THREE.Vector3(x, 0.8, z),
        radius: 1.5,
        hint: 'Read',
      });
    });

    this.npc = buildNpc('royal', 5);
    this.npc.group.position.set(0, 0, this.halfD - 2.5);
    this.group.add(this.npc.group);
    this.targets.push({
      id: 'academy:npc',
      action: { type: 'npc', npc: 'The Dean', section: 'academy' },
      position: this.npc.group.position.clone().setY(0.8),
      radius: 1.8,
      hint: 'Speak with the Dean',
    });
  }

  // ── dialogue openers (called by the Engine) ──────────────────────────────────
  openNpcDialogue(): void {
    const store = useGameStore.getState();
    let npc = 'Guildmaster';
    let lines: string[] = [];
    if (this.kind === 'job') {
      const job = jobById(this.id);
      if (job) {
        npc = job.guildmaster;
        lines = [job.signLine, `${job.role} · ${job.company}, ${job.dates}.`];
      }
    } else if (this.kind === 'sigils') {
      npc = 'The Archivist';
      const claimed = Object.values(store.sigils).filter(Boolean).length;
      lines = [
        `You've claimed ${claimed} of ${certs.length} sigils.`,
        'A lapsed seal is not a lost skill. It’s a renewal he hasn’t scheduled.',
      ];
    } else {
      npc = 'The Dean';
      lines = ['Every credential here was earned in service of the work, not instead of it.'];
    }
    this.dialogueIndex = 0;
    store.openPanel({ kind: 'dialogue', npc, lines, index: 0 });
  }

  openBullet(jobId: string, index: number): void {
    const job = jobById(jobId);
    if (!job) return;
    const b = job.bullets[index];
    if (!b) return;
    useGameStore.getState().openPanel({ kind: 'dialogue', npc: job.company, lines: [b.text], index: 0 });
  }

  update(t: number): void {
    this.npc?.update(t);
    for (const node of this.sigilNodes) {
      node.quad.position.y = node.baseY + Math.sin(t * 1.5 + node.seed) * 0.08;
      node.quad.rotation.y = t * 0.6;
    }
  }

  dispose(): void {
    this.npc?.dispose();
    for (const g of this.geoms) g.dispose();
    for (const l of this.lights) (l as THREE.PointLight).dispose?.();
    this.group.removeFromParent();
    void this.dialogueIndex;
  }
}
