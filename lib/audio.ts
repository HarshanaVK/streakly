class SoundEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.unlocked = true;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * Plays the iconic cinematic Netflix-style "TA-DUM" dual-hit resonance:
   * 1. "TA": Punchy percussive impact with sub-bass drop & metallic knock
   * 2. "DUM": Massive resonant sub-bass strike + wide orchestral chord shimmer
   */
  public playNetflixTaDum(enabled: boolean = true): void {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. "TA" - Anvil knock + sub transient
    this.playDrumHit(ctx, now, 120, 50, 0.18, 0.65);
    this.playMetallicTransient(ctx, now, 620, 0.12, 0.25);

    // 2. "DUM" (starts 220ms after "TA") - Deep sub-bass boom
    const dumTime = now + 0.22;
    this.playDrumHit(ctx, dumTime, 75, 36, 2.2, 0.85);

    // Orchestral / Metallic Shimmer Chord (D-major cinematic harmony)
    const chordFreqs = [73.42, 110.0, 146.83, 220.0, 277.18, 369.99, 440.0, 587.33];
    this.playShimmerChord(ctx, dumTime + 0.02, chordFreqs, 2.6);
  }

  public playIntroSignature(enabled: boolean = true): void {
    this.playNetflixTaDum(enabled);
  }

  /**
   * Plays a celebratory ascending Level-Up fanfare with celestial sparkles
   */
  public playLevelUp(enabled: boolean = true): void {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 261.63, t: 0.0 },   // C4
      { f: 329.63, t: 0.1 },   // E4
      { f: 392.00, t: 0.2 },   // G4
      { f: 523.25, t: 0.3 },   // C5
      { f: 659.25, t: 0.42 },  // E5
      { f: 783.99, t: 0.54 },  // G5
      { f: 1046.50, t: 0.68 }, // C6 (long hold)
    ];

    notes.forEach((n, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      const dur = idx === notes.length - 1 ? 1.2 : 0.18;
      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.linearRampToValueAtTime(0.18, now + n.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + dur + 0.05);
    });

    // Sub-bass support under the final peak note
    this.playDrumHit(ctx, now + 0.68, 130.81, 65.41, 1.2, 0.45);
  }

  private playMetallicTransient(
    ctx: AudioContext,
    startTime: number,
    freq: number,
    duration: number,
    volume: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(140, startTime + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, startTime);
    filter.Q.setValueAtTime(4, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private playDrumHit(
    ctx: AudioContext,
    startTime: number,
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playShimmerChord(
    ctx: AudioContext,
    startTime: number,
    frequencies: number[],
    duration: number
  ): void {
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.frequency.exponentialRampToValueAtTime(320, startTime + duration);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.11, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  public playTone(
    type: 'complete' | 'pet' | 'undo' | 'pop' = 'pop',
    enabled: boolean = true
  ): void {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.28);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'pet') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.22);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'undo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(311.13, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {}
  }

  public playGoalComplete(enabled: boolean = true): void {
    this.playTone('complete', enabled);
  }

  public playPetChirp(
    type: 'happy' | 'giggle' | 'sad' | 'pop' = 'happy',
    enabled: boolean = true
  ): void {
    if (type === 'sad') {
      this.playTone('undo', enabled);
    } else if (type === 'happy' || type === 'giggle') {
      this.playTone('pet', enabled);
    } else {
      this.playTone('pop', enabled);
    }
  }
}

export const soundEngine = new SoundEngine();
