/* ============================================================
   كريب حكاية — Crepe Hekaya
   Spin-to-Win Lucky Coupon Wheel Component
   ============================================================ */

import gsap from 'gsap';
import { showToast } from '../../../app.js';

export class LuckyWheel {
  constructor() {
    this.overlay = document.getElementById('wheelOverlay');
    this.canvas = null;
    this.ctx = null;
    this.isSpinning = false;
    this.prizes = [
      { text: 'خصم 10%', code: 'HEKAYA10', color: '#FF6B00' },
      { text: 'حظ سعيد', code: 'TRYAGAIN', color: '#252525' },
      { text: 'خصم 20%', code: 'WELCOME20', color: '#FFD166' },
      { text: 'حظ سعيد', code: 'TRYAGAIN', color: '#252525' },
      { text: 'كولا مجانية', code: 'FREECOLD', color: '#ff8c33' },
      { text: 'حظ سعيد', code: 'TRYAGAIN', color: '#252525' }
    ];
  }

  show() {
    if (!this.overlay) return;
    
    // Check if spun today
    const lastSpun = localStorage.getItem('crepe_hekaya_last_spin');
    const today = new Date().toDateString();
    if (lastSpun === today) {
      showToast('لقد قمت بلف العجلة اليوم بالفعل! عد غداً للمحاولة مجدداً 😉', 'warning');
      return;
    }

    this.overlay.innerHTML = `
      <div class="wheel-container">
        <h2 style="font-weight:900; color:var(--color-primary);">عجلة الحظ من حكاية 🎡</h2>
        <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">لف العجلة واربح كوبون خصم فوري أو هدية مجانية على طلبك!</p>
        
        <div class="wheel-canvas-wrapper">
          <div class="wheel-pointer"></div>
          <canvas id="wheelCanvas" width="280" height="280"></canvas>
        </div>

        <div style="display:flex; gap:12px; justify-content:center;">
          <button class="btn btn-primary" id="btnSpinWheel">لف العجلة الآن 🚀</button>
          <button class="btn btn-glass" id="btnCloseWheel">إغلاق</button>
        </div>
      </div>
    `;

    this.overlay.classList.add('show');
    this.canvas = document.getElementById('wheelCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.drawWheel(0);

    // Event listeners
    document.getElementById('btnSpinWheel').addEventListener('click', () => this.spin());
    document.getElementById('btnCloseWheel').addEventListener('click', () => this.hide());
  }

  drawWheel(angleOffset) {
    const size = this.canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const arc = Math.PI * 2 / this.prizes.length;

    this.ctx.clearRect(0, 0, size, size);
    
    // Draw outer glow border
    this.ctx.beginPath();
    this.ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
    this.ctx.fillStyle = '#181818';
    this.ctx.fill();
    this.ctx.strokeStyle = '#FF6B00';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    for (let i = 0; i < this.prizes.length; i++) {
      const angle = i * arc + angleOffset;
      this.ctx.beginPath();
      this.ctx.arc(center, center, radius, angle, angle + arc);
      this.ctx.lineTo(center, center);
      this.ctx.fillStyle = this.prizes[i].color;
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Text drawing
      this.ctx.save();
      this.ctx.translate(center, center);
      this.ctx.rotate(angle + arc / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = this.prizes[i].color === '#FFD166' ? '#121212' : '#F5F5F7';
      this.ctx.font = 'bold 12px Cairo';
      this.ctx.fillText(this.prizes[i].text, radius - 20, 4);
      this.ctx.restore();
    }

    // Inner core pin
    this.ctx.beginPath();
    this.ctx.arc(center, center, 24, 0, Math.PI * 2);
    this.ctx.fillStyle = '#121212';
    this.ctx.fill();
    this.ctx.strokeStyle = '#FFD166';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Pick a winning index that is NOT try again (we want customers to be happy!)
    const possibleWinners = [0, 2, 4];
    const winIndex = possibleWinners[Math.floor(Math.random() * possibleWinners.length)];
    
    const arc = Math.PI * 2 / this.prizes.length;
    // Calculate final rotation target angle
    // We want the winner index slice to land at the top pointer (angle = 3/2 * PI)
    const targetAngle = (Math.PI * 1.5) - (winIndex * arc) - (arc / 2);
    
    // Add multiple rotations for effect
    const finalRotations = targetAngle + Math.PI * 2 * 6; // 6 spins
    
    const spinObj = { angle: 0 };
    
    gsap.to(spinObj, {
      angle: finalRotations,
      duration: 4.5,
      ease: 'power4.out',
      onUpdate: () => {
        this.drawWheel(spinObj.angle);
      },
      onComplete: () => {
        this.isSpinning = false;
        const winner = this.prizes[winIndex];
        
        // Log to local storage
        localStorage.setItem('crepe_hekaya_last_spin', new Date().toDateString());
        
        // Save the code to clipboard or offer copy
        this.showWinnerModal(winner);
      }
    });
  }

  showWinnerModal(prize) {
    const modal = document.createElement('div');
    modal.className = 'order-modal show';
    modal.innerHTML = `
      <div class="order-modal-content">
        <div style="font-size:4rem; margin-bottom:12px;">🎉</div>
        <h2 style="color:var(--color-primary); font-weight:900;">تهانينا! لقد ربحت!</h2>
        <p style="margin:8px 0; color:var(--color-text-secondary);">لقد ربحت هدية: *${prize.text}* من كريب حكاية</p>
        
        <div style="background:var(--color-bg); padding:16px; border-radius:12px; margin:20px 0; font-family:'Outfit';">
          <span style="display:block; font-size:0.8rem; color:var(--color-text-muted);">كود الكوبون:</span>
          <strong id="prizeCodeText" style="font-size:1.8rem; letter-spacing:2px; color:var(--color-secondary);">${prize.code}</strong>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn btn-primary" id="btnCopyPrizeCode">نسخ الكود وتطبيق الخصم 📋</button>
          <button class="btn btn-glass" id="btnCloseWinnerModal">إغلاق</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btnCopyPrizeCode').addEventListener('click', () => {
      navigator.clipboard.writeText(prize.code);
      showToast('تم نسخ الكود وتطبيقه بنجاح! الصقه في خانة الكوبونات بالسلة.', 'success');
      modal.remove();
      this.hide();
    });

    document.getElementById('btnCloseWinnerModal').addEventListener('click', () => {
      modal.remove();
      this.hide();
    });
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.remove('show');
    }
  }
}

export default LuckyWheel;
