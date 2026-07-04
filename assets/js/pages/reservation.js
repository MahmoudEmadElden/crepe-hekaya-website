/* ============================================================
   كريب حكاية — Crepe Hekaya
   Table Reservation Page
   ============================================================ */

import { reservation } from '../core/reservation.js';
import { auth } from '../core/auth.js';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js';

export function render() {
  const isLoggedIn = auth.isLoggedIn();
  const user = auth.getUser();

  // Pre-fill fields if user is logged in
  const name = user ? user.name : '';
  const phone = user ? user.phone : '';

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">حجز طاولة في كريب حكاية</h1>
        <p class="page-subtitle">احجز مكانك المفضل الآن، صالة داخلية مكيفة أو جلسة خارجية بالهواء الطلق</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width:800px;">
        <div class="profile-card" style="background:var(--color-bg-card); border:1px solid var(--color-border); border-radius:var(--radius-2xl); padding:var(--space-2xl);">
          
          <form id="tableReservationForm" style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-header" style="text-align:center; margin-bottom:var(--space-md);">
              <h2 style="font-weight:900;">طلب حجز طاولة</h2>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">يرجى تحديد تفاصيل وقت وعدد ضيوف حجزك بالأسفل:</p>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">الاسم بالكامل</label>
                <input type="text" id="resName" class="notes-input" placeholder="اسم صاحب الحجز" value="${name}" required />
              </div>
              
              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">رقم الموبايل للتأكيد</label>
                <input type="tel" id="resPhone" class="notes-input" placeholder="01xxxxxxxxx" maxlength="11" value="${phone}" required />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">📅 تاريخ الحجز</label>
                <input type="date" id="resDate" class="notes-input" required />
              </div>

              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">🕐 وقت الحجز</label>
                <select id="resTime" class="notes-input" style="height:46px; background:var(--color-bg-input);" required>
                  <option value="" disabled selected>اختر الساعة</option>
                  <option value="12:00">12:00 م</option>
                  <option value="13:30">01:30 م</option>
                  <option value="15:00">03:00 م</option>
                  <option value="16:30">04:30 م</option>
                  <option value="18:00">06:00 م</option>
                  <option value="19:30">07:30 م</option>
                  <option value="21:00">09:00 م</option>
                  <option value="22:30">10:30 م</option>
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">👥 عدد الحضور</label>
                <select id="resGuests" class="notes-input" style="height:46px; background:var(--color-bg-input);">
                  <option value="1">فرد واحد</option>
                  <option value="2" selected>فردين</option>
                  <option value="3">3 أفراد</option>
                  <option value="4">4 أفراد</option>
                  <option value="5">5 أفراد</option>
                  <option value="6">عائلة (6 أفراد فأكثر)</option>
                </select>
              </div>

              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">موقع الجلسة</label>
                <select id="resZone" class="notes-input" style="height:46px; background:var(--color-bg-input);">
                  <option value="indoor" selected>صالة داخلية (مكيفة)</option>
                  <option value="outdoor">جلسة خارجية (هواء طلق)</option>
                  <option value="vip">ركن الـ VIP الخاص المتميز</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px; color:var(--color-text);">مناسبة أو ملاحظات إضافية (اختياري)</label>
              <textarea id="resNotes" class="notes-input" rows="3" placeholder="مثال: الاحتفال بعيد ميلاد، طاولة هادئة لشخصين، طلب كرسي أطفال..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full" style="margin-top:12px;">تأكيد حجز الطاولة الآن</button>
          </form>

        </div>
      </div>
    </section>
  `;
}

export function init() {
  // Set minimum date picker to today
  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Form submit handler
  document.getElementById('tableReservationForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playClick();

    const name = document.getElementById('resName').value;
    const phone = document.getElementById('resPhone').value;
    const date = document.getElementById('resDate').value;
    const time = document.getElementById('resTime').value;
    const guests = document.getElementById('resGuests').value;
    const zone = document.getElementById('resZone').value;
    const notes = document.getElementById('resNotes').value;

    const res = reservation.createReservation({ name, phone, date, time, guests, zone, notes });
    
    if (res.success) {
      sound.playSuccess();
      showSuccessModal(res.reservation);
    } else {
      sound.playError();
      showToast(res.message, 'error');
    }
  });
}

function showSuccessModal(res) {
  const modal = document.createElement('div');
  modal.className = 'order-modal show';
  
  const zoneText = res.zone === 'indoor' ? 'صالة داخلية' : (res.zone === 'vip' ? 'ركن VIP خاص' : 'جلسة خارجية');
  
  modal.innerHTML = `
    <div class="order-modal-content">
      <h2 style="color:var(--color-primary); font-weight:900;">تم حجز طاولتك بنجاح!</h2>
      <p style="margin:8px 0; color:var(--color-text-secondary);">يسعدنا استقبالك وخدمتك في كريب حكاية</p>
      
      <div style="background:var(--color-bg); padding:16px; border-radius:12px; margin:20px 0; text-align:right; font-size:var(--font-size-sm); color:var(--color-text-secondary); line-height:1.7;">
        <strong>رقم حجز الطاولة:</strong> <span style="color:var(--color-secondary); font-weight:800;">${res.id}</span><br>
        <strong>الاسم:</strong> <span>${res.name}</span><br>
        <strong>الموعد:</strong> <span>${res.date} الساعة ${res.time}</span><br>
        <strong>الضيوف:</strong> <span>${res.guests} أفراد (${zoneText})</span>
      </div>

      <button class="btn btn-primary btn-full" id="btnCloseResModal">حسناً، فهمت ✓</button>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('btnCloseResModal').addEventListener('click', () => {
    modal.remove();
    window.location.hash = '#/';
  });
}

export function destroy() {}
