/* ============================================================
   كريب حكاية — Crepe Hekaya
   Centralized Real-Time Orders Database & Admin Manager
   Synchronizes Live Orders between User Checkout and Admin Dashboard
   ============================================================ */

class AdminManager {
  constructor() {
    this.invKey = 'crepe_hekaya_inventory';
    this.reviewsKey = 'crepe_hekaya_reviews';
    this.ordersKey = 'crepe_hekaya_orders_log';
    this.channelName = 'crepe_hekaya_live_channel';
    
    this.inventory = this.loadInventory();
    this.reviews = this.loadReviews();
    this.ordersLog = this.loadOrdersLog();
    this.listeners = [];

    // Setup real-time BroadcastChannel for live cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      this.liveChannel = new BroadcastChannel(this.channelName);
      this.liveChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'ORDERS_UPDATED') {
          const oldLen = this.ordersLog.length;
          this.ordersLog = this.loadOrdersLog();
          const isNew = event.data.isNewOrder || (this.ordersLog.length > oldLen);
          this.notifyListeners(isNew);
        }
      };
    }

    // Also listen to storage events (for older browser support or multiple windows)
    window.addEventListener('storage', (e) => {
      if (e.key === this.ordersKey) {
        const oldLen = this.ordersLog.length;
        this.ordersLog = this.loadOrdersLog();
        this.notifyListeners(this.ordersLog.length > oldLen);
      }
    });
  }

  loadInventory() {
    const saved = localStorage.getItem(this.invKey);
    return saved ? JSON.parse(saved) : {
      'chk-pane': 80,
      'chk-crispy': 60,
      'chk-strips': 45,
      'chk-zinger': 35,
      'mt-kofta': 50,
      'mt-sausage': 40,
      'cheese-mozz': 120, // in kg
      'veggies-mix': 85,  // in kg
      'nutella': 70       // jars
    };
  }

  loadReviews() {
    const saved = localStorage.getItem(this.reviewsKey);
    return saved ? JSON.parse(saved) : [
      { name: 'محمود الصاوي', comment: 'أحلى كريب استربس كلته في حياتي مقرمش والرانش تحفة!', stars: 5, date: '2026-07-01' },
      { name: 'ندى أحمد', comment: 'النوتيلا بالموز مليانة شيكولاته وجميلة جداً وتوصيل سريع', stars: 5, date: '2026-06-30' },
      { name: 'ياسر فاروق', comment: 'حبيشة وهمي مليان حشوات مشبعة، خدمة ممتازة جداً', stars: 4.8, date: '2026-06-29' }
    ];
  }

  loadOrdersLog() {
    const saved = localStorage.getItem(this.ordersKey);
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-101',
        customer: 'أحمد الصاوي',
        phone: '01012345678',
        address: 'أسيوط، شارع الجمهورية برج الأطباء',
        total: 220,
        date: '2026-07-02',
        time: '14:30',
        status: 'completed',
        items: 'كريب بانيه × 2، كريب نوتيلا × 1'
      },
      {
        id: 'ORD-102',
        customer: 'أماني خليل',
        phone: '01123456789',
        address: 'أسيوط، شارع الهلالي بجوار المستشفى',
        total: 105,
        date: '2026-07-02',
        time: '16:15',
        status: 'preparing',
        items: 'كريب استربس مقرمش × 1'
      },
      {
        id: 'ORD-103',
        customer: 'خالد مصطفى',
        phone: '01234567890',
        address: 'أسيوط، شارع الأزهر بجوار بهية',
        total: 310,
        date: '2026-07-02',
        time: '18:45',
        status: 'new',
        items: 'كريب الوحش × 2، باكيت بطاطس كبير × 2'
      }
    ];
  }

  saveInventory() {
    localStorage.setItem(this.invKey, JSON.stringify(this.inventory));
  }

  saveReviews() {
    localStorage.setItem(this.reviewsKey, JSON.stringify(this.reviews));
  }

  saveOrdersLog(isNewOrder = false) {
    localStorage.setItem(this.ordersKey, JSON.stringify(this.ordersLog));
    if (this.liveChannel) {
      this.liveChannel.postMessage({ type: 'ORDERS_UPDATED', isNewOrder });
    }
    this.notifyListeners(isNewOrder);
  }

  getInventory() {
    return this.inventory;
  }

  getReviews() {
    return this.reviews;
  }

  getOrdersLog() {
    return this.ordersLog;
  }

  deductStock(itemId, quantity = 1) {
    if (this.inventory[itemId]) {
      this.inventory[itemId] = Math.max(0, this.inventory[itemId] - quantity);
      this.saveInventory();
    }
  }

  addReview({ name, comment, stars }) {
    const newRev = {
      name: name || 'عميل مجهول',
      comment: comment || 'بدون تعليق',
      stars: parseFloat(stars) || 5,
      date: new Date().toISOString().split('T')[0]
    };
    this.reviews.unshift(newRev);
    this.saveReviews();
  }

  logOrder({ customerName, phone, address, total, itemsSummary }) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    const newOrd = {
      id: 'ORD-' + Math.floor(Math.random() * 9000 + 1000),
      customer: customerName || 'عميل حكاية',
      phone: phone || 'غير محدد',
      address: address || 'استلام من الفرع',
      total: total,
      date: now.toISOString().split('T')[0],
      time: timeStr,
      status: 'new', // الحالات: جديد (new)، قيد التحضير (preparing)، مكتمل (completed)
      items: itemsSummary
    };
    
    this.ordersLog.unshift(newOrd);
    this.saveOrdersLog(true);
    return newOrd;
  }

  updateOrderStatus(orderId, status) {
    const order = this.ordersLog.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrdersLog(false);
    }
  }

  getSalesStatistics() {
    const totalSales = this.ordersLog.reduce((sum, o) => sum + o.total, 0);
    const averageOrder = this.ordersLog.length ? Math.round(totalSales / this.ordersLog.length) : 0;
    const newOrdersCount = this.ordersLog.filter(o => o.status === 'new').length;
    return {
      totalSales,
      ordersCount: this.ordersLog.length,
      averageOrder,
      newOrdersCount,
      inventoryAlerts: Object.keys(this.inventory).filter(k => this.inventory[k] < 15).length
    };
  }

  onOrdersChange(cb) {
    this.listeners.push(cb);
  }

  notifyListeners(isNewOrder = false) {
    this.listeners.forEach(cb => cb(this.ordersLog, isNewOrder));
  }
}

export const admin = new AdminManager();
export default admin;
