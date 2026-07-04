/* ============================================================
   كريب حكاية — Crepe Hekaya
   Single Product Detail & 3D Review Page
   ============================================================ */

import { menuItems, categories, additions, getProductImage } from '../data.js';
import { Crepe3D } from '../../../app.js'; // imported from app.js main module
import { cart } from '../core/cart.js';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js';

let product3D = null;
let currentItem = null;
let currentQty = 1;

export function render(id) {
  currentItem = menuItems.find(i => i.id === id);
  currentQty = 1;

  if (!currentItem) {
    return `
      <section class="page-header">
        <div class="container">
          <h1 class="page-title">عذراً، هذا الصنف غير متوفر 🔍</h1>
          <p class="page-subtitle"><a href="#/menu" class="btn btn-primary" style="margin-top:12px;">العودة لصفحة المنيو</a></p>
        </div>
      </section>
    `;
  }

  const category = categories.find(c => c.id === currentItem.category);
  const isSpicy = currentItem.spicy ? `<span class="detail-badge badge-spicy">حار</span>` : '';
  const isNew = currentItem.isNew ? `<span class="detail-badge badge-new">جديد</span>` : '';
  const isPopular = currentItem.popular ? `<span class="detail-badge badge-popular">شائع</span>` : '';
  const imgUrl = getProductImage(currentItem.image);

  return `
    <section class="page-header">
      <div class="container" style="text-align:right;">
        <div style="font-size:0.85rem; color:var(--color-text-muted); display:flex; gap:6px;">
          <a href="#/">الرئيسية</a>
          <span>/</span>
          <a href="#/menu">المنيو</a>
          <span>/</span>
          <span style="color:var(--color-text);">${currentItem.name}</span>
        </div>
      </div>
    </section>

    <section class="product-detail">
      <div class="container">
        <div class="product-detail-grid">
          
          <!-- 3D Viewer Left -->
          <div class="product-visual">
            <div class="product-3d-container" id="detailCanvasContainer">
              <div class="product-3d-loader">
                <div class="loader-spinner"></div>
                <p>جاري تحضير العرض ثلاثي الأبعاد...</p>
              </div>
            </div>
            
            <div class="product-image-fallback hidden" id="detailFallbackImg">
              <img src="${imgUrl}" alt="${currentItem.name}" />
            </div>

            <div class="product-3d-controls">
              <button class="control-btn" id="btnToggleVisualMode">
                <span id="toggleVisualModeText">عرض صورة فوتوغرافية</span>
              </button>
              <button class="control-btn active" id="btnToggleAutoRotate">
                <span>دوران تلقائي</span>
              </button>
            </div>
          </div>

          <!-- Configuration Panel Right -->
          <div class="product-detail-info">
            <div class="product-detail-header">
              ${isSpicy} ${isNew} ${isPopular}
              <span class="detail-category" style="--cat-color: ${category?.color || '#FF6B00'}">${category?.icon || ''} ${category?.name || ''}</span>
            </div>
            
            <h1 class="product-detail-name">${currentItem.name}</h1>
            <span class="product-detail-name-en">${currentItem.nameEn}</span>
            ${currentItem.description ? `<p class="product-detail-desc">${currentItem.description}</p>` : ''}

            <!-- Ingredients -->
            <div class="product-ingredients-detail">
              <h3>${currentItem.category === 'drinks' || currentItem.category === 'fries' ? 'المواصفات ومحتويات الصنف:' : 'المكونات الأساسية داخل الكريب:'}</h3>
              <div class="ingredients-list">
                ${currentItem.ingredients.map(ing => `
                  <div class="ingredient-item">
                    <span class="ingredient-check">✓</span>
                    <span>${ing}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Custom Additions -->
            <div class="product-additions">
              <h3>${currentItem.category === 'drinks' || currentItem.category === 'fries' ? 'إضافات اختيارية:' : 'إضافة جبن أو صوصات إضافية:'}</h3>
              <div class="additions-options">
                ${additions.slice(0, 6).map(add => `
                  <label class="addition-option">
                    <input type="checkbox" class="detail-addition-chk" data-id="${add.id}" data-name="${add.name}" data-price="${add.price}" />
                    <span class="addition-label">
                      <span>${add.name}</span>
                      <span class="addition-price-tag">+${add.price} ج.م</span>
                    </span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Custom Notes -->
            <div class="product-notes">
              <h3>ملاحظات وشروط خاصة للتحضير (اختياري)</h3>
              <textarea class="notes-input" id="detailSpecialNotes" placeholder="${currentItem.category === 'drinks' || currentItem.category === 'fries' ? 'مثال: مثلج جداً، بدون قش، إلخ...' : 'مثال: بدون بصل، زيادة شيدر، تحميص الكريب جيداً...'}" rows="3"></textarea>
            </div>

            <!-- Footer cart purchase zone -->
            <div class="product-order-section">
              <div class="quantity-selector">
                <button class="qty-btn" id="btnQtyDec">-</button>
                <span class="qty-value" id="qtyValEl">1</span>
                <button class="qty-btn" id="btnQtyInc">+</button>
              </div>
              
              <div class="product-total">
                <span class="total-label">الإجمالي: </span>
                <span class="total-amount" id="detailTotalPrice">${currentItem.price}</span>
                <span class="total-currency">ج.م</span>
              </div>
            </div>

            <button class="btn btn-primary btn-lg btn-full" id="btnDetailAddToCart" style="margin-top:var(--space-md);">
              <span>${currentItem.category === 'drinks' || currentItem.category === 'fries' ? 'أضف الصنف إلى السلة' : 'أضف طلب الكريب إلى السلة'}</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  `;
}

export function init() {
  if (!currentItem) return;

  const container = document.getElementById('detailCanvasContainer');
  const isCrepe = currentItem.category !== 'drinks' && currentItem.category !== 'fries';

  if (container && isCrepe) {
    try {
      product3D = new Crepe3D(container, { autoRotate: true, interactive: true });
    } catch (e) {
      console.warn('WebGL detail scene failed', e);
      document.getElementById('detailFallbackImg')?.classList.remove('hidden');
      container.classList.add('hidden');
    }
  } else {
    // Hide 3D container, show fallback image directly, hide 3D controls toggle
    document.getElementById('detailFallbackImg')?.classList.remove('hidden');
    if (container) container.classList.add('hidden');
    const toggleVisualBtn = document.getElementById('btnToggleVisualMode');
    if (toggleVisualBtn) toggleVisualBtn.style.display = 'none';
  }

  // Toggle visual image vs 3d
  let is3DMode = true;
  document.getElementById('btnToggleVisualMode')?.addEventListener('click', () => {
    sound.playClick();
    is3DMode = !is3DMode;
    const canvas = document.getElementById('detailCanvasContainer');
    const fallback = document.getElementById('detailFallbackImg');
    const icon = document.getElementById('toggleVisualModeIcon');
    const text = document.getElementById('toggleVisualModeText');

    if (is3DMode) {
      canvas?.classList.remove('hidden');
      fallback?.classList.add('hidden');
      if (text) text.innerText = 'عرض صورة فوتوغرافية';
    } else {
      canvas?.classList.add('hidden');
      fallback?.classList.remove('hidden');
      if (text) text.innerText = 'استعراض 3D مجسم';
    }
  });

  // Toggle rotate
  const btnRotate = document.getElementById('btnToggleAutoRotate');
  btnRotate?.addEventListener('click', () => {
    sound.playClick();
    if (product3D) {
      product3D.options.autoRotate = !product3D.options.autoRotate;
      btnRotate.classList.toggle('active', product3D.options.autoRotate);
    }
  });

  // Quantity controllers
  document.getElementById('btnQtyInc')?.addEventListener('click', () => {
    sound.playClick();
    currentQty++;
    document.getElementById('qtyValEl').innerText = currentQty;
    recalculateTotalPrice();
  });

  document.getElementById('btnQtyDec')?.addEventListener('click', () => {
    if (currentQty > 1) {
      sound.playClick();
      currentQty--;
      document.getElementById('qtyValEl').innerText = currentQty;
      recalculateTotalPrice();
    }
  });

  // Additions check triggers
  document.querySelectorAll('.detail-addition-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      sound.playClick();
      recalculateTotalPrice();
    });
  });

  // Purchase add to cart
  document.getElementById('btnDetailAddToCart')?.addEventListener('click', () => {
    sound.playClick();
    const adds = getSelectedAdditions();
    const notes = document.getElementById('detailSpecialNotes')?.value || '';

    cart.addItem(currentItem, currentQty, adds, notes);
    showToast(`تمت إضافة ${currentQty} × كريب (${currentItem.name}) للسلة!`, 'cart');
    sound.playSuccess();
    window.location.hash = '#/menu';
  });
}

function getSelectedAdditions() {
  const selected = [];
  document.querySelectorAll('.detail-addition-chk:checked').forEach(chk => {
    selected.push({
      id: chk.dataset.id,
      name: chk.dataset.name,
      price: parseInt(chk.dataset.price, 10)
    });
  });
  return selected;
}

function recalculateTotalPrice() {
  const adds = getSelectedAdditions();
  const addsPrice = adds.reduce((sum, a) => sum + a.price, 0);
  const total = (currentItem.price + addsPrice) * currentQty;

  const totalEl = document.getElementById('detailTotalPrice');
  if (totalEl) {
    totalEl.innerText = total;
    totalEl.classList.add('price-update');
    setTimeout(() => totalEl.classList.remove('price-update'), 200);
  }
}

export function destroy() {
  if (product3D) {
    product3D.dispose();
    product3D = null;
  }
}
