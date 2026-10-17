/**
 * Web Audio API procedural sound synthesizer for Dil Faraz Petroleum pump machine.
 * Zero external audio files or network requests required.
 */

class PetrolSoundEngine {
  private ctx: AudioContext | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopFuelFlowSound();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Electronic beep when pressing dispenser buttons or keypad
   */
  public playKeyBeep(frequency = 1200, duration = 0.08) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Solid mechanical metallic click when unholstering nozzle or pulling trigger
   */
  public playNozzleClack() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Crisp auto-shutoff trigger snap (when target liters reached or tank full)
   */
  public playAutoShutoffSnap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High snap click
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(880, now);
      snap.frequency.exponentialRampToValueAtTime(140, now + 0.09);

      snapGain.gain.setValueAtTime(0.25, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      snap.connect(snapGain);
      snapGain.connect(this.ctx.destination);

      snap.start(now);
      snap.stop(now + 0.09);

      // Low mechanical thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(160, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      thudGain.gain.setValueAtTime(0.3, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);

      thud.start(now);
      thud.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  /**
   * Continuous fuel flow sound (electric suction pump hum + liquid rushing through pipe)
   */
  public startFuelFlowSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.motorOsc) return; // Already running

      const now = this.ctx.currentTime;

      // 1. Motor hum
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc.type = 'sawtooth';
      this.motorOsc.frequency.setValueAtTime(95, now); // ~95Hz electric pump motor

      // Low-pass filter to make it sound muffled inside dispenser housing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      this.motorGain.gain.setValueAtTime(0.001, now);
      this.motorGain.gain.linearRampToValueAtTime(0.06, now + 0.2);

      this.motorOsc.connect(filter);
      filter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start(now);

      // 2. Liquid rushing white noise through hose
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.Q.setValueAtTime(1.2, now);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.001, now);
      this.noiseGain.gain.linearRampToValueAtTime(0.04, now + 0.3);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.ctx.destination);
      this.noiseNode.start(now);
    } catch {
      // Ignore
    }
  }

  public stopFuelFlowSound() {
    try {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        if (this.motorGain) {
          this.motorGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        }
        if (this.noiseGain) {
          this.noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        }
        setTimeout(() => {
          if (this.motorOsc) {
            try { this.motorOsc.stop(); } catch {}
            this.motorOsc.disconnect();
            this.motorOsc = null;
          }
          if (this.noiseNode) {
            try { this.noiseNode.stop(); } catch {}
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
        }, 200);
      }
    } catch {
      this.motorOsc = null;
      this.noiseNode = null;
    }
  }

  /**
   * Emergency ESD button sound
   */
  public playEmergencySiren() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.25);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }
}

export const soundEngine = new PetrolSoundEngine();
