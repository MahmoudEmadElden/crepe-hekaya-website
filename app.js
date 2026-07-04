import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import Lenis from 'lenis';

// Core State Imports
import { cart } from './assets/js/core/cart.js?v=9.4';
import { auth } from './assets/js/core/auth.js?v=9.4';
import { reservation } from './assets/js/core/reservation.js?v=9.4';
import { admin } from './assets/js/core/admin.js?v=9.4';

// Component Imports
import { sound } from './assets/js/components/sound.js';
import { IntroLoader } from './assets/js/components/intro.js';
import { CustomCursor } from './assets/js/components/cursor.js';
import { categories, menuItems, additions, getProductImage } from './assets/js/data.js?v=9.4';

/* ============================================================
   1. TOAST NOTIFICATION SYSTEM
   ============================================================ */

export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '🥙';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';
  else if (type === 'info') icon = 'ℹ️';
  else if (type === 'cart') icon = '🛒';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="إغلاق">&times;</button>
  `;

  container.appendChild(toast);
  
  // Slide in
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  const closeToast = () => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);
  setTimeout(closeToast, duration);
}

/* ============================================================
   2. THREE.JS 3D PREVIEW MODEL (Crepe3D)
   ============================================================ */

export class Crepe3D {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoRotate: options.autoRotate !== false,
      interactive: options.interactive !== false,
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.crepeGroup = null;
    this.particles = null;
    this.animId = null;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const w = this.container.clientWidth || 300;
    const h = this.container.clientHeight || 300;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.camera.position.set(0, 3.5, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Controls
    if (this.options.interactive) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.2;
      this.controls.target.set(0, 0.2, 0);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0xffaa44, 4.0, 15, Math.PI / 4, 0.4);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x87ceeb, 1.2);
    rimLight.position.set(-3, 3, -4);
    this.scene.add(rimLight);

    // Group
    this.crepeGroup = new THREE.Group();
    this.scene.add(this.crepeGroup);

    this.buildModel();
    this.buildParticles();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    this.animate();
  }

  buildModel() {
    // 9D Futuristic Holographic Podium
    const podiumGeo = new THREE.CylinderGeometry(2.1, 2.4, 0.22, 32);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x331100
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -1.4;
    podium.receiveShadow = true;
    this.crepeGroup.add(podium);

    // Glowing Gold Ring on Podium
    const ringGeo = new THREE.TorusGeometry(2.25, 0.035, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.27;
    this.crepeGroup.add(ring);

    // Orbiting 9D Energy Rings
    this.ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.65, 0.02, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0xff8c33, transparent: true, opacity: 0.75 })
    );
    this.ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.05, 0.015, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.5 })
    );
    this.crepeGroup.add(this.ring1);
    this.crepeGroup.add(this.ring2);

    // Photorealistic 3D Curved Crepe Billboard Stage
    const loader = new THREE.TextureLoader();
    const textureUrl = 'assets/images/crepes/chicken-ranch.jpg';
    loader.load(textureUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const planeGeo = new THREE.PlaneGeometry(3.4, 3.4, 32, 32);
      
      // Bend plane slightly in 3D depth to look volumetric and physical
      const pos = planeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const curveZ = Math.cos(x * 0.75) * 0.35 + Math.sin(y * 1.2) * 0.18;
        pos.setZ(i, curveZ);
      }
      planeGeo.computeVertexNormals();

      const planeMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true
      });

      const crepeMesh = new THREE.Mesh(planeGeo, planeMat);
      crepeMesh.position.set(0, 0.35, 0);
      crepeMesh.castShadow = true;
      this.crepeGroup.add(crepeMesh);
    }, undefined, () => {
      // Fallback golden cone shield
      const fallbackGeo = new THREE.ConeGeometry(1.8, 3.2, 32, 1, true);
      const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xdca24a, roughness: 0.4, side: THREE.DoubleSide });
      const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
      fallbackMesh.rotation.z = Math.PI;
      fallbackMesh.position.y = 0.5;
      this.crepeGroup.add(fallbackMesh);
    });
  }

  buildParticles() {
    const count = 45;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.2;
      positions[i * 3 + 1] = -1.0 + Math.random() * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffd166, size: 0.08, transparent: true, opacity: 0.65 });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();

    this.controls?.update();

    if (this.options.autoRotate && this.crepeGroup) {
      this.crepeGroup.rotation.y = elapsed * 0.25;
    }

    if (this.ring1 && this.ring2) {
      this.ring1.rotation.x = elapsed * 0.45;
      this.ring1.rotation.y = elapsed * 0.35;
      this.ring2.rotation.x = -elapsed * 0.35;
      this.ring2.rotation.z = elapsed * 0.55;
    }

    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.008;
        if (pos[i] > 2.5) pos[i] = -1.2;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer?.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement?.remove();
  }
}

/* ============================================================
   3. ROUTING COORDINATOR (SPA DYNAMIC IMPORTS)
   ============================================================ */

let activePageCleanup = null;
let lenisScroll = null;

export async function router() {
  const hash = window.location.hash || '#/';
  const main = document.getElementById('mainContent');
  if (!main) return;

  // Cleanup active page handlers (Three.js WebGL and timers)
  if (activePageCleanup) {
    activePageCleanup();
    activePageCleanup = null;
  }

  // Page Transition Fade
  main.classList.add('page-transitioning');

  setTimeout(async () => {
    const route = hash.replace('#', '');
    const parts = route.split('/').filter(Boolean);
    const view = parts[0] || '';
    const param1 = parts[1] || null;

    try {
      if (view === '') {
        const mod = await import('./assets/js/pages/home.js?v=9.4');
        main.innerHTML = mod.render();
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('home');
      } else if (view === 'menu') {
        const mod = await import('./assets/js/pages/menu.js?v=9.4');
        main.innerHTML = mod.render(param1);
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('menu');
      } else if (view === 'product' && param1) {
        const mod = await import('./assets/js/pages/product.js?v=9.4');
        main.innerHTML = mod.render(param1);
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('menu');
      } else if (view === 'builder') {
        const mod = await import('./assets/js/pages/builder.js?v=9.4');
        main.innerHTML = mod.render();
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('builder');
      } else if (view === 'reservation') {
        window.location.hash = '#/menu';
        return;
      } else if (view === 'offers') {
        const mod = await import('./assets/js/pages/offers.js?v=9.4');
        main.innerHTML = mod.render();
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('offers');
      } else if (view === 'gallery') {
        const mod = await import('./assets/js/pages/gallery.js?v=9.4');
        main.innerHTML = mod.render();
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('');
      } else if (view === 'dashboard') {
        const mod = await import('./assets/js/pages/dashboard.js?v=9.4');
        main.innerHTML = mod.render();
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('');
      } else if (view === 'admin') {
        const mod = await import('./assets/js/pages/admin.js?v=9.4');
        main.innerHTML = mod.render();
        mod.init();
        activePageCleanup = mod.destroy;
        setActiveNavLink('');
      } else if (view === 'cart') {
        main.innerHTML = renderCartPage();
        initCartPage();
        setActiveNavLink('');
      } else if (view === 'auth') {
        main.innerHTML = renderAuthPage();
        initAuthPage();
        setActiveNavLink('');
      } else if (view === 'about') {
        main.innerHTML = renderAboutPage();
        initAboutPage();
        setActiveNavLink('about');
      } else if (view === 'contact') {
        main.innerHTML = renderContactPage();
        initContactPage();
        setActiveNavLink('contact');
      } else {
        // 404 fallback
        main.innerHTML = `
          <div class="container" style="padding:100px 0; text-align:center;">
            <h1 style="font-size:5rem; font-weight:900; color:var(--color-primary);">404</h1>
            <h2>عذراً، هذه الصفحة غير موجودة ⚠️</h2>
            <p style="color:var(--color-text-secondary); margin:12px 0 20px;">الرابط الذي قمت بزيارته خاطئ أو تم تعديل مكانه.</p>
            <a href="#/" class="btn btn-primary btn-lg">العودة للرئيسية 🥙</a>
          </div>
        `;
        setActiveNavLink('');
      }
    } catch (e) {
      console.error('Routing module fetch failed', e);
      main.innerHTML = `<div class="container" style="padding:100px 0; text-align:center;"><h2>حدث خطأ أثناء تحميل محتويات الصفحة. يرجى إعادة تحميل المتصفح.</h2></div>`;
    }

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Transition back in
    requestAnimationFrame(() => {
      main.classList.remove('page-transitioning');
      main.classList.add('page-entered');
      setTimeout(() => main.classList.remove('page-entered'), 400);
    });
  }, 220);
}

function setActiveNavLink(pageName) {
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   4. STATIC VIEWS RENDERING (CART, AUTH, ABOUT, CONTACT)
   ============================================================ */

/* ---------- A. SHOPPING CART PAGE ---------- */
function renderCartPage() {
  const items = cart.getItems();
  const rawSubtotal = cart.getRawSubtotal();
  const discount = cart.getCouponDiscount();
  const isLoggedIn = auth.isLoggedIn();
  const user = auth.getUser();
  const finalTotal = cart.getFinalTotal(user);

  if (items.length === 0) {
    return `
      <section class="page-header"><div class="container"><h1 class="page-title">سلة المشتريات</h1><p class="page-subtitle">سلتك خالية من كريبات حكاية حالياً</p></div></section>
      <section class="section"><div class="container" style="text-align:center;">
        <div style="font-size:4rem; margin-bottom:12px;">🛒</div>
        <h2>لا توجد كريبات مضافة للسلة</h2>
        <p style="color:var(--color-text-secondary); margin-bottom:20px;">قم بتصفح المنيو واستمتع بأشهى كريب في مصر!</p>
        <a href="#/menu" class="btn btn-primary btn-lg">تصفح المنيو الآن 📋</a>
      </div></section>
    `;
  }

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">🛒 سلة المشتريات</h1>
        <p class="page-subtitle">لديك ${cart.getCount()} كريب جاهزين للطلب اللذيذ</p>
      </div>
    </section>

    <section class="section" style="background:var(--color-bg-deep);">
      <div class="container">
        <div class="cart-layout">
          
          <!-- Items List -->
          <div class="cart-items-container">
            <div class="cart-items-header">
              <h2 style="font-weight:900;">الطلبات المضافة الساخنة</h2>
              <button class="btn-clear-cart" id="btnClearCartBtn">🗑️ إفراغ السلة</button>
            </div>
            <div class="cart-items-list">
              ${items.map((item, index) => createCartItemHtml(item, index)).join('')}
            </div>
          </div>

          <!-- Checkout Sidebar -->
          <div class="order-summary">
            <div class="profile-card">
              <h3 style="font-weight:900; margin-bottom:var(--space-md);">فاتورة الحساب</h3>
              <div style="display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; justify-content:space-between; font-size:var(--font-size-sm); color:var(--color-text-secondary);">
                  <span>المجموع الفرعي:</span>
                  <span style="font-family:'Outfit';">${rawSubtotal} ج.م</span>
                </div>
                ${discount > 0 ? `
                  <div style="display:flex; justify-content:space-between; font-size:var(--font-size-sm); color:var(--color-danger);">
                    <span>خصم الكوبون:</span>
                    <span style="font-family:'Outfit';">-${discount} ج.م</span>
                  </div>
                ` : ''}
                ${isLoggedIn && cart.getLoyaltyDiscount(user) > 0 ? `
                  <div style="display:flex; justify-content:space-between; font-size:var(--font-size-sm); color:var(--color-success);">
                    <span>خصم رتبة (${user.tier.toUpperCase()}):</span>
                    <span style="font-family:'Outfit';">-${cart.getLoyaltyDiscount(user)} ج.م</span>
                  </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; font-size:var(--font-size-sm); color:var(--color-text-muted);">
                  <span>🚚 خدمة التوصيل السريع:</span>
                  <span style="color:var(--color-success);">مجاناً لفترة محدودة</span>
                </div>
                <div style="border-top:1px solid var(--color-border); margin:8px 0; padding-top:8px; display:flex; justify-content:space-between; font-size:var(--font-size-lg); font-weight:800;">
                  <span>إجمالي الحساب:</span>
                  <span style="color:var(--color-primary); font-family:'Outfit';">${finalTotal} ج.م</span>
                </div>
              </div>

              <!-- Coupon code input -->
              <div style="margin-top:20px; border-top:1px solid var(--color-border); padding-top:16px;">
                <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">🎫 تطبيق كوبون خصم:</label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="couponCodeInput" class="notes-input" placeholder="اكتب الكوبون هنا" value="${cart.getActiveCoupon()?.code || ''}" style="height:38px;" />
                  <button class="btn btn-primary" id="btnApplyCoupon" style="padding:0 16px; font-size:var(--font-size-xs); height:38px;">تطبيق</button>
                </div>
                ${cart.getActiveCoupon() ? `
                  <div style="font-size:0.75rem; color:var(--color-success); margin-top:4px; display:flex; justify-content:space-between;">
                    <span>✓ الكوبون (${cart.getActiveCoupon().code}) نشط</span>
                    <span id="btnRemoveCoupon" style="color:var(--color-danger); cursor:pointer; text-decoration:underline;">إلغاء</span>
                  </div>
                ` : ''}
              </div>

              <!-- Real-Time Interactive Checkout Form -->
              <div style="background:var(--color-bg); padding:16px; border-radius:16px; border:1px solid var(--color-border); margin-top:20px;">
                <h4 style="font-weight:900; color:var(--color-primary); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                  <span>📍 بيانات العميل وإتمام الطلب (Live Checkout):</span>
                </h4>
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <div>
                    <label style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:700; display:block; margin-bottom:4px;">الاسم الكريم *</label>
                    <input type="text" id="checkoutNameInput" class="notes-input" placeholder="مثال: أحمد محمد" value="${user ? user.name : ''}" style="height:38px; width:100%;" />
                  </div>
                  
                  <div>
                    <label style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:700; display:block; margin-bottom:4px;">رقم الهاتف (للتوصيل والمتابعة) *</label>
                    <input type="tel" id="checkoutPhoneInput" class="notes-input" placeholder="010xxxxxxxx" value="${user ? user.phone : ''}" style="height:38px; width:100%; font-family:'Outfit';" />
                  </div>

                  <div>
                    <label style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:700; display:block; margin-bottom:4px;">العنوان بالتفصيل *</label>
                    <input type="text" id="checkoutAddressInput" class="notes-input" placeholder="شارع، رقم العمارة، الدور، الشقة..." value="${user ? user.address : ''}" style="height:38px; width:100%;" />
                  </div>

                  <div>
                    <label style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:700; display:block; margin-bottom:4px;">المنطقة / علامة مميزة (اختياري)</label>
                    <input type="text" id="checkoutAreaInput" class="notes-input" placeholder="مثال: أسيوط، بجوار بهية" value="${user && user.area ? user.area : 'أسيوط، شارع الأزهر'}" style="height:38px; width:100%;" />
                  </div>
                </div>

                <button class="btn btn-primary btn-lg btn-full" id="btnSubmitCartOrder" style="margin-top:16px; background:linear-gradient(135deg, #FF6B00, #FF8E00); font-weight:900;">
                  <span>🚀 إرسال الطلب فوراً للمطبخ (مزامنة لحظية)</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  `;
}

function createCartItemHtml(item, index) {
  const addsPrice = item.additions.reduce((sum, a) => sum + a.price, 0);
  const total = (item.price + addsPrice) * item.qty;
  const imgUrl = getProductImage(item.image);

  return `
    <div class="cart-item">
      <div class="cart-item-image"><img src="${imgUrl}" alt="${item.name}" /></div>
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <span class="cart-item-name-en">${item.nameEn}</span>
        ${item.additions.length > 0 ? `
          <div class="cart-item-additions">
            ${item.additions.map(a => `<span class="mini-tag">+ ${a.name} (+${a.price}ج)</span>`).join('')}
          </div>
        ` : ''}
        ${item.notes ? `<p class="cart-item-notes">📝 <strong>شروط:</strong> ${item.notes}</p>` : ''}
      </div>
      
      <div class="cart-item-controls">
        <div class="qty-mini">
          <button class="qty-btn-mini btn-cart-dec" data-index="${index}">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn-mini btn-cart-inc" data-index="${index}">+</button>
        </div>
        <span class="cart-item-price">${total} ج.م</span>
        <button class="cart-item-remove btn-cart-remove" data-index="${index}">🗑️</button>
      </div>
    </div>
  `;
}

function initCartPage() {
  document.getElementById('btnClearCartBtn')?.addEventListener('click', () => {
    sound.playClick();
    if (confirm('هل أنت متأكد من مسح وتفريغ السلة بالكامل؟')) {
      cart.clearCart();
      showToast('تم إفراغ سلتك بنجاح', 'info');
      refreshCartView();
    }
  });

  // Quantity updates
  document.querySelectorAll('.btn-cart-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const idx = parseInt(btn.dataset.index, 10);
      cart.updateQuantity(idx, cart.getItems()[idx].qty + 1);
      refreshCartView();
    });
  });

  document.querySelectorAll('.btn-cart-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const idx = parseInt(btn.dataset.index, 10);
      cart.updateQuantity(idx, cart.getItems()[idx].qty - 1);
      refreshCartView();
    });
  });

  document.querySelectorAll('.btn-cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const idx = parseInt(btn.dataset.index, 10);
      const name = cart.getItems()[idx].name;
      cart.removeItem(idx);
      showToast(`تم حذف كريب (${name}) من سلتك`, 'info');
      refreshCartView();
    });
  });

  // Apply promo coupon code
  document.getElementById('btnApplyCoupon')?.addEventListener('click', () => {
    sound.playClick();
    const code = document.getElementById('couponCodeInput').value;
    const res = cart.applyCoupon(code);
    if (res.success) {
      showToast(res.message, 'success');
      sound.playSuccess();
      refreshCartView();
    } else {
      showToast(res.message, 'error');
      sound.playError();
    }
  });

  document.getElementById('btnRemoveCoupon')?.addEventListener('click', () => {
    sound.playClick();
    cart.removeCoupon();
    showToast('تم إلغاء تفعيل الكوبون', 'info');
    refreshCartView();
  });

  // Real-Time Live Checkout process
  document.getElementById('btnSubmitCartOrder')?.addEventListener('click', () => {
    sound.playClick();
    
    const name = document.getElementById('checkoutNameInput')?.value.trim();
    const phone = document.getElementById('checkoutPhoneInput')?.value.trim();
    const address = document.getElementById('checkoutAddressInput')?.value.trim();
    const area = document.getElementById('checkoutAreaInput')?.value.trim();

    if (!name || !phone || !address) {
      showToast('⚠️ يرجى إكمال بيانات التوصيل الأساسية (الاسم، رقم الهاتف، العنوان بالتفصيل)', 'warning');
      sound.playError();
      return;
    }

    const user = auth.getUser();
    const items = cart.getItems();
    const finalTotal = cart.getFinalTotal(user);

    // Log this live order to admin portal log in real-time
    const itemsSummary = items.map(it => `${it.name} × ${it.qty}`).join('، ');
    const newOrder = admin.logOrder({
      customerName: name,
      phone: phone,
      address: `${address} ${area ? `(${area})` : ''}`,
      total: finalTotal,
      itemsSummary: itemsSummary
    });

    // Deduct inventory stock
    items.forEach(it => {
      if (it.id.includes('custom')) {
        admin.deductStock('cheese-mozz', 0.5);
        admin.deductStock('veggies-mix', 0.4);
      } else {
        admin.deductStock(it.id, it.qty);
      }
    });

    // If logged in or guest, update local loyalty profile if logged in
    if (user) {
      auth.completePurchase(finalTotal);
    }

    // Formulate WhatsApp message as optional fast track
    let msg = `*طلب كريب جديد ومؤكد من موقع حكاية 3D 🥙*\n`;
    msg += `*🔢 رقم حجز الطلب:* ${newOrder.id}\n\n`;
    msg += `*👤 العميل:* ${name}\n`;
    msg += `*📱 رقم الهاتف:* ${phone}\n`;
    msg += `*📍 عنوان التوصيل:* ${address} ${area ? `(${area})` : ''}\n`;
    msg += `*⏳ حالة الطلب:* 🆕 جديد (تم الإرسال لحظياً للمطبخ)\n`;
    msg += `\n*📋 تفاصيل الأصناف المطلوب تحضيرها:*\n`;
    
    items.forEach((it, idx) => {
      const addsPrice = it.additions.reduce((sum, a) => sum + a.price, 0);
      msg += `${idx + 1}. *${it.name}* × ${it.qty} = ${(it.price + addsPrice) * it.qty} ج.م\n`;
      if (it.additions.length > 0) {
        msg += `   _إضافات: ${it.additions.map(a => `${a.name} (+${a.price}ج)`).join('، ')}_\n`;
      }
      if (it.notes) {
        msg += `   _ملاحظات: ${it.notes}_\n`;
      }
    });

    msg += `\n*💵 إجمالي الحساب النهائي:* ${finalTotal} ج.م (توصيل مجاني)\n\n`;
    msg += `_تم إرسال الطلب ومزامنته في الوقت الفعلي مع لوحة تحكم الإدارة (Real-Time Live Sync)_`;

    // Trigger local audio complete
    sound.playSuccess();

    // Launch Confetti particle celebration!
    import('canvas-confetti').then(confettiModule => {
      const confetti = confettiModule.default;
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.6 } });
    });

    // Clear cart after submitting
    cart.clearCart();

    // Show success notification & WhatsApp option modal
    showToast(`🎉 تم إرسال طلبك (${newOrder.id}) بنجاح ومزامنته لحظياً مع المطبخ!`, 'success');
    showWhatsAppModal(msg);
  });
}

function refreshCartView() {
  const main = document.getElementById('mainContent');
  if (main) {
    main.innerHTML = renderCartPage();
    initCartPage();
  }
}

function showWhatsAppModal(msg) {
  const modal = document.createElement('div');
  modal.className = 'order-modal show';
  modal.innerHTML = `
    <div class="order-modal-content">
      <div class="order-success-icon">🎉</div>
      <h2 style="font-weight:900; color:var(--color-primary);">تم تجهيز فاتورتك بنجاح!</h2>
      <p style="margin:8px 0; color:var(--color-text-secondary); font-size:var(--font-size-sm);">اضغط على الزر لتأكيد وإرسال الفاتورة آلياً لخدمة عملاء كريب حكاية عبر الواتساب لتجهيز الطلب وخروجه للتوصيل.</p>
      
      <div class="order-summary-mini">
        <pre>${msg.replace(/\*/g, '')}</pre>
      </div>

      <div class="order-modal-actions">
        <a href="https://wa.me/201040622459?text=${encodeURIComponent(msg)}" target="_blank" class="btn btn-primary btn-lg" id="btnOpenWaLink">
          <span>إرسال وتأكيد عبر الواتساب 📱</span>
        </a>
        <button class="btn btn-glass" id="btnCloseWaModal">إغلاق</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  const close = () => modal.remove();
  document.getElementById('btnCloseWaModal').addEventListener('click', close);
  document.getElementById('btnOpenWaLink').addEventListener('click', () => {
    close();
    cart.clearCart();
    window.location.hash = '#/';
  });
}

