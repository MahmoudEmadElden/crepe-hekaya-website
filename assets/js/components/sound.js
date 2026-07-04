/* ============================================================
   كريب حكاية — Crepe Hekaya
   Web Audio API Procedural Synthesized Sound System
   ============================================================ */

class SoundManager {
  constructor() {
    this.muteKey = 'crepe_hekaya_sound_muted';
    this.isMuted = this.loadMuted();
  }

  loadMuted() {
    return localStorage.getItem(this.muteKey) === 'true';
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem(this.muteKey, this.isMuted ? 'true' : 'false');
    return this.isMuted;
  }

  getAudioContext() {
    return new (window.AudioContext || window.webkitAudioContext)();
  }

  playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context blocked or unsupported
    }
  }

  playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Play a short happy 3-note arpeggio C4 -> E4 -> G4
      const playNote = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(523.25, now, 0.15);       // C5
      playNote(659.25, now + 0.12, 0.15); // E5
      playNote(783.99, now + 0.24, 0.3);  // G5
    } catch (e) {
      // Ignore audio blocks
    }
  }

  playError() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Ignore
    }
  }

  playOrderAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Resonant kitchen bell sequence (Ding - Ding - Ding!)
      const playBell = (freq, start, duration, vol = 0.25) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Bell 1: High crisp ding
      playBell(880, now, 0.6, 0.3);        // A5
      playBell(1760, now, 0.4, 0.15);      // Overtone
      // Bell 2: Higher urgent ding
      playBell(1046.5, now + 0.25, 0.7, 0.3); // C6
      playBell(2093, now + 0.25, 0.5, 0.15);  // Overtone
      // Bell 3: Long sustained kitchen call bell
      playBell(1318.51, now + 0.55, 1.4, 0.35); // E6
      playBell(2637, now + 0.55, 0.9, 0.15);    // Overtone
    } catch (e) {
      console.error('Audio alert error:', e);
    }
  }

  playSwoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Ignore
    }
  }
}

export const sound = new SoundManager();
export default sound;
