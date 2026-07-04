/* ============================================================
   كريب حكاية — Crepe Hekaya
   Admin Dashboard & Management Console (Takeaway & Delivery Customization)
   ============================================================ */

import { admin } from '../core/admin.js?v=9.4';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js?v=9.4';
import { menuItems, categories, addMenuItem, deleteMenuItem, dealsList, addDeal, deleteDeal } from '../data.js?v=9.4';
import { auth } from '../core/auth.js?v=9.4';

function getCustomersList(orders) {
  const map = {};
  orders.forEach(ord => {
    const phone = ord.phone || 'بدون هاتف';
    if (!map[phone]) {
      map[phone] = {
        name: ord.customer || 'عميل حكاية',
        phone: phone,
        address: ord.address || 'استلام من الفرع (تيك أواي)',
        ordersCount: 0,
        totalSpent: 0,
        lastDate: ord.date || ''
      };
    }
    map[phone].ordersCount += 1;
    map[phone].totalSpent += (ord.total || 0);
    if (ord.address && !ord.address.includes('استلام')) {
      map[phone].address = ord.address;
    }
  });
  return Object.values(map);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function render() {
  // If admin is not logged in, render the login form
  if (!auth.isAdminLoggedIn()) {
    return `
      <section class="page-header">
        <div class="container">
          <h1 class="page-title">تسجيل دخول الإدارة 🔑</h1>
          <p class="page-subtitle">لوحة التحكم محمية. يرجى إدخال بيانات المسؤول للمتابعة</p>
        </div>
      </section>

      <section class="section" style="background:var(--color-bg-deep);">
        <div class="container" style="max-width:450px;">
          <div class="profile-card">
            <h2 style="font-weight:900; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px; text-align:center;">لوحة تحكم كريب حكاية</h2>
            
            <form id="adminLoginForm" style="display:flex; flex-direction:column; gap:16px;">
              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">👤 اسم المسؤول (Username):</label>
                <input type="text" id="adminUser" class="notes-input" placeholder="اسم المستخدم الافتراضي: admin" required />
              </div>
              
              <div class="form-group">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">🔑 كلمة مرور المسؤول (Password):</label>
                <input type="password" id="adminPass" class="notes-input" placeholder="كلمة المرور الافتراضية: admin" required />
              </div>

              <button type="submit" class="btn btn-primary btn-lg btn-full" style="margin-top:10px;">تسجيل دخول الإدارة 🚀</button>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  const stats = admin.getSalesStatistics();
  const orders = admin.getOrdersLog();
  const customersList = getCustomersList(orders);

  return `
    <section class="page-header">
      <div class="container" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 class="page-title">لوحة تحكم إدارة كريب حكاية (تيك أواي & دليفري)</h1>
          <p class="page-subtitle">متابعة المبيعات الحية، معالجة طلبات التوصيل والاستلام الفوري، وسجل بيانات العملاء</p>
        </div>
        <button id="btnAdminLogout" class="btn btn-glass" style="color:var(--color-danger); border-color:rgba(248,113,113,0.3); font-weight:800; padding:10px 20px;">
          تسجيل خروج الإدارة 👋
        </button>
      </div>
    </section>

    <section class="section">
      <div class="container" style="display:flex; flex-direction:column; gap:var(--space-2xl);">
        
        <!-- Data storage info notice -->
        <div style="background:rgba(212,168,67,0.08); border:1px solid rgba(212,168,67,0.3); padding:16px; border-radius:12px; font-size:var(--font-size-sm); color:var(--color-text-secondary); line-height:1.6;">
          <strong>💡 نظام حفظ البيانات:</strong> يتم تخزين كافة البيانات الحالية (الطلبات، سجلات العملاء، المنيو المعدل) بأمان داخل الذاكرة المحلية لمتصفحك (Local Storage). يمكنك استخدام أزرار التصدير أدناه لتحميل نسخة Excel فورية من ملفاتك.
        </div>

        <!-- Admin Statistics Row -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
            <span style="font-size:0.75rem; color:var(--color-text-muted); display:block; font-weight:700;">إجمالي حجم المبيعات:</span>
            <strong style="font-size:1.8rem; color:var(--color-success); font-family:'Outfit';">${stats.totalSales} ج.م</strong>
          </div>
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
            <span style="font-size:0.75rem; color:var(--color-text-muted); display:block; font-weight:700;">عدد الطلبات النشطة:</span>
            <strong style="font-size:1.8rem; color:var(--color-primary); font-family:'Outfit';">${stats.ordersCount} طلب</strong>
          </div>
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
            <span style="font-size:0.75rem; color:var(--color-text-muted); display:block; font-weight:700;">متوسط قيمة الطلب:</span>
            <strong style="font-size:1.8rem; color:var(--color-secondary); font-family:'Outfit';">${stats.averageOrder} ج.م</strong>
          </div>
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-lg); border-radius:var(--radius-xl); text-align:center;">
            <span style="font-size:0.75rem; color:var(--color-text-muted); display:block; font-weight:700;">إجمالي العملاء المسجلين:</span>
            <strong style="font-size:1.8rem; color:var(--color-text); font-family:'Outfit';">${customersList.length} عميل</strong>
          </div>
        </div>

        <!-- SVG Sales Chart -->
        <div class="profile-card">
          <h2 style="font-weight:900; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">تقرير مبيعات التيك أواي والدليفري الأسبوعي</h2>
          <div style="width:100%; height:200px; display:flex; align-items:flex-end; justify-content:space-between; padding-top:20px; border-bottom:2px solid var(--color-border); padding-left:20px; padding-right:20px; direction:ltr;">
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-primary); width:32px; height:120px; border-radius:6px 6px 0 0; box-shadow:var(--shadow-glow);"></div>
              <span style="font-size:0.75rem; color:var(--color-text-muted); margin-top:8px; font-family:'Outfit';">الجمعة</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-primary); width:32px; height:90px; border-radius:6px 6px 0 0;"></div>
              <span style="font-size:0.75rem; color:var(--color-text-muted); margin-top:8px; font-family:'Outfit';">السبت</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-primary); width:32px; height:140px; border-radius:6px 6px 0 0; box-shadow:var(--shadow-glow);"></div>
              <span style="font-size:0.75rem; color:var(--color-text-muted); margin-top:8px; font-family:'Outfit';">الأحد</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-primary); width:32px; height:60px; border-radius:6px 6px 0 0;"></div>
              <span style="font-size:0.75rem; color:var(--color-text-muted); margin-top:8px; font-family:'Outfit';">الاثنين</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-primary); width:32px; height:160px; border-radius:6px 6px 0 0; box-shadow:var(--shadow-glow);"></div>
              <span style="font-size:0.75rem; color:var(--color-text-muted); margin-top:8px; font-family:'Outfit';">الثلاثاء</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-primary); width:32px; height:110px; border-radius:6px 6px 0 0;"></div>
              <span style="font-size:0.75rem; color:var(--color-text-muted); margin-top:8px; font-family:'Outfit';">الأربعاء</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
              <div style="background:var(--color-secondary); width:32px; height:180px; border-radius:6px 6px 0 0; box-shadow:0 0 15px rgba(255,209,102,0.4);"></div>
              <span style="font-size:0.75rem; color:var(--color-text); margin-top:8px; font-weight:800; font-family:'Outfit';">اليوم</span>
            </div>
          </div>
        </div>

        <!-- Orders Management Board -->
        <div class="profile-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">
            <h2 style="font-weight:900; margin:0;">إدارة طلبات التيك أواي والدليفري الواردة لحظياً (Live Orders)</h2>
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="background:rgba(251,191,36,0.15); color:var(--color-warning); padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:800;">
                طلبات جديدة: ${orders.filter(o => o.status === 'new').length}
              </span>
              <button id="btnExportOrders" class="btn btn-glass" style="padding:6px 14px; font-size:0.8rem; font-weight:800; border-color:var(--color-success); color:var(--color-success); transition:all 0.2s;">
                تصدير الطلبات Excel
              </button>
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:right; font-size:var(--font-size-sm);">
              <thead>
                <tr style="border-bottom:1px solid var(--color-border); color:var(--color-text-muted);">
                  <th style="padding:12px 8px;">رقم والوقت</th>
                  <th style="padding:12px 8px;">بيانات العميل والتوصيل</th>
                  <th style="padding:12px 8px;">الأصناف المطلوب تجهيزها</th>
                  <th style="padding:12px 8px;">الإجمالي</th>
                  <th style="padding:12px 8px;">تحديث الحالة</th>
                  <th style="padding:12px 8px; text-align:center;">طباعة بونات الكاشير/المطبخ</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(ord => {
                  const statusColors = {
                    new: 'rgba(255,87,34,0.2); color:#ff5722; font-weight:800; border:1px solid #ff5722;',
                    preparing: 'rgba(251,191,36,0.15); color:var(--color-warning)',
                    completed: 'rgba(52,211,153,0.15); color:var(--color-success)'
                  };
                  const isNew = ord.status === 'new';
                  const cleanPhone = (ord.phone || '').replace(/[^0-9]/g, '');
                  return `
                    <tr style="border-bottom:1px solid var(--color-border); ${isNew ? 'background:rgba(255,138,0,0.05);' : ''}">
                      <td style="padding:12px 8px;">
                        <strong style="font-family:'Outfit'; font-weight:800; color:var(--color-secondary); display:block;">${ord.id}</strong>
                        <span style="font-size:0.75rem; color:var(--color-text-muted);">${ord.time || ord.date}</span>
                      </td>
                      <td style="padding:12px 8px;">
                        <strong style="font-weight:800; color:var(--color-text);">${escapeHTML(ord.customer)}</strong>
                        <div style="font-size:0.78rem; color:var(--color-text-secondary); margin-top:4px;">
                          هاتف: <a href="tel:${cleanPhone}" style="color:var(--color-secondary); text-decoration:none;">${escapeHTML(ord.phone || 'غير محدد')}</a><br>
                          عنوان: ${escapeHTML(ord.address || 'استلام فرع (تيك أواي)')}
                        </div>
                      </td>
                      <td style="padding:12px 8px; color:var(--color-text-secondary); max-width:260px; font-size:0.82rem; line-height:1.5;">${escapeHTML(ord.items)}</td>
                      <td style="padding:12px 8px; font-family:'Outfit'; font-weight:800; color:var(--color-primary); font-size:1.1rem;">${ord.total} ج.م</td>
                      <td style="padding:12px 8px;">
                        <select class="notes-input select-order-status" data-id="${ord.id}" style="height:36px; font-size:0.8rem; border-radius:8px; background:var(--color-bg-input); padding:0 8px; cursor:pointer; ${statusColors[ord.status] || ''}">
                          <option value="new" ${ord.status === 'new' ? 'selected' : ''}>جديد</option>
                          <option value="preparing" ${ord.status === 'preparing' ? 'selected' : ''}>قيد التحضير</option>
                          <option value="completed" ${ord.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                        </select>
                      </td>
                      <td style="padding:12px 8px; text-align:center;">
                        <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
                          <button class="btn btn-glass btn-print-invoice" data-id="${ord.id}" style="padding:4px 10px; font-size:0.75rem; color:var(--color-secondary); border-color:rgba(255,209,102,0.3);">
                            📄 بون التوصيل
                          </button>
                          <button class="btn btn-glass btn-print-kitchen" data-id="${ord.id}" style="padding:4px 10px; font-size:0.75rem; color:#60A5FA; border-color:rgba(96,165,250,0.3);">
                            🍳 بون المطبخ
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Menu Management Board -->
        <div class="profile-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">
            <h2 style="font-weight:900; margin:0;">إدارة أصناف المنيو (إضافة / حذف أصناف)</h2>
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="background:rgba(16,185,129,0.15); color:var(--color-success); padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:800;">
                إجمالي الأصناف: ${menuItems.length} صنف
              </span>
              <button id="btnExportMenu" class="btn btn-glass" style="padding:6px 14px; font-size:0.8rem; font-weight:800; border-color:var(--color-success); color:var(--color-success); transition:all 0.2s;">
                تصدير المنيو Excel
              </button>
            </div>
          </div>

          <!-- Add New Product Form -->
          <form id="formAddProduct" style="background:var(--color-bg); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); margin-bottom:var(--space-xl); display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; align-items:end;">
            <div style="grid-column: 1 / -1; font-weight:800; color:var(--color-primary); border-bottom:1px solid var(--color-border); padding-bottom:8px; margin-bottom:8px;">
              إضافة صنف جديد للمنيو (كريب، بطاطس، أو مشروبات)
            </div>
            
            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">اسم الصنف (بالعربية)</label>
              <input type="text" id="addProdName" class="notes-input" placeholder="مثال: عصير مانجو طبيعي" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">اسم الصنف (بالإنجليزية)</label>
              <input type="text" id="addProdNameEn" class="notes-input" placeholder="مثال: Fresh Mango Juice" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">القسم / الفئة</label>
              <select id="addProdCategory" class="notes-input" style="height:44px; padding:0 12px;" required>
                ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">السعر (ج.م)</label>
              <input type="number" id="addProdPrice" class="notes-input" placeholder="مثال: 35" min="1" required />
            </div>

            <div class="form-group" style="grid-column: span 2;">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">المكونات / المواصفات (مفصولة بفواصل ,)</label>
              <input type="text" id="addProdIngredients" class="notes-input" placeholder="مثال: مانجو طبيعي طازج, مثلج, بدون سكر مضاف" required />
            </div>

            <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; margin-top:8px;">
              <button type="submit" class="btn btn-primary" style="padding:10px 24px; font-weight:800;">إضافة الصنف للمنيو</button>
            </div>
          </form>

          <!-- Menu Items Table -->
          <div style="overflow-y:auto; max-height:400px; border:1px solid var(--color-border); border-radius:12px;">
            <table style="width:100%; border-collapse:collapse; text-align:right; font-size:var(--font-size-sm);">
              <thead>
                <tr style="background:var(--color-bg); border-bottom:1px solid var(--color-border); color:var(--color-text-muted);">
                  <th style="padding:12px 8px;">الصنف</th>
                  <th style="padding:12px 8px;">القسم</th>
                  <th style="padding:12px 8px;">السعر</th>
                  <th style="padding:12px 8px;">المكونات</th>
                  <th style="padding:12px 8px; text-align:center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${menuItems.map(item => {
                  const catObj = categories.find(c => c.id === item.category);
                  return `
                    <tr style="border-bottom:1px solid var(--color-border);">
                      <td style="padding:12px 8px;">
                        <strong style="color:var(--color-text);">${escapeHTML(item.name)}</strong>
                        <div style="font-size:0.75rem; color:var(--color-text-muted);">${escapeHTML(item.nameEn)}</div>
                      </td>
                      <td style="padding:12px 8px;">
                        <span style="color:${catObj?.color || 'var(--color-text-secondary)'}; font-weight:700;">${catObj?.name || item.category}</span>
                      </td>
                      <td style="padding:12px 8px; font-family:'Outfit'; font-weight:800; color:var(--color-primary);">${item.price} ج.م</td>
                      <td style="padding:12px 8px; font-size:0.75rem; color:var(--color-text-secondary); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHTML((item.ingredients || []).join(', '))}">
                        ${escapeHTML((item.ingredients || []).join(', '))}
                      </td>
                      <td style="padding:12px 8px; text-align:center;">
                        <button class="btn btn-glass btn-delete-product" data-id="${item.id}" style="padding:4px 10px; font-size:0.75rem; color:#F87171; border-color:rgba(248,113,113,0.3);">
                          حذف الصنف
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Offers Management Board -->
        <div class="profile-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">
            <h2 style="font-weight:900; margin:0;">إدارة عروض المطعم (إضافة / حذف عروض)</h2>
            <span style="background:rgba(16,185,129,0.15); color:var(--color-success); padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:800;">
              إجمالي العروض: ${dealsList.length} عرض
            </span>
          </div>

          <!-- Add New Offer Form -->
          <form id="formAddOffer" style="background:var(--color-bg); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); margin-bottom:var(--space-xl); display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; align-items:end;">
            <div style="grid-column: 1 / -1; font-weight:800; color:var(--color-primary); border-bottom:1px solid var(--color-border); padding-bottom:8px; margin-bottom:8px;">
              إضافة عرض وجبة ترويجي جديد
            </div>
            
            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">اسم العرض (بالعربية)</label>
              <input type="text" id="addOfferName" class="notes-input" placeholder="مثال: عرض القرمشة" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">اسم العرض (بالإنجليزية)</label>
              <input type="text" id="addOfferNameEn" class="notes-input" placeholder="مثال: Crunchy Offer" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">الوصف المختصر</label>
              <input type="text" id="addOfferDesc" class="notes-input" placeholder="مثال: كريب سوبر كرانشي + بيبسي" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">محتويات العرض (مفصولة بـ ,)</label>
              <input type="text" id="addOfferContents" class="notes-input" placeholder="مثال: كريب كرانشي × 1, بيبسي × 1" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">السعر الحالي (ج.م)</label>
              <input type="number" id="addOfferPrice" class="notes-input" placeholder="مثال: 120" min="1" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">السعر قبل الخصم (ج.م)</label>
              <input type="number" id="addOfferOldPrice" class="notes-input" placeholder="مثال: 150" min="1" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">الوسم (Badge)</label>
              <input type="text" id="addOfferBadge" class="notes-input" placeholder="مثال: توفير أو عرض محدود" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">لون العرض (رمز اللون)</label>
              <select id="addOfferColor" class="notes-input" style="height:44px; padding:0 12px;" required>
                <option value="#e67e22">برتقالي (توفير)</option>
                <option value="#e74c3c">أحمر (عرض خاص)</option>
                <option value="#1abc9c">أخضر (الأكثر طلباً)</option>
              </select>
            </div>

            <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; margin-top:8px;">
              <button type="submit" class="btn btn-primary" style="padding:10px 24px; font-weight:800;">إضافة العرض الجديد</button>
            </div>
          </form>

          <!-- Offers Table -->
          <div style="overflow-y:auto; max-height:400px; border:1px solid var(--color-border); border-radius:12px;">
            <table style="width:100%; border-collapse:collapse; text-align:right; font-size:var(--font-size-sm);">
              <thead>
                <tr style="background:var(--color-bg); border-bottom:1px solid var(--color-border); color:var(--color-text-muted);">
                  <th style="padding:12px 8px;">العرض</th>
                  <th style="padding:12px 8px;">الوصف</th>
                  <th style="padding:12px 8px;">السعر الحالي</th>
                  <th style="padding:12px 8px;">السعر القديم</th>
                  <th style="padding:12px 8px; text-align:center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${dealsList.map(deal => {
                  return `
                    <tr style="border-bottom:1px solid var(--color-border);">
                      <td style="padding:12px 8px;">
                        <strong style="color:var(--color-text);">${escapeHTML(deal.name)}</strong>
                        <div style="font-size:0.75rem; color:var(--color-text-muted);">${escapeHTML(deal.nameEn)}</div>
                      </td>
                      <td style="padding:12px 8px; font-size:0.75rem; color:var(--color-text-secondary); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHTML(deal.description)}">
                        ${escapeHTML(deal.description)}
                      </td>
                      <td style="padding:12px 8px; font-family:'Outfit'; font-weight:800; color:var(--color-success);">${deal.price} ج.م</td>
                      <td style="padding:12px 8px; font-family:'Outfit'; font-weight:800; color:var(--color-text-muted); text-decoration:line-through;">${deal.oldPrice} ج.م</td>
                      <td style="padding:12px 8px; text-align:center;">
                        <button class="btn btn-glass btn-delete-offer" data-id="${deal.id}" style="padding:4px 10px; font-size:0.75rem; color:#F87171; border-color:rgba(248,113,113,0.3);">
                          حذف العرض
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Customers CRM Board -->
        <div class="profile-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--color-border); padding-bottom:12px;">
            <h2 style="font-weight:900; margin:0;">سجل عملاء المطعم وبيانات التوصيل (العملاء المسجلين)</h2>
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="background:rgba(255,138,0,0.15); color:var(--color-primary); padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:800;">
                إجمالي العملاء: ${customersList.length} عميل
              </span>
              <button id="btnExportCustomers" class="btn btn-glass" style="padding:6px 14px; font-size:0.8rem; font-weight:800; border-color:var(--color-success); color:var(--color-success); transition:all 0.2s;">
                تصدير العملاء Excel
              </button>
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:right; font-size:var(--font-size-sm);">
              <thead>
                <tr style="border-bottom:1px solid var(--color-border); color:var(--color-text-muted);">
                  <th style="padding:12px 8px;">اسم العميل</th>
                  <th style="padding:12px 8px;">رقم الهاتف (مباشر)</th>
                  <th style="padding:12px 8px;">العنوان الأساسي (دليفري / تيك أواي)</th>
                  <th style="padding:12px 8px; text-align:center;">عدد طلباته</th>
                  <th style="padding:12px 8px; text-align:center;">إجمالي مدفوعاته</th>
                  <th style="padding:12px 8px; text-align:center;">تواصل سريع</th>
                </tr>
              </thead>
              <tbody>
                ${customersList.map(cust => {
                  const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');
                  return `
                    <tr style="border-bottom:1px solid var(--color-border);">
                      <td style="padding:12px 8px;">
                        <strong style="font-weight:800; color:var(--color-text); font-size:0.95rem;">${escapeHTML(cust.name)}</strong>
                      </td>
                      <td style="padding:12px 8px;">
                        <span style="font-family:'Outfit'; font-weight:700; color:var(--color-secondary);">${escapeHTML(cust.phone)}</span>
                      </td>
                      <td style="padding:12px 8px; color:var(--color-text-secondary); max-width:240px; font-size:0.82rem;">
                        🛵 ${escapeHTML(cust.address)}
                      </td>
                      <td style="padding:12px 8px; text-align:center;">
                        <span style="background:rgba(255,255,255,0.05); border:1px solid var(--color-border); padding:2px 10px; border-radius:12px; font-weight:800; color:var(--color-primary); font-family:'Outfit';">
                          ${cust.ordersCount} طلب
                        </span>
                      </td>
                      <td style="padding:12px 8px; text-align:center; font-family:'Outfit'; font-weight:800; color:var(--color-success);">
                        ${cust.totalSpent} ج.م
                      </td>
                      <td style="padding:12px 8px; text-align:center;">
                        <div style="display:flex; gap:6px; justify-content:center;">
                          <a href="tel:${cleanPhone}" class="btn btn-glass" style="padding:4px 10px; font-size:0.75rem; color:var(--color-text); text-decoration:none;" title="اتصال هاتفي">
                            اتصال
                          </a>
                          <a href="https://wa.me/2${cleanPhone}" target="_blank" class="btn btn-glass" style="padding:4px 10px; font-size:0.75rem; color:#25D366; border-color:rgba(37,211,102,0.3); text-decoration:none;" title="مراسلة واتساب">
                            واتساب
                          </a>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  `;
}

// Native .xlsx Export Utility using SheetJS
function downloadXLSX(filename, headers, rows) {
  try {
    const data = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  } catch (e) {
    console.error("SheetJS export failed, falling back to CSV", e);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => {
      let str = String(v).replace(/"/g, '""');
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str}"`;
      }
      return str;
    }).join(','))].join('\n');
    const finalContent = "sep=,\n" + csvContent;
    const blob = new Blob(["\ufeff" + finalContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.replace('.xlsx', '.csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function init() {
  if (!auth.isAdminLoggedIn()) {
    // Bind admin login form
    const formLogin = document.getElementById('adminLoginForm');
    formLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playClick();
      const user = document.getElementById('adminUser').value.trim();
      const pass = document.getElementById('adminPass').value;

      const res = auth.adminLogin(user, pass);
      if (res.success) {
        showToast(res.message, 'success');
        sound.playSuccess();
        refreshPage();
      } else {
        showToast(res.message, 'error');
        sound.playError();
      }
    });
    return;
  }

  // Bind admin logout button
  const btnLogout = document.getElementById('btnAdminLogout');
  btnLogout?.addEventListener('click', () => {
    sound.playClick();
    auth.adminLogout();
    showToast('تم تسجيل خروج المسؤول بنجاح!', 'info');
    sound.playSuccess();
    refreshPage();
  });

  // Bind order status dropdown toggling
  document.querySelectorAll('.select-order-status').forEach(select => {
    select.addEventListener('change', (e) => {
      sound.playClick();
      const id = select.dataset.id;
      const status = select.value;
      
      admin.updateOrderStatus(id, status);
      showToast(`تم تحديث حالة الطلب رقم ${id} بنجاح!`, 'success');
      sound.playSuccess();
      refreshPage();
    });
  });

  // Bind print invoice button (Thermal print mockup)
  document.querySelectorAll('.btn-print-invoice').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const id = btn.dataset.id;
      const ordersLog = admin.getOrdersLog();
      const ord = ordersLog.find(o => String(o.id) === String(id));
      if (ord) {
        const printWindow = window.open('', '_blank', 'width=600,height=800');
        printWindow.document.write(`
          <html>
          <head>
            <title>فاتورة دليفري - طلب رقم ${ord.id}</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <div dir="rtl" style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:20px; max-width:320px; margin:0 auto; text-align:right; color:#000;">
              <div style="text-align:center; border-bottom:2px dashed #000; padding-bottom:10px; margin-bottom:10px;">
                <h2 style="margin:0; font-size:1.5rem; font-weight:bold;">كريب حكاية</h2>
                <p style="margin:4px 0 0; font-size:0.85rem;">أسيوط - دليفري وتيك أواي</p>
                <p style="margin:4px 0 0; font-size:0.8rem;">الهاتف: 01064319292 - 01130243484</p>
              </div>
              <div style="font-size:0.85rem; margin-bottom:12px; border-bottom:1px solid #000; padding-bottom:8px; line-height:1.5;">
                <div><strong>رقم الطلب:</strong> ${ord.id}</div>
                <div><strong>التاريخ:</strong> ${ord.time || ord.date}</div>
                <div><strong>العميل:</strong> ${ord.customer}</div>
                <div><strong>الهاتف:</strong> ${ord.phone}</div>
                <div><strong>العنوان:</strong> ${ord.address || 'استلام فرع (تيك أواي)'}</div>
              </div>
              <table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:10px;">
                <thead>
                  <tr style="border-bottom:1px solid #000;">
                    <th style="text-align:right; padding:4px 0;">الأصناف المطلوبة</th>
                    <th style="text-align:left; padding:4px 0;">القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:6px 0; line-height:1.4; font-weight:bold;">${ord.items}</td>
                    <td style="text-align:left; padding:6px 0; font-weight:bold;">${ord.total} ج.م</td>
                  </tr>
                </tbody>
              </table>
              <div style="border-top:2px dashed #000; padding-top:8px; font-size:1.05rem; font-weight:bold; display:flex; justify-content:space-between; margin-top:8px;">
                <span>إجمالي الحساب:</span>
                <span>${ord.total} ج.م</span>
              </div>
              <div style="text-align:center; margin-top:25px; font-size:0.75rem; border-top:1px solid #eee; padding-top:10px;">
                شكراً لطلبكم من كريب حكاية! ❤️
              </div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    });
  });

  // Bind print kitchen ticket button
  document.querySelectorAll('.btn-print-kitchen').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const id = btn.dataset.id;
      const ordersLog = admin.getOrdersLog();
      const ord = ordersLog.find(o => String(o.id) === String(id));
      if (ord) {
        const printWindow = window.open('', '_blank', 'width=600,height=800');
        printWindow.document.write(`
          <html>
          <head>
            <title>بون المطبخ - طلب رقم ${ord.id}</title>
          </head>
          <body onload="window.print(); window.close();">
            <div dir="rtl" style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:20px; max-width:320px; margin:0 auto; text-align:right; color:#000;">
              <div style="text-align:center; border-bottom:2px dashed #000; padding-bottom:10px; margin-bottom:10px;">
                <h2 style="margin:0; font-size:1.8rem; font-weight:bold; background:#000; color:#fff; display:inline-block; padding:4px 14px; border-radius:6px;">بون المطبخ</h2>
                <p style="margin:8px 0 0; font-size:1rem; font-weight:bold;">رقم الطلب: ${ord.id}</p>
                <p style="margin:4px 0 0; font-size:0.8rem;">التاريخ: ${ord.time || ord.date}</p>
              </div>
              <div style="font-size:1.15rem; line-height:1.6; margin-bottom:15px; padding:10px 0;">
                <strong>المكونات للتجهيز:</strong>
                <p style="white-space:pre-wrap; margin:12px 0; font-weight:bold; background:#f5f5f5; padding:12px; border-radius:6px; border:1px solid #ccc;">${ord.items}</p>
              </div>
              <div style="text-align:center; margin-top:20px; font-size:0.9rem; font-weight:bold; border-top:1px solid #000; padding-top:10px;">
                تجهيز سريع وحار! 🔥
              </div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    });
  });

  // Bind export orders button
  const btnExportOrders = document.getElementById('btnExportOrders');
  btnExportOrders?.addEventListener('click', () => {
    sound.playClick();
    const ordersLog = admin.getOrdersLog();
    if (ordersLog.length === 0) {
      showToast('لا توجد طلبات لتصديرها حالياً!', 'error');
      return;
    }
    const headers = ['رقم الطلب', 'التاريخ والوقت', 'اسم العميل', 'رقم الهاتف', 'العنوان / طريقة الاستلام', 'الأصناف المطلوبة', 'الإجمالي (ج.م)', 'حالة الطلب'];
    const rows = ordersLog.map(o => [
      o.id,
      o.time || o.date,
      o.customer,
      o.phone,
      o.address || 'استلام من الفرع (تيك أواي)',
      o.items,
      o.total,
      o.status === 'new' ? 'جديد' : (o.status === 'preparing' ? 'قيد التحضير' : 'مكتمل')
    ]);
    downloadXLSX('orders_report.xlsx', headers, rows);
    showToast('تم تصدير تقرير الطلبات إلى Excel (.xlsx) بنجاح!', 'success');
    sound.playSuccess();
  });

  // Bind export customers button
  const btnExportCustomers = document.getElementById('btnExportCustomers');
  btnExportCustomers?.addEventListener('click', () => {
    sound.playClick();
    const ordersLog = admin.getOrdersLog();
    const customers = getCustomersList(ordersLog);
    if (customers.length === 0) {
      showToast('لا يوجد عملاء لتصديرهم حالياً!', 'error');
      return;
    }
    const headers = ['اسم العميل', 'رقم الهاتف', 'العنوان / طريقة الاستلام', 'عدد الطلبات', 'إجمالي المدفوعات (ج.م)', 'تاريخ آخر طلب'];
    const rows = customers.map(c => [
      c.name,
      c.phone,
      c.address,
      c.ordersCount,
      c.totalSpent,
      c.lastDate
    ]);
    downloadXLSX('customers_report.xlsx', headers, rows);
    showToast('تم تصدير سجل العملاء إلى Excel (.xlsx) بنجاح!', 'success');
    sound.playSuccess();
  });

  // Bind export menu button
  const btnExportMenu = document.getElementById('btnExportMenu');
  btnExportMenu?.addEventListener('click', () => {
    sound.playClick();
    if (menuItems.length === 0) {
      showToast('لا توجد أصناف لتصديرها حالياً!', 'error');
      return;
    }
    const headers = ['معرف الصنف', 'اسم الصنف بالعربية', 'الاسم بالإنجليزية', 'الفئة / القسم', 'السعر (ج.م)', 'المكونات'];
    const rows = menuItems.map(item => {
      const catObj = categories.find(c => c.id === item.category);
      return [
        item.id,
        item.name,
        item.nameEn,
        catObj?.name || item.category,
        item.price,
        (item.ingredients || []).join(' - ')
      ];
    });
    downloadXLSX('menu_items.xlsx', headers, rows);
    showToast('تم تصدير المنيو بالكامل إلى Excel (.xlsx) بنجاح!', 'success');
    sound.playSuccess();
  });

  // Bind add product form
  const formAddProduct = document.getElementById('formAddProduct');
  formAddProduct?.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playClick();
    
    const name = document.getElementById('addProdName').value.trim();
    const nameEn = document.getElementById('addProdNameEn').value.trim();
    const category = document.getElementById('addProdCategory').value;
    const price = parseInt(document.getElementById('addProdPrice').value, 10);
    const ingredients = document.getElementById('addProdIngredients').value.split(',').map(s => s.trim()).filter(Boolean);
    
    const randomId = 'custom-' + Date.now();
    const defaultImg = category === 'drinks' ? 'assets/images/products/dr-pepsi.png' : 'assets/images/chicken_crepe.png';

    const newItem = {
      id: randomId,
      category,
      name,
      nameEn,
      price,
      description: '',
      ingredients,
      image: defaultImg
    };

    addMenuItem(newItem);

    showToast(`تم إضافة الصنف "${name}" إلى المنيو بنجاح!`, 'success');
    sound.playSuccess();
    refreshPage();
  });

  // Bind delete product buttons
  document.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const id = btn.dataset.id;
      const targetItem = menuItems.find(item => item.id === id);
      if (targetItem) {
        const deletedName = targetItem.name;
        deleteMenuItem(id);
        showToast(`تم حذف الصنف "${deletedName}" من المنيو بنجاح!`, 'success');
        sound.playSuccess();
        refreshPage();
      }
    });
  });

  // Bind add offer form
  const formAddOffer = document.getElementById('formAddOffer');
  formAddOffer?.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playClick();
    
    const name = document.getElementById('addOfferName').value.trim();
    const nameEn = document.getElementById('addOfferNameEn').value.trim();
    const description = document.getElementById('addOfferDesc').value.trim();
    const contents = document.getElementById('addOfferContents').value.split(',').map(s => s.trim()).filter(Boolean);
    const price = parseInt(document.getElementById('addOfferPrice').value, 10);
    const oldPrice = parseInt(document.getElementById('addOfferOldPrice').value, 10);
    const badge = document.getElementById('addOfferBadge').value.trim();
    const color = document.getElementById('addOfferColor').value;
    
    const randomId = 'deal-' + Date.now();
    
    const newOffer = {
      id: randomId,
      name,
      nameEn,
      description,
      contents,
      price,
      oldPrice,
      badge,
      badgeColor: color,
      borderColor: color
    };

    addDeal(newOffer);
    
    showToast(`تم إضافة العرض "${name}" بنجاح!`, 'success');
    sound.playSuccess();
    refreshPage();
  });

  // Bind delete offer buttons
  document.querySelectorAll('.btn-delete-offer').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const id = btn.dataset.id;
      const targetOffer = dealsList.find(d => d.id === id);
      if (targetOffer) {
        const deletedName = targetOffer.name;
        deleteDeal(id);
        showToast(`تم حذف العرض "${deletedName}" بنجاح!`, 'success');
        sound.playSuccess();
        refreshPage();
      }
    });
  });

  // Real-time live updates when a customer places an order
  if (!window._adminLiveListenerAttached) {
    window._adminLiveListenerAttached = true;
    admin.onOrdersChange((ordersLog, isNewOrder) => {
      if (window.location.hash.includes('admin')) {
        refreshPage();
        if (isNewOrder) {
          showToast('تنبيه المطبخ: وصل طلب أوردر جديد الآن في الوقت الفعلي!', 'success');
          sound.playOrderAlert();
        } else {
          showToast('تم مزامنة وتحديث حالة الطلبات في الوقت الفعلي!', 'info');
          sound.playSuccess();
        }
      }
    });
  }
}

function refreshPage() {
  const main = document.getElementById('mainContent');
  if (main) {
    main.innerHTML = render();
    init();
  }
}

export function destroy() {}
