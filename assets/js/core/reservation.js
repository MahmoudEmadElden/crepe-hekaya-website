/* ============================================================
   كريب حكاية — Crepe Hekaya
   Table Reservation State Coordinator
   ============================================================ */

class ReservationManager {
  constructor() {
    this.resKey = 'crepe_hekaya_table_reservations';
    this.reservations = this.loadReservations();
  }

  loadReservations() {
    const saved = localStorage.getItem(this.resKey);
    return saved ? JSON.parse(saved) : [
      // Seed some initial mock reservations for Admin view demo
      { id: 'res-101', name: 'أحمد محمود', phone: '01064319292', date: '2026-07-03', time: '19:30', guests: 4, zone: 'outdoor', notes: 'عيد ميلاد' },
      { id: 'res-102', name: 'سارة يوسف', phone: '01234567890', date: '2026-07-03', time: '21:00', guests: 2, zone: 'indoor', notes: 'طاولة بجوار النافذة' }
    ];
  }

  saveReservations() {
    localStorage.setItem(this.resKey, JSON.stringify(this.reservations));
  }

  createReservation({ name, phone, date, time, guests, zone, notes }) {
    if (!name || name.trim().length < 3) {
      return { success: false, message: 'الرجاء كتابة اسم الحجز بالكامل' };
    }
    const phoneRegex = /^01[0125]\d{8}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return { success: false, message: 'رقم الهاتف يجب أن يكون رقم موبايل مصري صحيح' };
    }
    if (!date) {
      return { success: false, message: 'الرجاء اختيار تاريخ الحجز' };
    }
    if (!time) {
      return { success: false, message: 'الرجاء اختيار وقت وتوقيت الحجز' };
    }

    const newRes = {
      id: 'res-' + Math.floor(Math.random() * 900 + 100),
      name: name.trim(),
      phone: phone.trim(),
      date,
      time,
      guests: parseInt(guests, 10) || 2,
      zone: zone || 'indoor',
      notes: (notes || '').trim()
    };

    // Check capacity mock: max 5 bookings per time slot
    const count = this.reservations.filter(r => r.date === date && r.time === time).length;
    if (count >= 5) {
      return { success: false, message: 'عذراً، هذا التوقيت ممتلئ تماماً بالكامل، يرجى اختيار ساعة أو يوم آخر' };
    }

    this.reservations.push(newRes);
    this.saveReservations();
    return { success: true, message: `تم تأكيد حجز طاولتك بنجاح! كود الحجز الخاص بك هو: ${newRes.id} 🍽️`, reservation: newRes };
  }

  getReservations() {
    return this.reservations;
  }

  getUserReservations(phone) {
    return this.reservations.filter(r => r.phone === phone);
  }

  cancelReservation(id) {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index > -1) {
      const deleted = this.reservations.splice(index, 1);
      this.saveReservations();
      return { success: true, message: `تم إلغاء الحجز رقم ${id} بنجاح` };
    }
    return { success: false, message: 'حذراً، لم يتم العثور على هذا الحجز' };
  }
}

export const reservation = new ReservationManager();
export default reservation;
