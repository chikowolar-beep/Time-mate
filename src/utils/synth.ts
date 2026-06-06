/**
 * Web Audio API synthesizer for clean Material-like notification and countdown sounds.
 */

class SoundSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      // Create audio context on user interaction
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Play a soft click/success sound
  playBubble() {
    try {
      this.init();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  }

  // Play a success sound (for completing tasks or focus)
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }

  // Play notification ring for timer alarms or calls
  playAlarm() {
    try {
      this.init();
      if (!this.ctx) return;

      const playTone = (freq: number, start: number, duration: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = this.ctx.currentTime;
      // Trills
      playTone(587.33, now, 0.15); // D5
      playTone(698.46, now + 0.18, 0.15); // F5
      playTone(587.33, now + 0.36, 0.15); // D5
      playTone(880.00, now + 0.54, 0.35); // A5
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }

  // Water fill drop sound
  playWaterDrop() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }
}

export const synth = new SoundSynth();
