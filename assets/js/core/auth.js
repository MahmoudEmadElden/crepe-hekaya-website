/* ============================================================
   كريب حكاية — Crepe Hekaya
   User Authentication, Profiles, Loyalty Tiers, & Custom Recipes (With Password support)
   ============================================================ */

class AuthManager {
  constructor() {
    this.userKey = 'crepe_hekaya_user_profile';
    this.recipesKey = 'crepe_hekaya_custom_recipes';
    this.dbKey = 'crepe_hekaya_users_db';
    this.adminKey = 'crepe_hekaya_admin_logged_in';

    this.user = this.loadUser();
    this.savedRecipes = this.loadRecipes();
    this.listeners = [];
  }

  loadUser() {
    const saved = localStorage.getItem(this.userKey);
    return saved ? JSON.parse(saved) : null;
  }

  loadRecipes() {
    const saved = localStorage.getItem(this.recipesKey);
    return saved ? JSON.parse(saved) : [];
  }

  loadDb() {
    const saved = localStorage.getItem(this.dbKey);
    return saved ? JSON.parse(saved) : [];
  }

  saveUser() {
    if (this.user) {
      localStorage.setItem(this.userKey, JSON.stringify(this.user));
      // Also update in all users database
      const db = this.loadDb();
      const idx = db.findIndex(u => u.phone === this.user.phone);
      if (idx > -1) {
        db[idx] = this.user;
      } else {
        db.push(this.user);
      }
      localStorage.setItem(this.dbKey, JSON.stringify(db));
    } else {
      localStorage.removeItem(this.userKey);
    }
    this.notify();
  }

  saveRecipes() {
    localStorage.setItem(this.recipesKey, JSON.stringify(this.savedRecipes));
  }

  register({ name, phone, password, address, area }) {
    if (!name || name.trim().length < 3) {
      return { success: false, message: 'الرجاء إدخال اسم صحيح مكون من 3 حروف على الأقل' };
    }
    const phoneRegex = /^01[0125]\d{8}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return { success: false, message: 'رقم الهاتف غير صحيح، يجب أن يكون رقم مصري مكون من 11 رقم يبدأ بـ 01' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'الرجاء إدخال كلمة مرور مكونة من 4 أرقام أو حروف على الأقل' };
    }
    if (!address || address.trim().length < 10) {
      return { success: false, message: 'الرجاء إدخال عنوان كامل بالتفصيل (الشارع، الدور، الشقة، علامة مميزة)' };
    }

    // Check if phone already registered
    const db = this.loadDb();
    if (db.some(u => u.phone === phone.trim())) {
      return { success: false, message: 'هذا الهاتف مسجل لدينا بالفعل! يرجى تسجيل الدخول بكتابة كلمة المرور.' };
    }

    // Default stats for new profile
    this.user = {
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim(),
      address: address.trim(),
      area: (area || '').trim(),
      totalSpent: 0,
      points: 20, // 20 welcome points!
      tier: 'bronze',
      ordersCount: 0
    };
    
    this.saveUser();
    return { success: true, message: 'تم إنشاء حسابك بنجاح! مرحباً بك في عائلة كريب حكاية.' };
  }

  login(phone, password) {
    const phoneRegex = /^01[0125]\d{8}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return { success: false, message: 'رقم الهاتف المكتوب غير صحيح' };
    }
    if (!password || password.trim().length === 0) {
      return { success: false, message: 'يرجى إدخال كلمة المرور لتسجيل الدخول' };
    }
    
    // Check in local users database
    const db = this.loadDb();
    const matched = db.find(u => u.phone === phone.trim());
    if (matched) {
      if (matched.password === password.trim()) {
        this.user = matched;
        this.notify();
        localStorage.setItem(this.userKey, JSON.stringify(this.user));
        return { success: true, message: `أهلاً بك مجدداً يا ${this.user.name} 👋` };
      } else {
        return { success: false, message: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى' };
      }
    }
    return { success: false, message: 'رقم الهاتف هذا غير مسجل لدينا، يرجى إنشاء حساب جديد أولاً' };
  }

  logout() {
    this.user = null;
    this.saveUser();
  }

  isLoggedIn() {
    return !!this.user;
  }

  getUser() {
    return this.user;
  }

  // Admin Session Manager
  isAdminLoggedIn() {
    return localStorage.getItem(this.adminKey) === 'true';
  }

  adminLogin(username, password) {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem(this.adminKey, 'true');
      return { success: true, message: 'تم تسجيل دخول المسؤول بنجاح! جاري تحويلك للوحة التحكم...' };
    }
    return { success: false, message: 'اسم المسؤول أو كلمة المرور غير صحيحة!' };
  }

  adminLogout() {
    localStorage.removeItem(this.adminKey);
  }

  // Update stats after a successful purchase is sent
  completePurchase(amount) {
    if (!this.user) return;
    this.user.totalSpent += amount;
    this.user.ordersCount += 1;
    // 1 point for every 10 L.E. spent
    const earnedPoints = Math.floor(amount / 10);
    this.user.points += earnedPoints;

    // Recalculate tier
    // Bronze: 0-500, Silver: 500-1500, Gold: 1500-3000, VIP: >= 3000
    if (this.user.totalSpent >= 3000) {
      this.user.tier = 'vip';
    } else if (this.user.totalSpent >= 1500) {
      this.user.tier = 'gold';
    } else if (this.user.totalSpent >= 500) {
      this.user.tier = 'silver';
    } else {
      this.user.tier = 'bronze';
    }

    this.saveUser();
    return earnedPoints;
  }

  redeemReward(pointsCost, rewardName) {
    if (!this.user) return { success: false, message: 'يجب تسجيل الدخول أولاً' };
    if (this.user.points < pointsCost) {
      return { success: false, message: 'رصيد نقاطك غير كافٍ لاستبدال هذه الهدية' };
    }

    this.user.points -= pointsCost;
    this.saveUser();
    return { success: true, message: `تهانينا! تم استبدال الهدية (${rewardName}) بنجاح. سيتم إرفاقها مع طلبك القادم 🎉` };
  }

  // Custom Crepe Recipes Saved by User
  saveRecipe(recipeName, details) {
    this.savedRecipes.push({
      name: recipeName,
      date: new Date().toLocaleDateString('ar-EG'),
      details: details
    });
    this.saveRecipes();
  }

  deleteRecipe(index) {
    this.savedRecipes.splice(index, 1);
    this.saveRecipes();
  }

  getSavedRecipes() {
    return this.savedRecipes;
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.user));
  }
}

export const auth = new AuthManager();
export default auth;
