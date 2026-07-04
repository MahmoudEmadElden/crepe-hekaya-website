/* ============================================================
   كريب حكاية — Crepe Hekaya
   Menu Page View Module
   ============================================================ */

import { categories, menuItems, additions, getProductImage } from '../data.js';
import { cart } from '../core/cart.js';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js';

let currentCategory = 'all';
let searchQuery = '';

export function render(catParam = null) {
  currentCategory = catParam || 'all';
  const filtered = filterMenuItems();

  const currentCatObj = categories.find(c => c.id === currentCategory);

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">منيو كريب حكاية الكامل</h1>
        <p class="page-subtitle">شاورما، كريسبي، لحم، سويت وإضافات على كيفك بالهنا والشفا</p>
        
        <!-- Search bar -->
        <div style="max-width:500px; margin:20px auto 0; position:relative;">
          <input type="text" id="menuSearchInput" class="notes-input" style="padding-inline-start:44px;" placeholder="ابحث عن كريبك المفضل... (مثال: بانيه، استربس، نوتيلا)" value="${searchQuery}" />
          <span style="position:absolute; right:16px; top:50%; transform:translateY(-50%); font-size:1.2rem; pointer-events:none;">🔍</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <!-- Category Tabs -->
        <div class="category-tabs">
          <button class="tab-btn ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
            <span>كل الأصناف</span>
          </button>
          ${categories.map(cat => `
            <button class="tab-btn ${currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
              <span class="tab-icon">${cat.icon}</span>
              <span>${cat.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Banner for active category -->
        <div id="categoryBannerContainer">
          ${currentCatObj ? `
            <div class="category-banner" style="border-right: 4px solid ${currentCatObj.color}">
              <div class="cat-banner-content">
                <span class="cat-banner-icon">${currentCatObj.icon}</span>
                <div>
                  <h2 style="font-weight:900;">${currentCatObj.name}</h2>
                  <p>${currentCatObj.nameEn}</p>
                </div>
              </div>
              <span class="cat-banner-count">${filtered.length} صنف متاح</span>
            </div>
          ` : ''}
        </div>

        <!-- Menu Products Grid -->
        <div class="products-grid" id="menuProductsList">
          ${filtered.length > 0 ? filtered.map(item => createProductCardHtml(item)).join('') : `
            <div style="grid-column: 1 / -1; text-align:center; padding:60px 0; color:var(--color-text-secondary);">
              <div style="font-size:3rem; margin-bottom:12px;">🔍</div>
              <h3>لم نجد أي أصناف تطابق اختيارك</h3>
              <p style="font-size:0.9rem; margin-top:4px;">تأكد من كتابة اسم الصنف بشكل صحيح أو اختر قسم آخر</p>
            </div>
          `}
        </div>
      </div>
    </section>

    <!-- Global Additions list -->
    <section class="section categories-section" style="border-top:1px solid var(--color-border);">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">إضافات وصوصات</span>
          <h2 class="section-title">ركن إضافات حكاية اللذيذة</h2>
          <p class="section-desc">أضف طعماً ونكهة ممتازة لكريبك المفضل بأسعار مناسبة</p>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:var(--space-md);">
          ${additions.map(add => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-md); background:var(--color-bg-card); border:1px solid var(--color-border); border-radius:var(--radius-lg);">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:700; font-size:var(--font-size-sm);">${add.name}</span>
              </div>
              <span style="font-family:'Outfit'; font-weight:800; color:var(--color-secondary);">+${add.price} ج.م</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function createProductCardHtml(item) {
  const isSpicy = item.spicy ? `<span class="product-badge badge-spicy">حار</span>` : '';
  const isNew = item.isNew ? `<span class="product-badge badge-new">جديد</span>` : '';
  const isPopular = item.popular ? `<span class="product-badge badge-popular">شائع</span>` : '';
  const imgUrl = getProductImage(item.image);

  return `
    <div class="product-card" data-id="${item.id}">
      <div class="product-image">
        <img src="${imgUrl}" alt="${item.name}" loading="lazy" />
        ${isSpicy} ${isNew} ${isPopular}
        <div class="product-overlay">
          <button class="btn-view-3d">مشاهدة 9D سينمائية</button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${item.name}</h3>
        <span class="product-name-en">${item.nameEn}</span>
        ${item.description ? `<p class="product-desc">${item.description}</p>` : ''}
        <div class="product-ingredients">
          ${item.ingredients.slice(0, 3).map(ing => `<span class="ingredient-tag">${ing}</span>`).join('')}
          ${item.ingredients.length > 3 ? `<span class="ingredient-tag">+ ${item.ingredients.length - 3} إضافي</span>` : ''}
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-amount">${item.price}</span>
            <span class="price-currency">ج.م</span>
          </div>
          <button class="btn-add-cart">أضف للسلة</button>
        </div>
      </div>
    </div>
  `;
}

function filterMenuItems() {
  let items = menuItems;
  if (currentCategory !== 'all') {
    items = items.filter(i => i.category === currentCategory);
  }
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    items = items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.nameEn.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q)
    );
  }
  return items;
}

export function init() {
  // Bind category button clicks for instant, super smooth tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const cat = btn.dataset.cat;
      currentCategory = cat;
      
      // Update active state on tab buttons immediately
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update URL hash silently without full router reload
      const targetHash = cat === 'all' ? '#/menu' : `#/menu/${cat}`;
      if (window.location.hash !== targetHash) {
        history.pushState(null, null, targetHash);
      }
      
      refreshList();
    });
  });

  // Bind Search Input
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      refreshList();
    });
  }

  // Intersections observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.product-card').forEach(c => observer.observe(c));

  // Bind card clicks
  attachProductCardEvents();
}

