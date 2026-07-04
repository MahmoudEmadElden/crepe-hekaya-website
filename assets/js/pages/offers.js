/* ============================================================
   كريب حكاية — Crepe Hekaya
   Offers, Deals & Coupons Page (Dynamic Data Connected)
   ============================================================ */

import { showToast } from '../../../app.js';
import sound from '../components/sound.js?v=9.4';
import { cart } from '../core/cart.js?v=9.4';
import { dealsList } from '../data.js?v=9.4';

export function render() {
  const deals = dealsList;

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">عروض كريب حكاية</h1>
        <p class="page-subtitle">عروض وتوفيرات حصرية على وجبات الكريب - اطلب الآن!</p>
      </div>
    </section>

    <section class="section">
      <div class="container">

        <!-- Real Deals Section -->
        <div style="margin-bottom:var(--space-3xl);">
          <div style="margin-bottom:var(--space-xl);">
            <h2 style="font-weight:900; font-size:var(--font-size-2xl); color:var(--color-text);">عروض الوجبات</h2>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">اختر عرضك المفضل واطلبه مباشرة</p>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:var(--space-xl);">
            ${deals.map(deal => {
              const hasDiscount = deal.oldPrice && deal.oldPrice > deal.price;
              const discountPercent = hasDiscount ? Math.round((1 - deal.price / deal.oldPrice) * 100) : 0;
              return `
                <div class="deal-card" style="background:var(--color-bg-card); border:2px solid ${deal.borderColor || 'var(--color-border)'}; border-radius:var(--radius-2xl); overflow:hidden; position:relative; transition:transform 0.3s ease, box-shadow 0.3s ease;">
                  
                  <!-- Badge -->
                  ${deal.badge ? `<span style="position:absolute; top:16px; right:16px; background:${deal.badgeColor || 'var(--color-primary)'}; color:#fff; padding:4px 14px; border-radius:20px; font-size:0.75rem; font-weight:800; z-index:2;">${deal.badge}</span>` : ''}
                  
                  <!-- Discount percentage -->
                  ${hasDiscount ? `<span style="position:absolute; top:16px; left:16px; background:rgba(0,0,0,0.6); color:#F87171; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:800; z-index:2;">خصم ${discountPercent}%</span>` : ''}

                  <!-- Content -->
                  <div style="padding:var(--space-xl);">
                    <h3 style="font-weight:900; font-size:var(--font-size-xl); color:var(--color-text); margin-bottom:4px; ${deal.badge ? 'margin-top:28px;' : 'margin-top:10px;'}">${deal.name}</h3>
                    <span style="font-size:0.8rem; color:var(--color-text-muted); font-family:'Outfit',sans-serif;">${deal.nameEn}</span>
                    
                    <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin:12px 0 16px; line-height:1.6;">${deal.description}</p>
                    
                    <!-- Contents list -->
                    <div style="background:var(--color-bg); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:12px 16px; margin-bottom:20px;">
                      <div style="font-size:0.7rem; color:var(--color-text-muted); margin-bottom:8px; font-weight:700;">محتويات العرض:</div>
                      ${(deal.contents || []).map(c => `
                        <div style="display:flex; align-items:center; gap:8px; padding:3px 0;">
                          <span style="color:${deal.borderColor || 'var(--color-primary)'}; font-weight:700;">✓</span>
                          <span style="font-size:var(--font-size-sm); color:var(--color-text);">${c}</span>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Price -->
                    <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:16px;">
                      <span style="font-family:'Outfit',sans-serif; font-size:2rem; font-weight:900; color:${deal.borderColor || 'var(--color-primary)'};">${deal.price}</span>
                      <span style="font-size:0.9rem; font-weight:700; color:var(--color-text-muted);">ج.م</span>
                      ${deal.oldPrice ? `<span style="font-family:'Outfit',sans-serif; font-size:1rem; color:var(--color-text-muted); text-decoration:line-through; margin-right:auto;">${deal.oldPrice} ج.م</span>` : ''}
                    </div>

                    <!-- Add to cart button -->
                    <button class="btn btn-primary btn-full btn-add-deal" data-deal-id="${deal.id}" style="background:linear-gradient(135deg, ${deal.borderColor || 'var(--color-primary)'}, ${(deal.borderColor || 'var(--color-primary)')}dd); padding:12px; font-size:var(--font-size-sm); font-weight:800;">
                      اطلب العرض الآن
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Divider -->
        <hr style="border:none; border-top:1px solid var(--color-border); margin:var(--space-2xl) 0;">

        <!-- Coupons Section -->
        <div>
          <div style="margin-bottom:var(--space-xl);">
            <h2 style="font-weight:900; font-size:var(--font-size-2xl); color:var(--color-text);">كوبونات خصم</h2>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">انسخ الكود والصقه في السلة لتفعيل الخصم</p>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-lg);">
            
            <div style="background:var(--color-bg-card); border:1px dashed #D4A843; padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center; position:relative;">
              <span class="loyalty-rank rank-gold" style="position:absolute; top:12px; right:12px;">أكثر طلباً</span>
              <h3 style="font-weight:800; margin-top:12px;">كوبون خصم 10%</h3>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs); margin:4px 0 16px;">خصم 10% على كافة أنواع الكريب دون حد أقصى للفاتورة</p>
              <button class="btn btn-glass btn-full copy-coupon-btn" data-code="HEKAYA10">نسخ كود: HEKAYA10</button>
            </div>

            <div style="background:var(--color-bg-card); border:1px dashed var(--color-secondary); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center; position:relative;">
              <span class="loyalty-rank rank-vip" style="position:absolute; top:12px; right:12px;">للجدد</span>
              <h3 style="font-weight:800; margin-top:12px;">خصم 20% للعملاء الجدد</h3>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs); margin:4px 0 16px;">خصم 20% لأول طلب مسجل من الموقع مباشرة</p>
              <button class="btn btn-glass btn-full copy-coupon-btn" data-code="WELCOME20">نسخ كود: WELCOME20</button>
            </div>

            <div style="background:var(--color-bg-card); border:1px dashed var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center; position:relative;">
              <span class="loyalty-rank rank-silver" style="position:absolute; top:12px; right:12px;">مجاني</span>
              <h3 style="font-weight:800; margin-top:12px;">مشروب كولا مجاني</h3>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs); margin:4px 0 16px;">مشروب كولا مجاني إضافي أو خصم بقيمة 15 ج.م</p>
              <button class="btn btn-glass btn-full copy-coupon-btn" data-code="FREECOLD">نسخ كود: FREECOLD</button>
            </div>

          </div>
        </div>

      </div>
    </section>
  `;
}

export function init() {
  const deals = dealsList;

  // Deal ordering - add deal to cart
  document.querySelectorAll('.btn-add-deal').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const dealId = btn.dataset.dealId;
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        // Create a cart-compatible item for the deal
        const dealItem = {
          id: deal.id,
          name: deal.name,
          nameEn: deal.nameEn,
          price: deal.price,
          image: '',
          category: 'deals',
          ingredients: deal.contents,
          description: deal.description
        };
        cart.addItem(dealItem, 1, [], `عرض: ${deal.contents.join(' + ')}`);
        showToast(`تم إضافة "${deal.name}" للسلة بنجاح! (${deal.price} ج.م)`, 'cart');
        sound.playSuccess();
        
        // Animate the button briefly
        btn.textContent = 'تم الإضافة ✓';
        btn.style.background = 'var(--color-success)';
        setTimeout(() => {
          btn.textContent = 'اطلب العرض الآن';
          btn.style.background = '';
        }, 1500);
      }
    });
  });

  // Coupon copying
  document.querySelectorAll('.copy-coupon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const code = btn.dataset.code;
      navigator.clipboard.writeText(code);
      showToast(`تم نسخ كوبون الخصم (${code}) بنجاح! الصقه في السلة لتفعيل الخصم.`, 'success');
      sound.playSuccess();
    });
  });

  // Hover effects for deal cards
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px)';
      card.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

export function destroy() {}
