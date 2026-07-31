import * as THREE from 'three';
import { Renderer } from './Renderer';
import { IsoCamera } from './IsoCamera';
import { Input } from './Input';
import { Picker } from './Picker';
import { Archipelago } from '../world/Archipelago';
import { Player } from '../character/Player';
import { Interior } from '../world/Interior';
import { AudioManager } from './Audio';
import { nearestTarget, type InteractionTarget, type InteractionAction } from '../world/Interactable';
import { runAction } from './actions';
import { disposeLabelTextures } from '../art/labelTexture';
import { useGameStore, gameState } from '../store/useGameStore';
import { islandById } from '../data/islands';
import { jobById } from '../data/jobs';

// The Engine (spec §3, §4). Boots three.js, runs a fixed-timestep loop fully
// decoupled from React, and bridges to the store imperatively. React renders the
// DOM UI; the Engine renders the canvas. Neither ticks the other.

const FIXED_DT = 1 / 60;
const MAX_FRAME = 0.1;
const TITLE_TARGET = new THREE.Vector3(0, 1, -1); // home island centre for the title postcard

export class Engine {
  private renderer: Renderer;
  private iso = new IsoCamera();
  private input = new Input();
  private picker = new Picker();
  private scene = new THREE.Scene();

  private archipelago = new Archipelago();
  private player = new Player();
  private interior: Interior | null = null;
  private mode: 'world' | 'interior' = 'world';

  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;

  private raf = 0;
  private last = 0;
  private acc = 0;
  private time = 0;
  private titleTime = 0;
  private running = false;
  private canvas: HTMLCanvasElement;

  private currentTarget: InteractionTarget | null = null;
  private unsub: (() => void)[] = [];
  private audio = new AudioManager();
  private stepFrames = 0;

