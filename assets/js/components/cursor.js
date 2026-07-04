/* ============================================================
   كريب حكاية — Crepe Hekaya
   Lag-Free Premium Interactive Custom Cursor
   ============================================================ */

import gsap from 'gsap';

export class CustomCursor {
  constructor() {
    this.dot = document.getElementById('cursorDot');
    this.circle = document.getElementById('cursorCircle');
    this.isActive = false;
  }

  init() {
    if (!this.dot || !this.circle) return;
    this.isActive = true;

    // Set cursor positions to follow mouse coordinate speeds smoothly via GSAP quickTo
    const xToDot = gsap.quickTo(this.dot, 'x', { duration: 0.08, ease: 'power3' });
    const yToDot = gsap.quickTo(this.dot, 'y', { duration: 0.08, ease: 'power3' });
    
    const xToCircle = gsap.quickTo(this.circle, 'x', { duration: 0.35, ease: 'power3' });
    const yToCircle = gsap.quickTo(this.circle, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('mousemove', (e) => {
      if (!this.isActive) return;
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToCircle(e.clientX);
      yToCircle(e.clientY);
    });

    // Hover listeners
    this.attachHoverListeners();

    // Re-attach hover listeners when page routes trigger
    window.addEventListener('hashchange', () => {
      setTimeout(() => this.attachHoverListeners(), 300);
    });
  }

  attachHoverListeners() {
    const hoverables = document.querySelectorAll('a, button, input, textarea, select, .product-card, .addition-option, .tab-btn');
    
    hoverables.forEach(el => {
      el.removeEventListener('mouseenter', this.onMouseEnter);
      el.removeEventListener('mouseleave', this.onMouseLeave);
      
      el.addEventListener('mouseenter', this.onMouseEnter);
      el.addEventListener('mouseleave', this.onMouseLeave);
    });
  }

  onMouseEnter() {
    document.body.classList.add('cursor-hovering');
  }

  onMouseLeave() {
    document.body.classList.remove('cursor-hovering');
  }

  destroy() {
    this.isActive = false;
    document.body.classList.remove('cursor-hovering');
  }
}

export default CustomCursor;