/* ---------- B. AUTH REGISTRATION PAGE ---------- */
function renderAuthPage() {
  const isLoggedIn = auth.isLoggedIn();
  const user = auth.getUser();

  if (isLoggedIn) {
    return `
      <section class="page-header"><div class="container"><h1 class="page-title">حسابي الشخصي 👤</h1></div></section>
      <section class="section" style="background:var(--color-bg-deep);"><div class="container" style="max-width:600px;">
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h2 style="font-weight:900;">${user.name}</h2>
              <span class="loyalty-rank rank-${user.tier}">الرتبة: ${user.tier.toUpperCase()}</span>
            </div>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
            <div style="background:var(--color-bg); padding:12px; border-radius:8px; border:1px solid var(--color-border);">
              <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">الاسم بالكامل:</span>
              <strong>${user.name}</strong>
            </div>
            <div style="background:var(--color-bg); padding:12px; border-radius:8px; border:1px solid var(--color-border);">
              <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">رقم الموبايل:</span>
              <strong dir="ltr">${user.phone}</strong>
            </div>
            <div style="background:var(--color-bg); padding:12px; border-radius:8px; border:1px solid var(--color-border);">
              <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">العنوان الكامل للتوصيل:</span>
              <strong>${user.address} ${user.area ? `(${user.area})` : ''}</strong>
            </div>
          </div>

          <div style="display:flex; gap:12px;">
            <a href="#/dashboard" class="btn btn-primary" style="flex:1;">لوحة التحكم والجوائز 🪙</a>
            <button class="btn btn-glass" id="btnLogOutProfile" style="flex:1; color:var(--color-danger); border-color:rgba(248,113,113,0.3);">تسجيل الخروج 👋</button>
          </div>
        </div>
      </div></section>
    `;
  }

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">تسجيل البيانات في حكاية 📝</h1>
        <p class="page-subtitle">سجل رقمك وعنوانك بدقة لمرة واحدة لتسهيل سرعة التوصيل وجمع نقاط الهدايا</p>
      </div>
    </section>

    <section class="section" style="background:var(--color-bg-deep);">
      <div class="container" style="max-width:550px;">
        <div class="profile-card">
          <div class="auth-tabs" style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:20px;">
            <button class="auth-tab active" id="btnTabRegister" style="flex:1; padding:12px 0; font-weight:800; border-bottom:2px solid var(--color-primary);">حساب جديد 📝</button>
            <button class="auth-tab" id="btnTabLogin" style="flex:1; padding:12px 0; font-weight:800; color:var(--color-text-muted);">دخول سريع 🔑</button>
          </div>

          <!-- Register form -->
          <form id="regAccountForm" style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">👤 الاسم بالكامل:</label>
              <input type="text" id="rName" class="notes-input" placeholder="اكتب اسمك الثلاثي" required />
            </div>
            
            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">📱 رقم الموبايل (واتساب):</label>
              <input type="tel" id="rPhone" class="notes-input" placeholder="01xxxxxxxxx" maxlength="11" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">🔑 كلمة المرور:</label>
              <input type="password" id="rPassword" class="notes-input" placeholder="أدخل كلمة مرور (4 أرقام/حروف على الأقل)" required />
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">📍 عنوان التوصيل بالتفصيل الممل:</label>
              <textarea id="rAddress" class="notes-input" rows="3" placeholder="مثال: شارع الأزهر، بجوار مطعم بهية، أسيوط..." required></textarea>
            </div>

            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">🏘️ الحي/المنطقة السكنية (اختياري):</label>
              <input type="text" id="rArea" class="notes-input" placeholder="مثال: وسط البلد، الدرب الأحمر، الرحاب..." />
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full" style="margin-top:12px;">حفظ وتأكيد الحساب 🚀</button>
          </form>

          <!-- Login form -->
          <form id="loginAccountForm" class="hidden" style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">📱 أدخل رقم موبايلك المسجل لدينا:</label>
              <input type="tel" id="lPhone" class="notes-input" placeholder="01xxxxxxxxx" maxlength="11" required />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">🔑 أدخل كلمة المرور الخاصة بك:</label>
              <input type="password" id="lPassword" class="notes-input" placeholder="أدخل كلمة مرور الحساب" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-full">دخول الحساب 🚀</button>
          </form>

        </div>
      </div>
    </section>
  `;
}

function initAuthPage() {
  const isLoggedIn = auth.isLoggedIn();
  if (isLoggedIn) {
    document.getElementById('btnLogOutProfile')?.addEventListener('click', () => {
      sound.playClick();
      auth.logout();
      showToast('تم تسجيل الخروج بنجاح 👋', 'info');
      window.location.hash = '#/auth';
    });
    return;
  }

  const tabReg = document.getElementById('btnTabRegister');
  const tabLogin = document.getElementById('btnTabLogin');
  const fReg = document.getElementById('regAccountForm');
  const fLogin = document.getElementById('loginAccountForm');

  tabReg?.addEventListener('click', () => {
    sound.playClick();
    tabReg.classList.add('active');
    tabReg.style.borderBottom = '2px solid var(--color-primary)';
    tabReg.style.color = 'var(--color-text)';
    
    tabLogin.classList.remove('active');
    tabLogin.style.borderBottom = 'none';
    tabLogin.style.color = 'var(--color-text-muted)';
    
    fReg.classList.remove('hidden');
    fLogin.classList.add('hidden');
  });

  tabLogin?.addEventListener('click', () => {
    sound.playClick();
    tabLogin.classList.add('active');
    tabLogin.style.borderBottom = '2px solid var(--color-primary)';
    tabLogin.style.color = 'var(--color-text)';
    
    tabReg.classList.remove('active');
    tabReg.style.borderBottom = 'none';
    tabReg.style.color = 'var(--color-text-muted)';
    
    fLogin.classList.remove('hidden');
    fReg.classList.add('hidden');
  });

  // Handle register
  fReg?.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playClick();
    const name = document.getElementById('rName').value;
    const phone = document.getElementById('rPhone').value;
    const password = document.getElementById('rPassword').value;
    const address = document.getElementById('rAddress').value;
    const area = document.getElementById('rArea').value;

    const res = auth.register({ name, phone, password, address, area });
    if (res.success) {
      showToast(res.message, 'success');
      sound.playSuccess();
      window.location.hash = '#/dashboard';
    } else {
      showToast(res.message, 'error');
      sound.playError();
    }
  });

  // Handle login
  fLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playClick();
    const phone = document.getElementById('lPhone').value;
    const password = document.getElementById('lPassword').value;
    const res = auth.login(phone, password);
    if (res.success) {
      showToast(res.message, 'success');
      sound.playSuccess();
      window.location.hash = '#/dashboard';
    } else {
      showToast(res.message, 'error');
      sound.playError();
    }
  });
}

/* ---------- C. ABOUT COMPANY PAGE ---------- */
function renderAboutPage() {
  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">حكايتنا الكبيرة والجميلة 📖</h1>
        <p class="page-subtitle">قصة طعام وتفاني انطلقت من قلب أسيوط بفروعنا المميزة</p>
      </div>
    </section>

    <section class="section" style="background:var(--color-bg-deep);">
      <div class="container" style="max-width:850px; display:flex; flex-direction:column; gap:40px;">
        <div style="display:grid; grid-template-columns:1fr 1.1fr; gap:var(--space-2xl); align-items:center;">
          <div style="border-radius:24px; overflow:hidden;">
            <img src="${getProductImage('special')}" alt="كريب حكاية" style="width:100%; border:1px solid var(--color-border);" />
          </div>
          <div>
            <span class="section-tag">بدايتنا 📍</span>
            <h2 style="font-weight:900; font-size:2rem; margin-top:8px;">حكاية بدأت بشغف لتقديم طعم لا ينسى</h2>
            <p style="color:var(--color-text-secondary); line-height:1.8; margin-top:12px;">انطلق كريب حكاية من قلب أسيوط في شارع الأزهر بجوار مطعم بهية (من ناحية شارع الرحاب بجوار فريش وماركت وفر). كرسنا جهودنا يومياً في مطبخ حكاية لنصنع الكريب المبتكر بخلطات وبهارات فريدة، لتستمتع بكل لقمة مقرمشة.</p>
            <p style="color:var(--color-text-secondary); line-height:1.8; margin-top:8px;">نحن لا نبيع وجبات سريعة، بل نصنع قصص سعادة ولحظات لذيذة تجمع الأهل والأحباب.</p>
          </div>
        </div>

        <div style="background:var(--color-bg-card); border:1px solid var(--color-border); border-radius:24px; padding:var(--space-2xl); text-align:center;">
          <h3 style="font-weight:900; font-size:1.5rem; margin-bottom:20px; color:var(--color-primary);">تاريخ وإنجازات عائلة حكاية 🏆</h3>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px;">
            <div>
              <strong style="font-size:2.5rem; color:var(--color-secondary); font-family:'Outfit';">12K+</strong>
              <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">عميل ممتن</span>
            </div>
            <div>
              <strong style="font-size:2.5rem; color:var(--color-secondary); font-family:'Outfit';">45+</strong>
              <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">وصفة مبتكرة</span>
            </div>
            <div>
              <strong style="font-size:2.5rem; color:var(--color-secondary); font-family:'Outfit';">100%</strong>
              <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">مكونات طازجة يومية</span>
            </div>
            <div>
              <strong style="font-size:2.5rem; color:var(--color-secondary); font-family:'Outfit';">3</strong>
              <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">فروع لخدمتكم قريباً</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function initAboutPage() {}

/* ---------- D. CONTACT & MAP PAGE ---------- */
function renderContactPage() {
  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">تواصل معنا المباشر 📞</h1>
        <p class="page-subtitle">ارسل لنا اقتراحاتك، استفساراتك، أو اطلب مباشرة مع خدمة التوصيل</p>
      </div>
    </section>

    <section class="section" style="background:var(--color-bg-deep);">
      <div class="container" style="max-width:850px; display:flex; flex-direction:column; gap:40px;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
          
          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center;">
            <div style="font-size:2.2rem; margin-bottom:4px;">📍</div>
            <h3 style="font-weight:800;">مقر وعنوان حكاية</h3>
            <p style="color:var(--color-text-secondary); font-size:0.72rem; line-height:1.5; margin-top:8px;">شارع الأزهر، بجوار مطعم بهية (من ناحية شارع الرحاب، بجوار فريش وماركت وفر)، أسيوط</p>
          </div>

          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center;">
            <div style="font-size:2.2rem; margin-bottom:4px;">📞</div>
            <h3 style="font-weight:800;">أرقام الدليفري</h3>
            <p style="color:var(--color-primary); font-weight:800; font-family:'Outfit'; font-size:var(--font-size-sm); margin-top:8px;">
              01064319292<br>01130243484<br>01040622459
            </p>
          </div>

          <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-xl); border-radius:var(--radius-xl); text-align:center;">
            <div style="font-size:2.2rem; margin-bottom:4px;">🕐</div>
            <h3 style="font-weight:800;">ساعات العمل</h3>
            <p style="color:var(--color-text-secondary); font-size:0.8rem; line-height:1.5; margin-top:8px;">يومياً من الساعة 11:30 صباحاً وحتى 3:00 بعد منتصف الليل</p>
          </div>

        </div>

        <!-- Google Maps Integration link -->
        <div style="background:var(--color-bg-card); border:1px solid var(--color-border); padding:var(--space-2xl); border-radius:24px; text-align:center;">
          <h3 style="font-weight:900; margin-bottom:12px;">موقع كريب حكاية على الخريطة 🗺️</h3>
          <p style="color:var(--color-text-secondary); margin-bottom:20px; font-size:var(--font-size-sm);">تفضل بزيارة فرعنا في أسيوط واستمتع بمشاهدة الكريب وهو يخبز طازجاً أمام عينيك!</p>
          
          <div style="width:100%; height:250px; background:var(--color-bg); border-radius:16px; border:1.5px dashed var(--color-primary); display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <span style="font-size:3rem; margin-bottom:4px;">📍</span>
            <strong style="color:var(--color-secondary);">كريب حكاية (أسيوط)</strong>
            <p style="font-size:0.75rem; color:var(--color-text-muted); margin:4px 0 16px;">شارع الأزهر، بجوار مطعم بهية (ناحية شارع الرحاب)، أسيوط</p>
            <a href="https://maps.google.com/?q=شارع+الأزهر+أسيوط+مصر" target="_blank" class="btn btn-primary">عرض على خرائط جوجل (Google Maps) 🌎</a>
          </div>
        </div>

      </div>
    </section>
  `;
}

