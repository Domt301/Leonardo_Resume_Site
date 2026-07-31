// Synthesised audio (spec §16). No audio files — everything is WebAudio at
// runtime. Starts muted; an unmute control in the HUD flips settings.sound.
// A user gesture is required to start the AudioContext, so we lazily create it.

type Surface = 'grass' | 'stone' | 'wood';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = true;
  private ambient: { stop: () => void } | null = null;

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!muted) this.ensure();
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
    if (muted) this.stopAmbient();
    else this.startAmbient();
  }

  private ensure(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol = 0.3, slideTo?: number): void {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur);
  }

  private noise(dur: number, vol: number, freq: number): void {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
  }

  private stepFlip = false;
  footstep(surface: Surface): void {
    this.stepFlip = !this.stepFlip;
    const base = surface === 'stone' ? 240 : surface === 'wood' ? 180 : 140;
    this.noise(0.03, 0.12, base + (this.stepFlip ? 40 : 0));
  }

  interact(): void {
    this.blip(660, 0.06, 'triangle', 0.25, 990);
  }
  panel(open: boolean): void {
    this.blip(open ? 520 : 400, 0.04, 'square', 0.2, open ? 640 : 320);
  }
  markEarned(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this.blip(f, 0.12, 'square', 0.25), i * 90));
  }
  sigilClaimed(): void {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => setTimeout(() => this.blip(f, 0.12, 'square', 0.22), i * 90));
    setTimeout(() => this.noise(0.4, 0.08, 6000), 400);
  }

  private startAmbient(): void {
    if (this.ambient || this.muted) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55;
    g.gain.value = 0.04;
    osc.connect(g).connect(this.master);
    osc.start();
    this.ambient = {
      stop: () => {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      },
    };
  }
  private stopAmbient(): void {
    this.ambient?.stop();
    this.ambient = null;
  }

  dispose(): void {
    this.stopAmbient();
    void this.ctx?.close();
    this.ctx = null;
  }
}
