/* ============================================================
   كريب حكاية — Crepe Hekaya
   Shopping Cart State Manager & Coupon Engine
   ============================================================ */

class CartManager {
  constructor() {
    this.cartKey = 'crepe_hekaya_cart_new';
    this.couponKey = 'crepe_hekaya_active_coupon';
    this.items = this.loadCart();
    this.activeCoupon = this.loadCoupon();
    this.listeners = [];
  }

  loadCart() {
    const saved = localStorage.getItem(this.cartKey);
    return saved ? JSON.parse(saved) : [];
  }

  loadCoupon() {
    const saved = localStorage.getItem(this.couponKey);
    return saved ? JSON.parse(saved) : null;
  }

  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.items));
    this.notify();
  }

  saveCoupon() {
    if (this.activeCoupon) {
      localStorage.setItem(this.couponKey, JSON.stringify(this.activeCoupon));
    } else {
      localStorage.removeItem(this.couponKey);
    }
    this.notify();
  }

  addItem(item, qty = 1, selectedAdditions = [], notes = '', customDetails = null) {
    const additionIds = selectedAdditions.map(a => a.id).sort().join(',');
    
    // Check duplication
    const existingIndex = this.items.findIndex(i => 
      i.id === item.id && 
      i.notes === notes && 
      i.additions.map(a => a.id).sort().join(',') === additionIds &&
      JSON.stringify(i.customDetails) === JSON.stringify(customDetails)
    );

    if (existingIndex > -1) {
      this.items[existingIndex].qty += qty;
    } else {
      this.items.push({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        price: item.price,
        qty: qty,
        additions: selectedAdditions,
        notes: notes,
        image: item.image || 'special',
        customDetails: customDetails // for 3D Crepe builder configurations
      });
    }
    this.saveCart();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  updateQuantity(index, qty) {
    if (qty <= 0) {
      this.removeItem(index);
    } else {
      this.items[index].qty = qty;
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.activeCoupon = null;
    this.saveCart();
    this.saveCoupon();
  }

  getRawSubtotal() {
    return this.items.reduce((total, item) => {
      const additionsPrice = item.additions.reduce((sum, a) => sum + a.price, 0);
      return total + (item.price + additionsPrice) * item.qty;
    }, 0);
  }

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    const mockCoupons = {
      'HEKAYA10': { type: 'percent', value: 10, desc: 'خصم 10% على إجمالي الفاتورة' },
      'WELCOME20': { type: 'percent', value: 20, desc: 'خصم 20% للعملاء الجدد' },
      'FREECOLD': { type: 'fixed', value: 15, desc: 'خصم 15 ج.م قيمة الكولا المجانية' }
    };

    if (mockCoupons[cleanCode]) {
      this.activeCoupon = { code: cleanCode, ...mockCoupons[cleanCode] };
      this.saveCoupon();
      return { success: true, message: `تم تطبيق كوبون (${cleanCode}) بنجاح!`, coupon: this.activeCoupon };
    }
    return { success: false, message: 'عذراً، هذا الكوبون غير صحيح أو منتهي الصلاحية' };
  }

  removeCoupon() {
    this.activeCoupon = null;
    this.saveCoupon();
  }

  getCouponDiscount() {
    if (!this.activeCoupon) return 0;
    const subtotal = this.getRawSubtotal();
    if (this.activeCoupon.type === 'percent') {
      return Math.round(subtotal * (this.activeCoupon.value / 100));
    }
    return Math.min(this.activeCoupon.value, subtotal); // fixed value discount
  }

  getLoyaltyDiscount(user) {
    if (!user) return 0;
    const subtotal = this.getRawSubtotal();
    
    // Loyalty tiers: Bronze 0%, Silver 5%, Gold 10%, VIP 15%
    let discountPercent = 0;
    if (user.tier === 'silver') discountPercent = 5;
    else if (user.tier === 'gold') discountPercent = 10;
    else if (user.tier === 'vip') discountPercent = 15;

    return Math.round((subtotal - this.getCouponDiscount()) * (discountPercent / 100));
  }

  getFinalTotal(user = null) {
    const subtotal = this.getRawSubtotal();
    const couponDiscount = this.getCouponDiscount();
    const loyaltyDiscount = this.getLoyaltyDiscount(user);
    const finalTotal = subtotal - couponDiscount - loyaltyDiscount;
    return Math.max(0, finalTotal);
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  getItems() {
    return this.items;
  }

  getActiveCoupon() {
    return this.activeCoupon;
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.items));
  }
}

export const cart = new CartManager();
export default cart;