function initContactPage() {}

/* ============================================================
   5. APP INITIALIZATION & BOOTSTRAPPING
   ============================================================ */

function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (currentScroll > lastScroll && currentScroll > 150) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('mobileOverlay');

  const close = () => {
    toggle?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.classList.remove('no-scroll');
    if (overlay) overlay.style.display = 'none';
  };

  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('active');
    overlay?.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
    if (overlay) {
      if (overlay.classList.contains('active')) {
        overlay.style.display = 'flex';
      } else {
        overlay.style.display = 'none';
      }
    }
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', close);
  });
}

function initGlobals() {
  // Update badges count and active tags
  const updateBadge = () => {
    const count = cart.getCount();
    const badge = document.getElementById('cartCount');
    if (badge) {
      badge.innerText = count;
      if (count > 0) {
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  };

  const updateAuthIndicator = () => {
    const user = auth.getUser();
    const btnText = document.getElementById('authBtnText');
    if (btnText) {
      btnText.innerText = user ? user.name.split(' ')[0] : 'حسابي';
    }
  };

  cart.onChange(updateBadge);
  auth.onChange(updateAuthIndicator);

  updateBadge();
  updateAuthIndicator();
}

function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('crepe_hekaya_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('theme-light');
  }

  toggleBtn?.addEventListener('click', () => {
    sound.playClick();
    const isLight = document.body.classList.toggle('theme-light');
    localStorage.setItem('crepe_hekaya_theme', isLight ? 'light' : 'dark');
  });
}

function initApp() {
  // Initialize Lenis smooth scroll
  try {
    lenisScroll = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true
    });

    const raf = (time) => {
      lenisScroll.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } catch (e) {
    console.warn('Lenis smooth scrolling disabled', e);
  }

  // Play cinematic intro loader
  const loader = new IntroLoader();
  loader.show();

  // Initialize interactive cursor
  const cursor = new CustomCursor();
  cursor.init();

  // App navbar, theme and routing triggers
  initNavbar();
  initMobileMenu();
  initGlobals();
  initThemeToggle();

  window.addEventListener('hashchange', router);
  router(); // Initial page routing on load
}

// Bootstrapper trigger with guard to prevent duplicate initialization from module imports
if (!window.appInitialized) {
  window.appInitialized = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
