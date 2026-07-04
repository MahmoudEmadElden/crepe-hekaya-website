/* ============================================================
   كريب حكاية — Crepe Hekaya
   Media Gallery & Lightbox Viewer Page
   ============================================================ */

import { getProductImage } from '../data.js';
import sound from '../components/sound.js';

const galleryPhotos = [
  { name: 'كريب البانيه الذهبي المقرمش', file: 'chicken' },
  { name: 'كريب اللحم البلدي المشوي', file: 'meat' },
  { name: 'كريب سي فوود تونة قطع', file: 'seafood' },
  { name: 'ميكس كريب الطاقة بالنوتيلا والموز', file: 'nutella' },
  { name: 'كريب ميكس جبن سايح مطاطي', file: 'cheese' },
  { name: 'كريب البطاطس المقلية الذهبية', file: 'fries' },
  { name: 'كريب الملك وصاروخ حكاية الأسطوري', file: 'special' },
  { name: 'كومبو التوفير الكبير الجديد', file: 'combo' }
];

export function render() {
  return `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">معرض صور ومطبخ حكاية 📸</h1>
        <p class="page-subtitle">شاهد الجودة، النظافة، ولمسات شيف حكاية السحرية في تحضير طلبك</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        
        <!-- Masonry Grid -->
        <div style="column-count:3; column-gap:16px; margin-bottom:var(--space-2xl);" class="gallery-masonry" id="galleryGrid">
          ${galleryPhotos.map((photo, index) => `
            <div style="break-inside:avoid; background:var(--color-bg-card); border:1px solid var(--color-border); border-radius:var(--radius-xl); overflow:hidden; margin-bottom:16px; cursor:pointer; position:relative;" class="gallery-item" data-index="${index}">
              <img src="${getProductImage(photo.file)}" alt="${photo.name}" style="width:100%; display:block; transition:transform 0.4s;" />
              <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%); display:flex; align-items:flex-end; padding:16px; opacity:0; transition:opacity 0.3s;" class="gallery-hover-desc">
                <span style="font-weight:700; font-size:var(--font-size-sm); color:#F5F5F7;">${photo.name}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 360 viewer links -->
        <div style="background:var(--glass-bg); padding:var(--space-2xl); border-radius:var(--radius-2xl); border:1px solid var(--color-border); text-align:center;">
          <h2 style="font-weight:900; color:var(--color-primary);">جولة 360 درجة داخل مطبخ حكاية 🎥</h2>
          <p style="color:var(--color-text-secondary); max-width:540px; margin:4px auto 20px;">نحن نؤمن بالشفافية الكاملة! خذ جولة افتراضية بزاوية 360 درجة لمشاهدة مطبخنا ومستوى النظافة والتعقيم الفائق أثناء تحضير الكريب.</p>
          <a href="https://maps.google.com" target="_blank" class="btn btn-primary btn-lg">ابدأ الجولة الافتراضية 360 🌍</a>
        </div>

      </div>
    </section>

    <!-- Lightbox Modal container -->
    <div id="lightboxOverlay" style="position:fixed; inset:0; background:rgba(18,18,18,0.95); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:9999; opacity:0; visibility:hidden; transition:all 0.3s;">
      <button id="btnPrevLightbox" style="position:absolute; right:3%; font-size:3rem; color:#F5F5F7; z-index:10;">‹</button>
      <div style="max-width:85%; max-height:80%; display:flex; flex-direction:column; align-items:center; gap:12px;">
        <img id="lightboxImg" src="" alt="" style="max-width:100%; max-height:85vh; border-radius:12px; box-shadow:var(--shadow-xl);" />
        <h3 id="lightboxTitle" style="color:#FFF3C2; font-weight:800;"></h3>
      </div>
      <button id="btnNextLightbox" style="position:absolute; left:3%; font-size:3rem; color:#F5F5F7; z-index:10;">›</button>
      <button id="btnCloseLightbox" style="position:absolute; top:20px; right:20px; font-size:2rem; color:#F5F5F7; z-index:10;">&times;</button>
    </div>
  `;
}

export function init() {
  const items = document.querySelectorAll('.gallery-item');
  const overlay = document.getElementById('lightboxOverlay');
  const lbImg = document.getElementById('lightboxImg');
  const lbTitle = document.getElementById('lightboxTitle');
  
  let currentIndex = 0;

  const showPhoto = (index) => {
    currentIndex = index;
    const photo = galleryPhotos[currentIndex];
    if (lbImg && lbTitle) {
      lbImg.src = getProductImage(photo.file);
      lbTitle.innerText = photo.name;
    }
  };

  items.forEach(item => {
    // Show hover description
    const overlayDesc = item.querySelector('.gallery-hover-desc');
    item.addEventListener('mouseenter', () => {
      if (overlayDesc) overlayDesc.style.opacity = 1;
      const img = item.querySelector('img');
      if (img) img.style.transform = 'scale(1.05)';
    });
    item.addEventListener('mouseleave', () => {
      if (overlayDesc) overlayDesc.style.opacity = 0;
      const img = item.querySelector('img');
      if (img) img.style.transform = 'scale(1)';
    });

    item.addEventListener('click', () => {
      sound.playClick();
      const index = parseInt(item.dataset.index, 10);
      showPhoto(index);
      if (overlay) {
        overlay.style.opacity = 1;
        overlay.style.visibility = 'visible';
      }
    });
  });

  // Lightbox controllers
  const close = () => {
    if (overlay) {
      overlay.style.opacity = 0;
      overlay.style.visibility = 'hidden';
    }
  };

  document.getElementById('btnCloseLightbox')?.addEventListener('click', close);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.getElementById('btnNextLightbox')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playClick();
    const nextIdx = (currentIndex + 1) % galleryPhotos.length;
    showPhoto(nextIdx);
  });

  document.getElementById('btnPrevLightbox')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playClick();
    const prevIdx = (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    showPhoto(prevIdx);
  });
}

export function destroy() {}