function refreshList() {
  const grid = document.getElementById('menuProductsList');
  const bannerContainer = document.getElementById('categoryBannerContainer');
  const filtered = filterMenuItems();
  const currentCatObj = categories.find(c => c.id === currentCategory);

  if (bannerContainer) {
    bannerContainer.innerHTML = currentCatObj ? `
      <div class="category-banner" style="border-right: 4px solid ${currentCatObj.color}">
        <div class="cat-banner-content">
          <span class="cat-banner-icon">${currentCatObj.icon}</span>
          <div>
            <h2 style="font-weight:900;">${currentCatObj.name}</h2>
            <p>${currentCatObj.nameEn}</p>
          </div>
        </div>
        <span class="cat-banner-count">${filtered.length} صنف متاح</span>
      </div>
    ` : '';
  }

  if (grid) {
    if (filtered.length > 0) {
      grid.innerHTML = filtered.map(item => createProductCardHtml(item)).join('');
    } else {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:60px 0; color:var(--color-text-secondary);">
          <div style="font-size:3rem; margin-bottom:12px;">🔍</div>
          <h3>لم نجد أي أصناف تطابق اختيارك</h3>
          <p style="font-size:0.9rem; margin-top:4px;">تأكد من كتابة اسم الصنف بشكل صحيح أو اختر قسم آخر</p>
        </div>
      `;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.product-card').forEach(c => observer.observe(c));
    
    attachProductCardEvents();
  }
}

function attachProductCardEvents() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      const card = btn.closest('.product-card');
      const id = card.dataset.id;
      const item = menuItems.find(i => i.id === id);
      if (item) {
        cart.addItem(item, 1, [], '');
        showToast(`تمت إضافة كريب (${item.name}) لسلة طلباتك بنجاح!`, 'cart');
        sound.playSuccess();
      }
    });
  });

  document.querySelectorAll('.btn-view-3d, .product-card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-cart')) return;
      e.stopPropagation();
      sound.playClick();
      const card = el.closest('.product-card');
      const id = card.dataset.id;
      window.location.hash = `#/product/${id}`;
    });
  });
}

export function destroy() {}
