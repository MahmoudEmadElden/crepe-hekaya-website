/* ============================================================
   كريب حكاية — Crepe Hekaya
   Customer Profile & Loyalty Dashboard
   ============================================================ */

import { auth } from '../core/auth.js';
import { cart } from '../core/cart.js';
import { reservation } from '../core/reservation.js';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js';

export function render() {
  if (!auth.isLoggedIn()) {
    return `
      <section class="page-header">
        <div class="container">
          <h1 class="page-title">لوحة التحكم الشخصية 👤</h1>
          <p class="page-subtitle">سجل الدخول لاستعراض نقاطك، تفاصيل حجزك، ووصفات كريبك المفضلة</p>
        </div>
      </section>
      <section class="section">
        <div class="container" style="text-align:center;">
          <div style="font-size:4rem; margin-bottom:12px;">🔒</div>
          <h2>يرجى تسجيل الدخول أولاً</h2>
          <p style="color:var(--color-text-secondary); margin-bottom:20px;">يجب تسجيل حسابك لتصفح لوحة التحكم والاستفادة من نظام مكافآت حكاية</p>
          <a href="#/auth" class="btn btn-primary btn-lg">تسجيل الدخول / إنشاء حساب 👤</a>
        </div>
      </section>
    `;
  }

  const user = auth.getUser();
  const recipes = auth.getSavedRecipes();
  const resList = reservation.getUserReservations(user.phone);

  // Loyalty tier progress calculation
  // Bronze: 0-500, Silver: 500-1500, Gold: 1500-3000, VIP: >=3000
  let nextTier = 'فضية (Silver)';
  let progressPercent = 0;
  let gapAmount = 0;
  if (user.tier === 'bronze') {
    progressPercent = Math.min(100, (user.totalSpent / 500) * 100);
    gapAmount = 500 - user.totalSpent;
  } else if (user.tier === 'silver') {
    nextTier = 'ذهبية (Gold)';
    progressPercent = Math.min(100, ((user.totalSpent - 500) / 1000) * 100);
    gapAmount = 1500 - user.totalSpent;
  } else if (user.tier === 'gold') {
    nextTier = 'VIP الأسطورية';
    progressPercent = Math.min(100, ((user.totalSpent - 1500) / 1500) * 100);
    gapAmount = 3000 - user.totalSpent;
  } else {
    nextTier = 'أعلى مرتبة تم الوصول لها';
    progressPercent = 100;
  }

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">مرحباً بك يا ${user.name.split(' ')[0]}</h1>
        <p class="page-subtitle">تصفح رصيدك من النقاط، حجوزاتك الحالية، ووصفاتك ثلاثية الأبعاد المفضلة</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="display:flex; flex-direction:column; gap:var(--space-2xl);">
        
        <!-- Profile Overview Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h2 style="font-weight:900;">${user.name}</h2>
              <p style="color:var(--color-text-secondary); display:flex; gap:8px; align-items:center; margin-top:4px;">
                <span class="loyalty-rank rank-${user.tier}">كريب عائلة حكاية: ${user.tier.toUpperCase()}</span>
                <span>• رقم الهاتف: ${user.phone}</span>
              </p>
            </div>
          </div>

          <!-- Loyalty stats progress -->
          <div class="loyalty-progress-container">
            <div class="loyalty-stats-header">
              <strong style="color:var(--color-text);">الترقية للمرتبة القادمة: <span style="color:var(--color-primary);">${nextTier}</span></strong>
              <span style="font-family:'Outfit'; font-weight:800;">${Math.round(progressPercent)}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            ${gapAmount > 0 ? `
              <p class="progress-text">تبقّى لك طلبات بقيمة <strong style="color:var(--color-secondary); font-family:'Outfit';">${gapAmount} ج.م</strong> لرفع رتبتك والحصول على خصومات أكبر!</p>
            ` : `
              <p class="progress-text">تهانينا! لقد وصلت لأعلى رتبة خصومات في كريب حكاية (15% خصم ثابت على كافة الطلبات)</p></p>
            `}
          </div>

          <!-- Points balance row -->
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-top:var(--space-xl);">
            <div style="background:var(--color-bg); padding:var(--space-md); border-radius:var(--radius-lg); text-align:center; border:1px solid var(--color-border);">
              <span style="display:block; font-size:var(--font-size-xs); color:var(--color-text-muted);">رصيد النقاط:</span>
              <strong style="font-size:1.8rem; color:var(--color-secondary); font-family:'Outfit';">${user.points}</strong>
            </div>
            <div style="background:var(--color-bg); padding:var(--space-md); border-radius:var(--radius-lg); text-align:center; border:1px solid var(--color-border);">
              <span style="display:block; font-size:var(--font-size-xs); color:var(--color-text-muted);">إجمالي المشتريات:</span>
              <strong style="font-size:1.8rem; color:var(--color-primary); font-family:'Outfit';">${user.totalSpent} ج.م</strong>
            </div>
            <div style="background:var(--color-bg); padding:var(--space-md); border-radius:var(--radius-lg); text-align:center; border:1px solid var(--color-border);">
              <span style="display:block; font-size:var(--font-size-xs); color:var(--color-text-muted);">عدد الطلبات:</span>
              <strong style="font-size:1.8rem; color:var(--color-text); font-family:'Outfit';">${user.ordersCount}</strong>
            </div>
          </div>
        </div>

        <!-- Saved 3D Custom Recipes -->
        <div class="profile-card">
          <h2 style="font-weight:900; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">أصناف الكريب المفضلة لديك</h2>
          ${recipes.length === 0 ? `
            <div style="text-align:center; padding:30px 0; color:var(--color-text-secondary);">
              <p>لم تقم بإضافة أصناف مفضلة بعد</p>
              <a href="#/menu" class="btn btn-primary" style="margin-top:8px;">تصفح منيو كريب حكاية 9D الآن</a>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${recipes.map((rec, index) => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-md); background:var(--color-bg); border:1px solid var(--color-border); border-radius:var(--radius-lg);">
                  <div>
                    <h3 style="font-weight:800; font-size:var(--font-size-base); color:var(--color-secondary);">${rec.name}</h3>
                    <p style="font-size:0.75rem; color:var(--color-text-muted); margin-top:2px;">
                      تاريخ الصنع: ${rec.date} • ${rec.details.dough} • الإضافات: ${rec.details.toppings.join('، ') || 'بدون إضافات'}
                    </p>
                  </div>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <strong style="font-family:'Outfit'; font-size:var(--font-size-base); color:var(--color-primary); margin-left:12px;">${rec.details.price} ج.م</strong>
                    <button class="btn btn-primary btn-add-custom-recipe" data-index="${index}">طلب سريع</button>
                    <button class="btn btn-glass btn-delete-recipe" data-index="${index}" style="color:var(--color-danger); border-color:rgba(248,113,113,0.3);">حذف</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Reward points redeem area -->
        <div class="profile-card">
          <h2 style="font-weight:900; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">استبدال هدايا ومكافآت حكاية</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px;">
            
            <div style="background:var(--color-bg); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
              <h3 style="font-weight:800; font-size:var(--font-size-sm);">كانز بيبسي مجاني</h3>
              <p style="color:var(--color-text-muted); font-size:0.75rem; margin-top:2px;">تكلفة الاستبدال: 30 نقطة</p>
              <button class="btn btn-primary btn-redeem" data-cost="30" data-name="كانز بيبسي مجاني" style="margin-top:10px; font-size:var(--font-size-xs); padding:4px 12px;" ${user.points < 30 ? 'disabled' : ''}>استبدل الآن</button>
            </div>

            <div style="background:var(--color-bg); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
              <h3 style="font-weight:800; font-size:var(--font-size-sm);">باكيت بطاطس مقرمش</h3>
              <p style="color:var(--color-text-muted); font-size:0.75rem; margin-top:2px;">تكلفة الاستبدال: 50 نقطة</p>
              <button class="btn btn-primary btn-redeem" data-cost="50" data-name="باكيت بطاطس مقرمش" style="margin-top:10px; font-size:var(--font-size-xs); padding:4px 12px;" ${user.points < 50 ? 'disabled' : ''}>استبدل الآن</button>
            </div>

            <div style="background:var(--color-bg); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
              <h3 style="font-weight:800; font-size:var(--font-size-sm);">كوبون خصم 50 ج.م</h3>
              <p style="color:var(--color-text-muted); font-size:0.75rem; margin-top:2px;">تكلفة الاستبدال: 100 نقطة</p>
              <button class="btn btn-primary btn-redeem" data-cost="100" data-name="كوبون خصم 50 ج.م" style="margin-top:10px; font-size:var(--font-size-xs); padding:4px 12px;" ${user.points < 100 ? 'disabled' : ''}>استبدل الآن</button>
            </div>

          </div>
        </div>

        <div style="text-align:center;">
          <button class="btn btn-glass" id="btnDashboardLogout">تسجيل الخروج</button>
        </div>

      </div>
    </section>
  `;
}

export function init() {
  if (!auth.isLoggedIn()) return;

  // Logout action
  document.getElementById('btnDashboardLogout')?.addEventListener('click', () => {
    sound.playClick();
    auth.logout();
    showToast('تم تسجيل الخروج بنجاح', 'info');
    window.location.hash = '#/auth';
  });

  // Action: Add saved recipe to cart
  document.querySelectorAll('.btn-add-custom-recipe').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const idx = parseInt(btn.dataset.index, 10);
      const recipe = auth.getSavedRecipes()[idx];
      
      const mockItem = {
        id: 'custom-' + Math.floor(Math.random() * 900 + 100),
        name: recipe.name,
        nameEn: 'Custom 3D Recipe',
        price: 40, // Base dough price
        image: recipe.details.dough.includes('شوكولاتة') ? 'nutella' : 'special'
      };

      const toppingsList = recipe.details.toppings.map(tName => ({
        id: 'add-on',
        name: tName,
        price: 20 // average price
      }));

      cart.addItem(mockItem, 1, toppingsList, `وصفة مفضلة: ${recipe.details.dough}`);
      showToast(`تمت إضافة وصفتك (${recipe.name}) بنجاح إلى سلة الطلبات!`, 'cart');
      sound.playSuccess();
    });
  });

  // Action: Delete recipe
  document.querySelectorAll('.btn-delete-recipe').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const idx = parseInt(btn.dataset.index, 10);
      if (confirm('هل أنت متأكد من حذف هذه الوصفة من مفضلتك؟')) {
        auth.deleteRecipe(idx);
        showToast('تم حذف الوصفة بنجاح', 'info');
        refreshPage();
      }
    });
  });

  // Action: Redeem points
  document.querySelectorAll('.btn-redeem').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const cost = parseInt(btn.dataset.cost, 10);
      const name = btn.dataset.name;
      
      if (confirm(`هل ترغب في استبدال ${cost} نقطة مقابل الهدية: (${name})؟`)) {
        const res = auth.redeemReward(cost, name);
        if (res.success) {
          showToast(res.message, 'success');
          sound.playSuccess();
          refreshPage();
        } else {
          showToast(res.message, 'error');
          sound.playError();
        }
      }
    });
  });
}

function refreshPage() {
  const main = document.getElementById('mainContent');
  if (main) {
    main.innerHTML = render();
    init();
  }
}

export function destroy() {}
