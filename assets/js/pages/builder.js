/* ============================================================
   كريب حكاية — Crepe Hekaya
   2D Interactive Crepe Customizer Builder Page (No WebGL)
   ============================================================ */

import { cart } from '../core/cart.js?v=9.4';
import { auth } from '../core/auth.js?v=9.4';
import { showToast } from '../../../app.js';
import sound from '../components/sound.js?v=9.4';

let currentDough = 'normal';
const selectedToppings = new Set();

// Pricing & Nutrition maps
const ingredientDetails = {
  // Meats
  'meat-strips': { name: 'استربس مقرمش', price: 25, kcal: 180, weight: 80, time: 2.0 },
  'meat-zinger': { name: 'زنجر دجاج حار', price: 25, kcal: 190, weight: 80, time: 2.5 },
  'meat-pane': { name: 'دجاج بانيه', price: 20, kcal: 170, weight: 80, time: 2.0 },
  'meat-kofta': { name: 'كفتة مشوية', price: 25, kcal: 210, weight: 90, time: 3.0 },
  'meat-sausage': { name: 'سوسيس بلدي', price: 20, kcal: 185, weight: 80, time: 2.0 },
  // Seafood
  'sf-shrimp': { name: 'جمبري مشوي', price: 35, kcal: 110, weight: 70, time: 2.5 },
  // Cheese
  'ch-mozzarella': { name: 'جبنة موتزاريللا', price: 15, kcal: 120, weight: 40, time: 1.0 },
  'ch-cheddar': { name: 'صوص جبن شيدر ذائب', price: 15, kcal: 130, weight: 40, time: 0.5 },
  'ch-rumi': { name: 'جبنة رومي مبشور', price: 15, kcal: 115, weight: 40, time: 1.0 },
  // Veggies
  'vg-lettuce': { name: 'خس طازج', price: 5, kcal: 10, weight: 30, time: 0 },
  'vg-tomato': { name: 'مكعبات طماطم', price: 5, kcal: 15, weight: 30, time: 0 },
  'vg-olive': { name: 'زيتون أسود', price: 5, kcal: 25, weight: 20, time: 0 },
  'vg-pepper': { name: 'فلفل أخضر', price: 5, kcal: 12, weight: 30, time: 0.2 },
  'vg-jalapeno': { name: 'هالابينو حار', price: 8, kcal: 10, weight: 20, time: 0 },
  // Sauces
  'sc-ketchup': { name: 'كاتشب الطماطم', price: 5, kcal: 40, weight: 15, time: 0 },
  'sc-mayo': { name: 'مايونيز كريمي', price: 5, kcal: 90, weight: 15, time: 0 },
  'sc-ranch': { name: 'صوص رانش', price: 5, kcal: 75, weight: 15, time: 0 },
  'sc-spicy': { name: 'صوص حار جداً', price: 5, kcal: 20, weight: 15, time: 0 },
  'sc-bbq': { name: 'صوص باربكيو', price: 5, kcal: 50, weight: 15, time: 0 }
};

