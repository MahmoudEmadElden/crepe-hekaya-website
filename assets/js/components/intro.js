/* ============================================================
   كريب حكاية — Crepe Hekaya
   Cinematic Movie Intro Loader Component
   ============================================================ */

import gsap from 'gsap';

export class IntroLoader {
  constructor() {
    this.loaderId = 'introLoader';
    this.hasRunKey = 'crepe_hekaya_intro_run';
    this.container = null;
  }

  show() {
    // Only play intro once per browser session to prevent user fatigue
    if (sessionStorage.getItem(this.hasRunKey)) {
      return;
    }

    // Create the overlay elements
    this.container = document.createElement('div');
    this.container.id = this.loaderId;
    this.container.style.cssText = `
      position: fixed;
      inset: 0;
      background: #121212;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #F5F5F7;
      overflow: hidden;
      direction: rtl;
    `;

    this.container.innerHTML = `
      <div class="intro-logo-wrapper" style="text-align: center; transform: translateY(20px); opacity: 0;">
        <div class="intro-logo-icon" style="font-size: 5.5rem; margin-bottom: 12px; display: inline-block;">🥙</div>
        <h1 style="font-weight: 900; font-size: 3rem; margin: 0; letter-spacing: 1px; color: #FF6B00;">كريب حكاية</h1>
        <p style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; color: #FFD166; letter-spacing: 4px; margin-top: 4px; text-transform: uppercase;">Crepe Hekaya</p>
      </div>
      <div class="intro-progress-bar" style="position: absolute; bottom: 8%; width: 220px; height: 3px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
        <div class="intro-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #FF6B00, #FFD166); border-radius: 4px;"></div>
      </div>
      <div class="intro-skip" style="position: absolute; bottom: 3%; font-size: 0.8rem; color: #6E6E73; cursor: pointer; text-decoration: underline;">تخطي العرض</div>
    `;

    document.body.appendChild(this.container);
    document.body.style.overflow = 'hidden';

    // Play cinematic swoosh sound
    this.playSwoosh();

    // GSAP Intro choreography
    const tl = gsap.timeline({
      onComplete: () => this.destroy()
    });

    tl.to('.intro-logo-wrapper', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out'
    })
    .to('.intro-logo-icon', {
      rotation: 360,
      scale: 1.15,
      duration: 2.2,
      ease: 'elastic.out(1, 0.4)'
    }, '-=0.5')
    .to('.intro-progress-fill', {
      width: '100%',
      duration: 2.5,
      ease: 'power2.inOut'
    }, '-=2.2')
    .to(this.container, {
      opacity: 0,
      scale: 1.1,
      duration: 0.8,
      ease: 'power3.inOut'
    });

    this.container.querySelector('.intro-skip').addEventListener('click', () => {
      tl.kill();
      this.destroy();
    });
  }

  playSwoosh() {
    // Generate a synthesis audio sound so we do not rely on heavy external files
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.8);

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);
    } catch (e) {
      console.warn('Synthesized intro sound failed', e);
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    document.body.style.overflow = '';
    sessionStorage.setItem(this.hasRunKey, 'true');
  }
}

export default IntroLoader;
