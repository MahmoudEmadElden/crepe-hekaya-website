/* ============================================================
   كريب حكاية — Crepe Hekaya
   Home Page View Module & Interactive Elements
   ============================================================ */

import { categories, menuItems, getProductImage } from '../data.js';
import { HeroCrepe3D } from '../3d/hero.js';
import { cart } from '../core/cart.js';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js';
import LuckyWheel from '../components/wheel.js';
import gsap from 'gsap';

let hero3D = null;

export function render() {
  const popular = menuItems.filter(i => i.popular).slice(0, 4);
  const news = menuItems.filter(i => i.isNew).slice(0, 4);

  return `
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <div class="hero-badge animate-fade-in">
            <span style="display:inline-block; width:8px; height:8px; background:#D4A843; border-radius:50%;"></span>
            <span>FRESH • TASTY • CREPE</span>
          </div>
          <h1 class="hero-title animate-split-text">
            <span class="brand-name-en" style="display:block; font-family:'Outfit','Poppins',sans-serif; font-size:clamp(2.5rem,6vw,5rem); font-weight:900; letter-spacing:3px; line-height:1; background:linear-gradient(135deg, #D4A843 0%, #F5E6B8 30%, #D4A843 50%, #B8902F 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; filter:drop-shadow(0 2px 8px rgba(212,168,67,0.4)); margin-bottom:4px;">CREPE HEKAYA</span>
            <span class="brand-name-ar" style="display:block; font-family:'Cairo','Tajawal',sans-serif; font-size:clamp(2.8rem,7vw,5.5rem); font-weight:900; line-height:1.1; background:linear-gradient(135deg, #D4A843 0%, #F5E6B8 40%, #D4A843 70%, #B8902F 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; filter:drop-shadow(0 4px 12px rgba(212,168,67,0.5)); margin-bottom:8px;">كريب حكاية</span>
            <span class="title-line" style="font-size:clamp(1.3rem,3vw,2.2rem); color:var(--color-text); font-weight:700;">كل قطمة في كريبنا حكاية ولها حكاية</span>
          </h1>
          <p class="hero-desc animate-fade-in" style="font-size:clamp(0.95rem,1.5vw,1.15rem);">
            استمتع بمذاق الكريب المقرمش الفاخر مع أفضل المكونات الطازجة! اطلب كريبك المفضل ليصلك ساخناً ومقرمشاً لباب البيت.
          </p>
          <div class="hero-actions animate-fade-in">
            <a href="#/menu" class="btn btn-primary btn-lg" style="background:linear-gradient(135deg, #8B1A1A, #B22222); box-shadow:0 8px 25px rgba(139,26,26,0.4); border:1px solid rgba(212,168,67,0.3); font-size:1.1rem; padding:14px 32px;">
              <span>تصفّح المنيو واطلب</span>
            </a>
            <a href="#/offers" class="btn btn-glass btn-lg" style="border-color:rgba(212,168,67,0.4); color:#D4A843; font-size:1.05rem;">
              <span>عروض اليوم</span>
            </a>
          </div>
          <div class="hero-stats animate-fade-in">
            <div class="stat">
              <span class="stat-number" style="color:#D4A843;">45+</span>
              <span class="stat-label">نوع كريب</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number" style="color:#D4A843;">4.9</span>
              <span class="stat-label">تقييم العملاء</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number" style="color:#D4A843;">صاروخ</span>
              <span class="stat-label">توصيل سريع ساخن</span>
            </div>
          </div>
        </div>

        <div class="hero-3d">
          <div class="hero-3d-glow"></div>
          <div id="heroCanvasContainer" style="width:100%; height:100%;"></div>
          <div class="hero-3d-label">اسحب لتدوير الكريب • انقر مرتين للتقريب</div>
          <button id="btnReplayHero3D" style="position:absolute; bottom:var(--space-md); right:var(--space-md); padding:6px 12px; font-size:0.75rem; background:rgba(18,18,18,0.7); border:1px solid var(--color-border); border-radius:30px; font-weight:700;">إعادة العرض</button>
        </div>
      </div>
      
      <div class="hero-scroll-indicator">
        <span>انزل للأسفل</span>
        <div class="scroll-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </section>

    <!-- Lucky Wheel Callout Banner -->
    <section class="section" style="background: linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, transparent 100%); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">
      <div class="container" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:24px;">
        <div>
          <h2 style="font-weight:900; color:var(--color-primary); font-size:var(--font-size-2xl);">اربح هدية أو كود خصم فوري!</h2>
          <p style="color:var(--color-text-secondary); margin-top:4px;">قم بلف عجلة الحظ واحصل على هدية مجانية أو خصم إضافي يضاف لسلة مشترياتك الآن.</p>
        </div>
        <button class="btn btn-primary btn-lg" id="btnTriggerLuckyWheel">جرب حظك الآن</button>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">المنيو الكامل</span>
          <h2 class="section-title">أقسام حكاية المميزة</h2>
          <p class="section-desc">اختر كريبك المفضل من الأقسام المجهزة خصيصاً لتناسب ذوقك الرفيع</p>
        </div>
        
        <div class="categories-grid">
          ${categories.slice(0, 6).map(cat => `
            <a href="#/menu/${cat.id}" class="category-card" style="border-bottom: 3px solid ${cat.color};">
              <div class="category-image">
                <img src="${getProductImage(cat.id === 'sweet' ? 'nutella' : (cat.id === 'mix' || cat.id === 'custom' ? 'special' : (cat.id === 'new' ? 'combo' : cat.id)))}" alt="${cat.name}" />
                <div class="category-overlay"></div>
              </div>
              <div class="category-info">
                <span class="category-icon">${cat.icon}</span>
                <h3>${cat.name}</h3>
                <p>${cat.nameEn}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Popular Items Section -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">الأكثر طلباً</span>
          <h2 class="section-title">الأكثر شعبية وحباً</h2>
          <p class="section-desc">الأصناف التي يطلبها عملاؤنا بكثرة ويعشقون طعمها الفريد</p>
        </div>
        
        <div class="products-grid">
          ${popular.map(item => createProductCardHtml(item)).join('')}
        </div>
        
        <div style="text-align:center; margin-top:var(--space-3xl);">
          <a href="#/menu" class="btn btn-glass btn-lg">عرض المنيو بالكامل</a>
        </div>
      </div>
    </section>

    <!-- Features Overview -->
    <section class="section categories-section" style="border-top:1px solid var(--color-border);">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">سر الصنعة</span>
          <h2 class="section-title">لماذا كريب حكاية؟</h2>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:var(--space-xl);">
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center;">
            <h3 style="font-weight:800; margin-bottom:8px; color:var(--color-secondary);">لحوم ودجاج طازج يومياً</h3>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.6;">نختار مكوناتنا من اللحوم البلدية والصدور الطازجة بعناية بالغة يومياً لنضمن الطعم الأصلي.</p>
          </div>
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center;">
            <h3 style="font-weight:800; margin-bottom:8px; color:var(--color-secondary);">خبز كريب مقرمش ذهبي</h3>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.6;">عجينتنا الخاصة المخبوزة طازجة أمامك بدرجة قرمشة مثالية وسحرية لا تتغير.</p>
          </div>
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center;">
            <h3 style="font-weight:800; margin-bottom:8px; color:var(--color-secondary);">توصيل صاروخي ساخن</h3>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.6;">فريق توصيل مجهز بحقائب حرارية لنوصل طلبك ويفضل مقرمش وساخن كأنه لسه طالع من النار.</p>
          </div>
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
          <button class="btn-view-3d" data-id="${item.id}">مشاهدة 9D سينمائية</button>
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
          <button class="btn-add-cart" data-id="${item.id}">أضف للسلة</button>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  // Init 3D Canvas Crepe folding
  const canvasContainer = document.getElementById('heroCanvasContainer');
  if (canvasContainer) {
    try {
      hero3D = new HeroCrepe3D(canvasContainer);
    } catch (e) {
      console.error('Three.js hero scene initialization failed', e);
    }
  }

  // Trigger lucky wheel coupon game
  const wheelGame = new LuckyWheel();
  document.getElementById('btnTriggerLuckyWheel')?.addEventListener('click', () => {
    sound.playClick();
    wheelGame.show();
  });

  // Replay animation button
  document.getElementById('btnReplayHero3D')?.addEventListener('click', () => {
    sound.playClick();
    hero3D?.replay();
  });

  // Intersections observers for scroll reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card').forEach(card => observer.observe(card));

  // Bind interactive card buttons (Add to cart & detail navigation)
  attachProductCardEvents();
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

export function destroy() {
  if (hero3D) {
    hero3D.dispose();
    hero3D = null;
  }
}