export function render() {
  selectedToppings.clear();
  currentDough = 'normal';

  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">اصنع الكريب الخاص بك على ذوقك 🥙</h1>
        <p class="page-subtitle">اختر نوع العجين، الإضافات، الجبن والصلصات المفضلة لديك بالكامل وبشكل مخصص</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="product-detail-grid">
          
          <!-- 2D Interactive Live Visual Left -->
          <div class="product-visual" style="position:sticky; top:20px; align-self:start;">
            <div style="background:var(--color-bg-card); border:1px solid var(--color-border); border-radius:var(--radius-2xl); height:350px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; box-shadow:inset 0 0 40px rgba(0,0,0,0.65);">
              
              <!-- Spinning Crepe Base -->
              <div id="crepeBase2D" style="width:200px; height:200px; border-radius:50%; background:radial-gradient(circle, #f5d18d 0%, #d49c3f 100%); box-shadow:0 10px 35px rgba(212,156,63,0.35); transition:all 0.4s ease; display:flex; align-items:center; justify-content:center; padding:20px; text-align:center; transform: rotate(0deg); cursor:pointer;">
                <span id="crepeBaseLabel" style="font-weight:900; color:#3e2305; font-size:1.05rem;">كريب عادي ذهبي</span>
              </div>
              
              <!-- Toppings dynamic badges list -->
              <div id="builderToppingsOverlay" style="position:absolute; bottom:20px; left:16px; right:16px; display:flex; gap:6px; flex-wrap:wrap; justify-content:center; max-height:80px; overflow-y:auto; padding:4px;">
                <span style="font-size:0.78rem; color:var(--color-text-muted);">ابدأ باختيار المكونات من لوحة التحكم...</span>
              </div>
            </div>
            
            <div class="product-3d-controls" style="margin-top:16px;">
              <div style="font-size:0.8rem; color:var(--color-text-secondary); display:flex; justify-content:space-between; width:100%; border:1px solid var(--color-border); padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.01);">
                <span>⚖️ الوزن: <strong id="valWeight" style="color:var(--color-secondary);">200</strong> جم</span>
                <span>🔥 طاقة: <strong id="valKcal" style="color:var(--color-secondary);">350</strong> سعرة</span>
                <span>⏱️ طهي: <strong id="valTime" style="color:var(--color-secondary);">4.0</strong> دقيقة</span>
              </div>
            </div>
          </div>

          <!-- Controls panel Right -->
          <div class="product-detail-info">
            <h2 style="font-weight:900; color:var(--color-primary);">تفصيل كريب مخصص على مزاجك ✨</h2>
            <p style="color:var(--color-text-secondary); margin-top:-10px; font-size:var(--font-size-sm);">اختر المكونات والصلصات المفضلة لديك بالأسفل وسيتحدث السعر مباشرة:</p>

            <!-- Step 1: Dough Selection -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--color-border); padding:16px; border-radius:16px; margin-bottom:16px;">
              <h3 style="font-size:var(--font-size-sm); font-weight:800; margin-bottom:12px; color:var(--color-text);">🥞 1. اختر نوع عجين خبز الكريب:</h3>
              <div style="display:flex; gap:12px;">
                <label class="addition-option" style="flex:1; cursor:pointer;">
                  <input type="radio" name="doughType" class="dough-radio" value="normal" checked />
                  <span style="font-size:var(--font-size-sm); font-weight:700; margin-right:8px;">عجينة ذهبية مقرمشة</span>
                </label>
                <label class="addition-option" style="flex:1; cursor:pointer;">
                  <input type="radio" name="doughType" class="dough-radio" value="chocolate" />
                  <span style="font-size:var(--font-size-sm); font-weight:700; margin-right:8px;">عجينة شوكولاتة نوتيلا</span>
                </label>
              </div>
            </div>

            <!-- Step 2: Meats Selection -->
            <div class="product-additions">
              <h3>🍗 2. اللحوم والدجاج المشوي والمقرمش:</h3>
              <div class="additions-options">
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="meat-strips" />
                  <span class="addition-label">
                    <span>استربس صدور دجاج</span>
                    <span class="addition-price-tag">+25 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="meat-zinger" />
                  <span class="addition-label">
                    <span>زنجر دجاج حار</span>
                    <span class="addition-price-tag">+25 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="meat-pane" />
                  <span class="addition-label">
                    <span>دجاج بانيه ذهبي</span>
                    <span class="addition-price-tag">+20 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="meat-kofta" />
                  <span class="addition-label">
                    <span>كفتة مشوية متبلة</span>
                    <span class="addition-price-tag">+25 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="meat-sausage" />
                  <span class="addition-label">
                    <span>سوسيس شرائح</span>
                    <span class="addition-price-tag">+20 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="sf-shrimp" />
                  <span class="addition-label">
                    <span>جمبري مشوي طازج</span>
                    <span class="addition-price-tag">+35 ج.م</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Step 3: Cheeses Selection -->
            <div class="product-additions">
              <h3>🧀 3. الجبن السائل والمطاطي:</h3>
              <div class="additions-options">
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="ch-mozzarella" />
                  <span class="addition-label">
                    <span>جبنة موتزاريللا دبل</span>
                    <span class="addition-price-tag">+15 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="ch-cheddar" />
                  <span class="addition-label">
                    <span>صوص جبن شيدر ذائب</span>
                    <span class="addition-price-tag">+15 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="ch-rumi" />
                  <span class="addition-label">
                    <span>جبنة رومي مبشورة</span>
                    <span class="addition-price-tag">+15 ج.م</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Step 4: Vegetables Selection -->
            <div class="product-additions">
              <h3>🥗 4. الخضروات الورقية والمكعبات:</h3>
              <div class="additions-options">
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="vg-lettuce" />
                  <span class="addition-label">
                    <span>خس أخضر طازج</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="vg-tomato" />
                  <span class="addition-label">
                    <span>طماطم مقطعة</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="vg-olive" />
                  <span class="addition-label">
                    <span>زيتون أسود مفروم</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="vg-pepper" />
                  <span class="addition-label">
                    <span>فلفل أخضر مقرمش</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="vg-jalapeno" />
                  <span class="addition-label">
                    <span>هالابينو مكسيكي حار</span>
                    <span class="addition-price-tag">+8 ج.م</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Step 5: Sauces Selection -->
            <div class="product-additions">
              <h3>🥫 5. الصلصات والصوصات:</h3>
              <div class="additions-options">
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="sc-ketchup" />
                  <span class="addition-label">
                    <span>كاتشب هاينز</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="sc-mayo" />
                  <span class="addition-label">
                    <span>مايونيز كريمي غني</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="sc-ranch" />
                  <span class="addition-label">
                    <span>صوص رانش بارد</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="sc-spicy" />
                  <span class="addition-label">
                    <span>صوص حار سريراتشا</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
                <label class="addition-option">
                  <input type="checkbox" class="build-topping-chk" data-id="sc-bbq" />
                  <span class="addition-label">
                    <span>صوص باربكيو مدخن</span>
                    <span class="addition-price-tag">+5 ج.م</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Custom Recipe Naming -->
            <div class="product-notes">
              <h3>📝 اسم الكريب الخاص بك (لحفظه في المفضلة)</h3>
              <input type="text" id="customCrepeName" class="notes-input" placeholder="مثال: كريب الملك الأسطوري، كريب الشلة المفضل..." />
            </div>

            <!-- Total Price section & actions -->
            <div class="product-order-section" style="border-top:1px solid var(--color-border); padding-top:var(--space-xl); margin-top:16px;">
              <div class="product-total">
                <span class="total-label">السعر الإجمالي: </span>
                <span class="total-amount" id="builderTotalPrice">40</span>
                <span class="total-currency">ج.م</span>
              </div>
              
              <div style="display:flex; gap:12px; align-items:center;">
                <button class="btn btn-glass" id="btnSaveToDashboard">حفظ في المفضلة ⭐</button>
                <button class="btn btn-primary" id="btnBuilderAddToCart">أضف للسلة 🛒</button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  `;
}

export function init() {
  const crepeBase = document.getElementById('crepeBase2D');
  const crepeLabel = document.getElementById('crepeBaseLabel');

  // Radio listener for dough base bread changes
  document.querySelectorAll('.dough-radio').forEach(radio => {
    radio.addEventListener('change', (e) => {
      sound.playClick();
      currentDough = e.target.value;
      if (currentDough === 'chocolate') {
        crepeBase.style.background = 'radial-gradient(circle, #5c3a21 0%, #301b0f 100%)';
        crepeBase.style.boxShadow = '0 10px 35px rgba(92,58,33,0.35)';
        crepeLabel.innerText = 'كريب شوكولاتة حلو';
        crepeLabel.style.color = '#fff';
      } else {
        crepeBase.style.background = 'radial-gradient(circle, #f5d18d 0%, #d49c3f 100%)';
        crepeBase.style.boxShadow = '0 10px 35px rgba(212,156,63,0.35)';
        crepeLabel.innerText = 'كريب عادي ذهبي';
        crepeLabel.style.color = '#3e2305';
      }
      recalculateStats();
    });
  });

  // Checkbox listeners for toppings additions
  document.querySelectorAll('.build-topping-chk').forEach(chk => {
    chk.addEventListener('change', (e) => {
      sound.playClick();
      const id = e.target.dataset.id;
      const visible = e.target.checked;
      
      if (visible) {
        selectedToppings.add(id);
      } else {
        selectedToppings.delete(id);
      }

      // Add spin rotation effect to crepe base for interactivity
      const currentRotation = parseInt(crepeBase.style.transform.replace(/[^0-9]/g, '') || '0', 10);
      crepeBase.style.transform = `rotate(${currentRotation + 45}deg)`;

      recalculateStats();
    });
  });

  // Action: Save to loyalty recipes dashboard
  document.getElementById('btnSaveToDashboard')?.addEventListener('click', () => {
    sound.playClick();
    const nameInput = document.getElementById('customCrepeName');
    const name = nameInput?.value.trim() || 'كريب مخصص حكاية';
    
    if (!auth.isLoggedIn()) {
      showToast('يرجى إنشاء حساب أو تسجيل الدخول لحفظ الكريب في حسابك الشخصي 👤', 'warning');
      window.location.hash = '#/auth';
      return;
    }

    const toppingsSummary = Array.from(selectedToppings).map(t => ingredientDetails[t].name);
    const details = {
      dough: currentDough === 'chocolate' ? 'عجينة شوكولاتة' : 'عجينة ذهبية',
      toppings: toppingsSummary,
      price: getComputedPrice(),
      weight: getComputedWeight(),
      kcal: getComputedKcal(),
      time: getComputedTime()
    };

    auth.saveRecipe(name, details);
    showToast(`تم حفظ وصفة كريب (${name}) بنجاح في حسابك! يمكنك طلبها بضغطة واحدة من لوحة التحكم.`, 'success');
    sound.playSuccess();
    if (nameInput) nameInput.value = '';
  });

  // Action: Add Custom Crepe to Cart
  document.getElementById('btnBuilderAddToCart')?.addEventListener('click', () => {
    sound.playClick();
    
    const toppingsSummary = Array.from(selectedToppings).map(t => ({
      id: t,
      name: ingredientDetails[t].name,
      price: ingredientDetails[t].price
    }));

    const customName = document.getElementById('customCrepeName')?.value.trim() || 'كريب على مزاجك مخصص';
    const total = getComputedPrice();

    const mockItem = {
      id: 'custom-' + Math.floor(Math.random() * 900 + 100),
      name: customName,
      nameEn: 'My Custom Crepe',
      price: total,
      image: currentDough === 'chocolate' ? 'nutella' : 'special'
    };

    const notes = `العجينة: ${currentDough === 'chocolate' ? 'شوكولاتة' : 'عادية'}`;

    cart.addItem(mockItem, 1, toppingsSummary, notes, {
      dough: currentDough,
      toppings: Array.from(selectedToppings)
    });

    showToast(`تمت إضافة كريبك المخصص (${customName}) إلى السلة بنجاح!`, 'cart');
    sound.playSuccess();
  });
}

function getComputedPrice() {
  let price = 40; // Base dough price
  selectedToppings.forEach(t => {
    price += ingredientDetails[t].price;
  });
  return price;
}

function getComputedWeight() {
  let weight = 200; // Base dough weight
  selectedToppings.forEach(t => {
    weight += ingredientDetails[t].weight;
  });
  return weight;
}

function getComputedKcal() {
  let kcal = 350; // Base dough calories
  selectedToppings.forEach(t => {
    kcal += ingredientDetails[t].kcal;
  });
  return kcal;
}

function getComputedTime() {
  let time = 4.0; // Base baking time
  selectedToppings.forEach(t => {
    time += ingredientDetails[t].time;
  });
  return time;
}

function recalculateStats() {
  const price = getComputedPrice();
  const weight = getComputedWeight();
  const kcal = getComputedKcal();
  const time = getComputedTime();

  document.getElementById('builderTotalPrice').innerText = price;
  document.getElementById('valWeight').innerText = weight;
  document.getElementById('valKcal').innerText = kcal;
  document.getElementById('valTime').innerText = time.toFixed(1);

  // Update dynamic 2D toppings overlay list
  const overlay = document.getElementById('builderToppingsOverlay');
  if (overlay) {
    if (selectedToppings.size === 0) {
      overlay.innerHTML = `<span style="font-size:0.78rem; color:var(--color-text-muted);">ابدأ باختيار المكونات من لوحة التحكم...</span>`;
    } else {
      overlay.innerHTML = Array.from(selectedToppings).map(t => `
        <span style="font-size:0.75rem; background:rgba(255,209,102,0.15); color:var(--color-secondary); border:1px solid rgba(255,209,102,0.3); padding:2px 8px; border-radius:10px; font-weight:800;">
          ${ingredientDetails[t].name}
        </span>
      `).join('');
    }
  }

  // Trigger brief scale up on price
  const priceEl = document.getElementById('builderTotalPrice');
  if (priceEl) {
    priceEl.classList.add('price-update');
    setTimeout(() => priceEl.classList.remove('price-update'), 200);
  }
}

export function destroy() {}