  // arrival title card callback (set by GameApp)
  onTitleCard: (name: string, subtitle: string) => void = () => {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.scene.background = new THREE.Color('#243a55'); // warm deep-teal horizon, not near-black
    this.scene.add(this.archipelago.group);
    this.scene.add(this.player.root);

    // lighting (spec §4.3) — warm sunny key + bright sky fill
    this.sun = new THREE.DirectionalLight(new THREE.Color('#fff1d0'), 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 3.5; // soft PCF contact shadows
    this.sun.shadow.bias = -0.0004;
    const cam = this.sun.shadow.camera as THREE.OrthographicCamera;
    cam.left = -30;
    cam.right = 30;
    cam.top = 30;
    cam.bottom = -30;
    cam.near = 1;
    cam.far = 120;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.hemi = new THREE.HemisphereLight(new THREE.Color('#bcdcff'), new THREE.Color('#6b7a52'), 0.9);
    this.scene.add(this.hemi);

    this.applySettings();
    this.subscribeStore();
  }

  // ── lifecycle ────────────────────────────────────────────────────────────
  attachInput(): void {
    this.input.attach(this.canvas);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resize(w: number, h: number): void {
    this.renderer.setSize(w, h, gameState().settings.pixelSize);
    this.iso.resize(w / h);
  }

  private subscribeStore(): void {
    let prevPixel = gameState().settings.pixelSize;
    let prevAngle = gameState().settings.isoAngle;
    let prevSound = gameState().settings.sound;
    this.audio.setMuted(!prevSound);
    this.unsub.push(
      useGameStore.subscribe((s) => {
        if (s.settings.pixelSize !== prevPixel) {
          prevPixel = s.settings.pixelSize;
          this.renderer.setPixelSize(prevPixel);
        }
        if (s.settings.isoAngle !== prevAngle) {
          prevAngle = s.settings.isoAngle;
          this.iso.setElevationDeg(prevAngle);
        }
        if (s.settings.sound !== prevSound) {
          prevSound = s.settings.sound;
          this.audio.setMuted(!prevSound);
        }
      }),
    );
  }

  applySettings(): void {
    const s = gameState().settings;
    this.iso.setElevationDeg(s.isoAngle);
  }

  // ── entering the world ─────────────────────────────────────────────────────
  /** Initial setup after the canvas is sized. */
  init(spawnId: string, startPlaying: boolean): void {
    this.beginAt(spawnId, startPlaying);
    if (startPlaying) useGameStore.getState().setPhase('playing');
  }

  beginAt(islandId: string, showCard = false): void {
    this.mode = 'world';
    this.archipelago.setActive(islandId);
    const spawn = this.archipelago.spawnPoint(islandId);
    this.player.spawn(spawn.pos, spawn.tier);
    this.iso.setTargetInstant(spawn.pos);
    useGameStore.getState().setCurrentIsland(islandId);
    this.updateCameraBounds(islandId);
    this.applyThemeLighting(islandById(islandId)?.theme);
    if (showCard) this.showTitleFor(islandId);
  }

  /**
   * Warm, sunny world lighting with a little per-theme character so islands stay
   * distinct. Twilight (Rural Metro) intentionally stays dim + foggy.
   */
  private applyThemeLighting(theme: string | undefined): void {
    // warm golden-hour base
    this.sun.color.set('#ffe6ac');
    this.sun.intensity = 2.75;
    this.hemi.color.set('#f0e2c2');
    this.hemi.groundColor.set('#7e7a4c');
    this.hemi.intensity = 0.95;
    this.scene.fog = null;
    this.scene.background = new THREE.Color('#2c4a54');
    switch (theme) {
      case 'twilight':
        // a warm, readable dusk — dimmer and pinker than day, not black.
        // (No THREE.Fog: the ortho rig sits ~120u back, so distance fog would
        // haze the whole scene at once.)
        this.sun.color.set('#ffb069');
        this.sun.intensity = 2.1;
        this.hemi.color.set('#9a86b8');
        this.hemi.groundColor.set('#5a4a48');
        this.hemi.intensity = 1.0;
        this.scene.background = new THREE.Color('#3a2f52');
        break;
      case 'arcane':
        this.hemi.color.set('#a7dbe6');
        this.scene.background = new THREE.Color('#204a5a');
        break;
      case 'vault':
        this.sun.color.set('#ffe6b0');
        this.hemi.groundColor.set('#7a6a3c');
        break;
      case 'coastal':
        this.hemi.color.set('#cfeaff');
        this.scene.background = new THREE.Color('#1f4d70');
        break;
    }
  }

  /** Leave the title screen and begin play (spec §11.5). */
  beginGame(): void {
    this.iso.setHalfHeight(8);
    this.iso.setAzimuthInstant(Math.PI / 4);
    this.iso.setTargetInstant(this.player.position);
    useGameStore.getState().setPhase('playing');
    this.showTitleFor(this.archipelago.activeId);
  }

  fastTravel(islandId: string): void {
    if (this.interior) this.exitInterior(false);
    this.beginAt(islandId, true);
    useGameStore.getState().setPhase('playing');
  }

  // touch passthrough
  touchAxis(x: number, y: number): void {
    this.input.setTouchAxis(x, y);
  }
  touchInteract(): void {
    this.input.pushTouchAction('interact');
  }

  private updateCameraBounds(islandId: string): void {
    const b = this.archipelago.islandBounds(islandId);
    if (b) this.iso.setBounds(b.min, b.max);
  }

  private showTitleFor(islandId: string): void {
    const spec = islandById(islandId);
    if (!spec) return;
    const job = spec.contentId;
    let subtitle = '';
    if (job) {
      const j = jobById(job);
      if (j) subtitle = `${j.company} · ${j.location} · ${j.dates}`;
    }
    this.onTitleCard(spec.name, subtitle);
  }

  // ── interiors ──────────────────────────────────────────────────────────────
  enterInterior(interiorId: string, islandName: string): void {
    this.archipelago.group.visible = false;
    this.interior = new Interior(interiorId);
    this.scene.add(this.interior.group);
    this.mode = 'interior';
    const spawn = this.interior.spawn();
    this.player.spawn(spawn, 0);
    this.iso.setTargetInstant(spawn);
    this.iso.clearBounds();
    // dim the sun; interiors are lit by lanterns + fill
    this.sun.intensity = 0.5;
    this.hemi.intensity = 0.5;
    useGameStore.getState().enterInterior(interiorId);
    this.onTitleCard(this.interior.title, islandName);
  }

  exitInterior(showCard = true): void {
    if (!this.interior) return;
    this.scene.remove(this.interior.group);
    this.interior.dispose();
    this.interior = null;
    this.mode = 'world';
    this.archipelago.group.visible = true;
    const id = this.archipelago.activeId;
    this.applyThemeLighting(islandById(id)?.theme);
    const spawn = this.archipelago.spawnPoint(id);
    this.player.spawn(spawn.pos, spawn.tier);
    this.iso.setTargetInstant(spawn.pos);
    this.updateCameraBounds(id);
    useGameStore.getState().exitInterior();
    if (showCard) this.showTitleFor(id);
  }

  // ── main loop ────────────────────────────────────────────────────────────
  private loop = (): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    let frame = (now - this.last) / 1000;
    this.last = now;
    if (frame > MAX_FRAME) frame = MAX_FRAME;
    this.acc += frame;
    while (this.acc >= FIXED_DT) {
      this.step(FIXED_DT);
      this.acc -= FIXED_DT;
    }
    this.render();
  };

  private step(dt: number): void {
    const st = gameState();
    // reduced motion freezes time-based ambient (water, lanterns, sigils, NPCs)
    if (!st.settings.reducedMotion) this.time += dt;
    const interactive = st.phase === 'playing' && !st.panel;

    // discrete actions
    for (const a of this.input.drainActions()) {
      if (a === 'rotateCW') this.iso.rotate(1);
      else if (a === 'rotateCCW') this.iso.rotate(-1);
      else if (a === 'map' && st.phase === 'playing') useGameStore.getState().setPhase('map');
      else if (a === 'pause') {
        if (st.panel) useGameStore.getState().closePanel();
        else if (st.phase === 'playing') useGameStore.getState().setPhase('paused');
      } else if (a === 'interact' && interactive) this.activate();
    }

    // zoom
    const wheel = this.input.consumeWheel();
    if (wheel) this.iso.zoom(wheel * 0.8);

    // pointer pick (click-to-interact / move)
    const click = this.input.consumeClick();
    if (click && interactive) this.handleClick(click);

    // movement
    const sampler = this.sampler();
    if (interactive) {
      const axis = this.input.moveAxis(new THREE.Vector2());
      this.player.move(axis, this.iso.forward, this.iso.right, dt, sampler);
    } else {
      this.player.move(new THREE.Vector2(0, 0), this.iso.forward, this.iso.right, dt, sampler);
    }

    // footsteps
    if (this.player.moving) {
      this.stepFrames++;
      if (this.stepFrames >= 16) {
        this.stepFrames = 0;
        this.audio.footstep(this.mode === 'interior' ? 'wood' : 'grass');
      }
    } else {
      this.stepFrames = 15;
    }

    // world streaming + arrival detection
    if (this.mode === 'world') this.checkArrival();

    // proximity interaction hint
    if (interactive) this.updateHint();
    else if (st.hint) useGameStore.getState().setHint(null);

    // dynamic props
    if (this.mode === 'world') this.archipelago.update(this.time, dt);
    else this.interior?.update(this.time);
  }

  private sampler() {
    if (this.mode === 'interior' && this.interior) {
      return (x: number, z: number) => this.interior!.sample(x, z);
    }
    return (x: number, z: number) => this.archipelago.sample(x, z);
  }

  private targets(): InteractionTarget[] {
    return this.mode === 'interior' && this.interior ? this.interior.targets : this.archipelago.targets();
  }

  private checkArrival(): void {
    const s = this.archipelago.sample(this.player.position.x, this.player.position.z);
    if (s?.islandId && s.islandId !== this.archipelago.activeId) {
      this.archipelago.setActive(s.islandId);
      useGameStore.getState().setCurrentIsland(s.islandId);
      this.updateCameraBounds(s.islandId);
      this.applyThemeLighting(islandById(s.islandId)?.theme);
      this.showTitleFor(s.islandId);
    }
  }

  private updateHint(): void {
    const t = nearestTarget(this.targets(), this.player.position);
    this.currentTarget = t;
    const store = useGameStore.getState();
    if (t && store.hint !== t.hint) store.setHint(t.hint);
    else if (!t && store.hint) store.setHint(null);
  }

  private activate(): void {
    const t = this.currentTarget ?? nearestTarget(this.targets(), this.player.position);
    if (!t) return;
    this.player.triggerInteract();
    this.runAction(t.action);
  }

  private runAction(a: InteractionAction): void {
    runAction(a, {
      travel: (id) => this.fastTravel(id),
      enter: (interior, name) => this.enterInterior(interior, name),
      npc: () => this.interior?.openNpcDialogue(),
      bullet: (jobId, index) => this.interior?.openBullet(jobId, index),
      exit: () => this.exitInterior(),
      claim: () => this.player.triggerClaim(),
      sound: (k) => {
        if (k === 'panel') this.audio.panel(true);
        else if (k === 'interact') this.audio.interact();
        else if (k === 'mark') this.audio.markEarned();
        else if (k === 'sigil') this.audio.sigilClaimed();
      },
    });
  }

  private handleClick(ndc: THREE.Vector2): void {
    // if the click hits near an interaction target, walk toward + activate
    const ground = this.picker.groundPoint(ndc, this.iso.camera, this.player.position.y);
    if (!ground) return;
    let best: InteractionTarget | null = null;
    let bestD = Infinity;
    for (const t of this.targets()) {
      const d = t.position.distanceTo(ground);
      if (d < 1.5 && d < bestD) {
        best = t;
        bestD = d;
      }
    }
    if (best && best.position.distanceTo(this.player.position) <= best.radius) {
      this.currentTarget = best;
      this.player.triggerInteract();
      this.runAction(best.action);
    }
  }

  private render(): void {
    const st = gameState();
    if (st.phase === 'title') {
      // pulled-back, centred "postcard" of the home island, slowly rotating
      if (!st.settings.reducedMotion) this.titleTime += 1 / 60;
      this.iso.setHalfHeight(13);
      this.iso.setAzimuthInstant(Math.PI / 4 + this.titleTime * 0.05);
      this.iso.setTargetInstant(TITLE_TARGET);
    } else {
      this.iso.update(this.player.position, Math.min(0.05, FIXED_DT), st.settings.reducedMotion);
    }
    const dir = this.iso.keyLightDirection();
    this.sun.position.copy(this.player.position).addScaledVector(dir, 40);
    this.sun.target.position.copy(this.player.position);
    this.sun.target.updateMatrixWorld();
    this.renderer.render(this.scene, this.iso.camera);
  }

  dispose(): void {
    this.stop();
    this.unsub.forEach((u) => u());
    this.input.detach();
    this.interior?.dispose();
    this.archipelago.dispose();
    this.player.dispose();
    this.audio.dispose();
    disposeLabelTextures();
    this.sun.dispose();
    this.renderer.dispose();
  }
}
