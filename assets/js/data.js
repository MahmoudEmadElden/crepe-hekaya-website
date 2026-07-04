/* ============================================================
   كريب حكاية — Crepe Hekaya
   Central Product, Category & Offers Data Source (Strict Menu Alignment)
   ============================================================ */

export const categories = [
  { id: 'new', name: 'جديد NEW', nameEn: 'New Specials', icon: '', color: '#e74c3c' },
  { id: 'custom', name: 'كريب على مزاجك', nameEn: 'Special Custom', icon: '', color: '#1abc9c' },
  { id: 'chicken', name: 'كريب حكاية فراخ', nameEn: 'Chicken Crepes', icon: '', color: '#FF6B00' },
  { id: 'meat', name: 'كريب حكاية لحمة', nameEn: 'Meat Crepes', icon: '', color: '#FFD166' },
  { id: 'mix', name: 'الميكسات', nameEn: 'Mix Crepes', icon: '', color: '#ff8c33' },
  { id: 'fries', name: 'بطاطس', nameEn: 'Fries & Sides', icon: '', color: '#e67e22' },
  { id: 'seafood', name: 'سي فود', nameEn: 'Seafood', icon: '', color: '#3498db' },
  { id: 'cheese', name: 'ركن الجبن', nameEn: 'Cheese Corner', icon: '', color: '#fbbf24' },
  { id: 'sweet', name: 'كريب الطاقة', nameEn: 'Sweet Crepes', icon: '', color: '#8B4513' },
  { id: 'drinks', name: 'مشروبات وعصائر', nameEn: 'Drinks & Juices', icon: '', color: '#9b59b6' }
];

// Default menu items list
const defaultMenuItems = [
  // --- جديد NEW ---
  { id: 'nw-zone', category: 'new', name: 'كريب زون', nameEn: 'Crepe Zone', price: 130, description: '', ingredients: ['كوردن بلو', 'زنجر', 'تركي مدخن', 'خضار', 'موزريلا', 'صوص', 'شيدر'], image: 'assets/images/products/nw-zone.webp', isNew: true },
  { id: 'nw-kemo', category: 'new', name: 'كريب كيمو', nameEn: 'Kemo Crepe', price: 130, description: '', ingredients: ['سوبر كرانشي', 'كوردن بلو', 'بطاطس', 'خس', 'صوص شيدر', 'موزريلا'], image: 'assets/images/products/nw-kemo.webp', isNew: true },
  { id: 'nw-turbo', category: 'new', name: 'كريب تربو', nameEn: 'Turbo Crepe', price: 120, description: '', ingredients: ['كرانشي', 'سوسيس', 'بطاطس', 'خس', 'صوص', 'موزريلا', 'شيدر'], image: 'assets/images/products/nw-turbo.webp', isNew: true },
  { id: 'nw-diamond', category: 'new', name: 'كريب دياموند', nameEn: 'Diamond Crepe', price: 125, description: '', ingredients: ['بانيه كرسبي', 'استربس', 'سوسيس', 'خس', 'صوص', 'موزريلا', 'شيدر'], image: 'assets/images/products/nw-diamond.webp', isNew: true },
  { id: 'nw-joker', category: 'new', name: 'كريب جوكر', nameEn: 'Joker Crepe', price: 115, description: '', ingredients: ['فراخ فرايد', 'تشيكن', 'بطاطس', 'خس', 'صوص', 'شيدر', 'موزريلا'], image: 'assets/images/products/nw-joker.webp', isNew: true },
  { id: 'nw-ranch', category: 'new', name: 'كريب تشكن رانش', nameEn: 'Chicken Ranch', price: 120, description: '', ingredients: ['كرسبي', 'كرانشي', 'بطاطس', 'موزريلا', 'فلفل', 'طماطم', 'صوص رانش'], image: 'assets/images/products/nw-ranch.png', isNew: true },
  { id: 'nw-fried-chk', category: 'new', name: 'كريب فرايد تشكن', nameEn: 'Fried Chicken Crepe', price: 120, description: '', ingredients: ['صدور فراخ حار أو بارد', 'موزريلا', 'صوص شيدر', 'خضار'], image: 'assets/images/products/nw-fried-chk.png', isNew: true },
  { id: 'nw-cheese-bomb', category: 'new', name: 'كريب تشيز بوم', nameEn: 'Cheese Bomb Special', price: 140, description: '', ingredients: ['كرانشي', 'كوردن بلو', 'موزريلا صوابع', 'تركي مدخن', 'موزريلا', 'صوص شيدر', 'خس'], image: 'assets/images/products/nw-cheese-bomb.webp', isNew: true },

  // --- كريب على مزاجك ---
  { id: 'cst-beast', category: 'custom', name: 'الوحش', nameEn: 'The Beast', price: 95, description: '', ingredients: ['بانيه', 'كرسبي', 'كتيوشا', 'هوت دوج'], image: 'assets/images/products/cst-beast.webp' },
  { id: 'cst-sarokh', category: 'custom', name: 'الصاروخ', nameEn: 'The Rocket', price: 115, description: '', ingredients: ['بانيه', 'كرسبي', 'كتيوشا', 'هوت دوج', 'كفتة', 'برجر', 'بطاطس'], image: 'assets/images/products/cst-sarokh.webp', popular: true },
  { id: 'cst-habisha', category: 'custom', name: 'حبيشة', nameEn: 'Habisha Crepe', price: 125, description: '', ingredients: ['بانيه', 'كرسبي', 'كتيوشا', 'استربس', 'شيش', 'بطاطس'], image: 'assets/images/products/cst-habisha.png' },
  { id: 'cst-mix-spicy', category: 'custom', name: 'ميكس اسبايسي', nameEn: 'Mix Spicy', price: 100, description: '', ingredients: ['كرسبي', 'كتيوشا', 'استربس'], image: 'assets/images/products/cst-mix-spicy.png', spicy: true },
  { id: 'cst-koko-weak', category: 'custom', name: 'كوكو الضعيف', nameEn: 'Weak Koko', price: 80, description: '', ingredients: ['بانيه', 'ناجتس'], image: 'assets/images/products/cst-koko-weak.png' },
  { id: 'cst-mafia', category: 'custom', name: 'المافيا', nameEn: 'The Mafia', price: 140, description: '', ingredients: ['بانيه', 'كرسبي', 'شيش', 'إستربس', 'كوردن بلو'], image: 'assets/images/products/cst-mafia.png' },
  { id: 'cst-queen', category: 'custom', name: 'الملكة', nameEn: 'The Queen', price: 145, description: '', ingredients: ['بانيه', 'كرسبي', 'كتيوشا', 'استربس', 'شيش', 'هوت دوج', 'برجر', 'كفتة', 'بطاطس'], image: 'assets/images/products/cst-queen.png', popular: true },
  { id: 'cst-mazag', category: 'custom', name: 'كريب المزاج', nameEn: 'Mazag Crepe', price: 140, description: '', ingredients: ['كوردن بلو', 'إستربس', 'شيش', 'موزريلا', 'خضار'], image: 'assets/images/products/cst-mazag.png' },

  // --- كريب حكاية فراخ ---
  { id: 'chk-pane', category: 'chicken', name: 'بانيه', nameEn: 'Chicken Pane', price: 75, description: '', ingredients: ['بانيه دجاج', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-pane.webp', popular: true },
  { id: 'chk-nuggets', category: 'chicken', name: 'ناجتس', nameEn: 'Chicken Nuggets', price: 75, description: '', ingredients: ['ناجتس دجاج', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-nuggets.png' },
  { id: 'chk-crispy', category: 'chicken', name: 'كرسبي', nameEn: 'Crispy Chicken', price: 85, description: '', ingredients: ['دجاج كريسبي', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-crispy.webp', popular: true },
  { id: 'chk-katyusha', category: 'chicken', name: 'كتيوشا', nameEn: 'Katyusha Chicken', price: 85, description: '', ingredients: ['دجاج كتيوشا', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-katyusha.png' },
  { id: 'chk-crunchy', category: 'chicken', name: 'سوبر كرانشي', nameEn: 'Super Crunchy', price: 105, description: '', ingredients: ['دجاج كرانشي', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-crunchy.png' },
  { id: 'chk-strips', category: 'chicken', name: 'استربس', nameEn: 'Chicken Strips', price: 105, description: '', ingredients: ['دجاج استربس', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-strips.png', popular: true },
  { id: 'chk-zinger', category: 'chicken', name: 'زنجر', nameEn: 'Chicken Zinger', price: 105, description: '', ingredients: ['زنجر حار', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-zinger.png', spicy: true },
  { id: 'chk-cordon', category: 'chicken', name: 'كوردن بلو', nameEn: 'Cordon Bleu', price: 105, description: '', ingredients: ['كوردن بلو دجاج', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-cordon.png' },
  { id: 'chk-shawarma', category: 'chicken', name: 'شاورما فراخ', nameEn: 'Chicken Shawarma', price: 110, description: '', ingredients: ['شاورما دجاج', 'موتزاريللا', 'خضار', 'ثومية'], image: 'assets/images/products/chk-shawarma.png', popular: true },
  { id: 'chk-fajita', category: 'chicken', name: 'فاهيتا فراخ', nameEn: 'Chicken Fajita', price: 110, description: '', ingredients: ['فاهيتا دجاج', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-fajita.png' },
  { id: 'chk-shish', category: 'chicken', name: 'شيش طاووق', nameEn: 'Shish Tawook', price: 110, description: '', ingredients: ['شيش طاووق مشوي', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/chk-shish.png' },

  // --- كريب حكاية لحمة ---
  { id: 'mt-souseg', category: 'meat', name: 'سوسيس', nameEn: 'Sausage Meat', price: 90, description: '', ingredients: ['سوسيس', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/mt-souseg.png' },
  { id: 'mt-hotdog', category: 'meat', name: 'هوت دوج', nameEn: 'Hotdog', price: 90, description: '', ingredients: ['هوت دوج', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/mt-hotdog.png' },
  { id: 'mt-burger', category: 'meat', name: 'برجر', nameEn: 'Burger', price: 90, description: '', ingredients: ['برجر لحم', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/mt-burger.png' },
  { id: 'mt-kofta', category: 'meat', name: 'كفتة', nameEn: 'Kofta', price: 90, description: '', ingredients: ['كفتة مشوية', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/mt-kofta.png' },
  { id: 'mt-sizzling', category: 'meat', name: 'سجق', nameEn: 'Sizzling Sausage', price: 95, description: '', ingredients: ['سجق بلدي متبل', 'موتزاريللا', 'خضار', 'صوصات'], image: 'assets/images/products/mt-sizzling.webp', popular: true },

  // --- الميكسات ---
  { id: 'mix-pane-souseg', category: 'mix', name: 'بانيه على سوسيس', nameEn: 'Pane + Sausage', price: 80, description: '', ingredients: ['بانيه', 'سوسيس', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-pane-souseg.png' },
  { id: 'mix-pane-kofta', category: 'mix', name: 'بانيه على كفتة', nameEn: 'Pane + Kofta', price: 80, description: '', ingredients: ['بانيه', 'كفتة', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-pane-kofta.png' },
  { id: 'mix-pane-burger', category: 'mix', name: 'بانيه على برجر', nameEn: 'Pane + Burger', price: 80, description: '', ingredients: ['بانيه', 'برجر', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-pane-burger.png' },
  { id: 'mix-pane-sizzling', category: 'mix', name: 'بانيه على سجق', nameEn: 'Pane + Sausage Bladi', price: 80, description: '', ingredients: ['بانيه', 'سجق', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-pane-sizzling.png' },
  { id: 'mix-crispy-souseg', category: 'mix', name: 'كرسبي على سوسيس', nameEn: 'Crispy + Sausage', price: 85, description: '', ingredients: ['كرسبي', 'سوسيس', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-crispy-souseg.png' },
  { id: 'mix-crispy-kofta', category: 'mix', name: 'كرسبي على كفتة', nameEn: 'Crispy + Kofta', price: 85, description: '', ingredients: ['كرسبي', 'كفتة', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-crispy-kofta.png' },
  { id: 'mix-crispy-burger', category: 'mix', name: 'كرسبي على برجر', nameEn: 'Crispy + Burger', price: 85, description: '', ingredients: ['كرسبي', 'برجر', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-crispy-burger.png' },
  { id: 'mix-crispy-sizzling', category: 'mix', name: 'كرسبي على سجق', nameEn: 'Crispy + Sausage Bladi', price: 85, description: '', ingredients: ['كرسبي', 'سجق', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-crispy-sizzling.png' },
  { id: 'mix-shish-strips', category: 'mix', name: 'شيش على استربس', nameEn: 'Shish + Strips', price: 130, description: '', ingredients: ['شيش طاووق', 'استربس', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-shish-strips.png' },
  { id: 'mix-shawarma-cordon', category: 'mix', name: 'شاورما على كوردن', nameEn: 'Shawarma + Cordon', price: 130, description: '', ingredients: ['شاورما فراخ', 'كوردن بلو', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-shawarma-cordon.png' },
  { id: 'mix-shawarma-strips', category: 'mix', name: 'شاورما على استربس', nameEn: 'Shawarma + Strips', price: 130, description: '', ingredients: ['شاورما فراخ', 'استربس', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-shawarma-strips.png' },
  { id: 'mix-crispy-strips', category: 'mix', name: 'كرسبي على استربس', nameEn: 'Crispy + Strips', price: 100, description: '', ingredients: ['كرسبي', 'استربس', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-crispy-strips.png' },
  { id: 'mix-fries-pane', category: 'mix', name: 'بطاطس على بانيه', nameEn: 'Fries + Pane', price: 85, description: '', ingredients: ['بطاطس', 'بانيه دجاج', 'موتزاريللا', 'خضار'], image: 'assets/images/products/mix-fries-pane.png' },
  { id: 'mix-chicken-all', category: 'mix', name: 'ميكس فراخ (بانيه - كرسبي - استربس)', nameEn: 'All Chicken Mix', price: 100, description: '', ingredients: ['بانيه', 'كرسبي', 'استربس', 'موتزاريللا دبل'], image: 'assets/images/products/mix-chicken-all.webp', popular: true },
  { id: 'mix-meat-all', category: 'mix', name: 'ميكس لحمة (كفتة - برجر - هوت دوج)', nameEn: 'All Meat Mix', price: 100, description: '', ingredients: ['كفتة', 'برجر', 'هوت دوج', 'موتزاريللا دبل'], image: 'assets/images/products/mix-meat-all.webp' },
  { id: 'mix-cocktail', category: 'mix', name: 'كوكتيل (بانيه - كرسبي - كفتة - برجر)', nameEn: 'Cocktail Special Mix', price: 100, description: '', ingredients: ['بانيه', 'كرسبي', 'كفتة', 'برجر', 'موتزاريللا دبل'], image: 'assets/images/products/mix-cocktail.png', popular: true },

  // --- بطاطس ---
  { id: 'fr-crepe-fries', category: 'fries', name: 'كريب بطاطس', nameEn: 'Crepe Fries', price: 55, description: '', ingredients: ['بطاطس مقلية ذهبية دبل', 'موتزاريللا', 'خضار'], image: 'assets/images/products/fr-crepe-fries.webp' },
  { id: 'fr-packet-large', category: 'fries', name: 'باكت بطاطس كبير', nameEn: 'Large Fries Packet', price: 25, description: '', ingredients: ['باكت بطاطس مقرمشة حجم عائلي'], image: 'assets/images/products/fr-packet-large.png' },
  { id: 'fr-packet-small', category: 'fries', name: 'باكت بطاطس صغير', nameEn: 'Small Fries Packet', price: 20, description: '', ingredients: ['باكت بطاطس مقرمشة حجم فردي'], image: 'assets/images/products/fr-packet-small.png' },

  // --- سي فود ---
  { id: 'sf-tuna', category: 'seafood', name: 'تونة قطع', nameEn: 'Tuna Crepe', price: 95, description: '', ingredients: ['تونة قطع ممتازة', 'موتزاريللا', 'خضار'], image: 'assets/images/products/sf-tuna.webp' },

  // --- ركن الجبن ---
  { id: 'ch-mozzarella', category: 'cheese', name: 'موزاريلا', nameEn: 'Mozzarella Cheese', price: 70, description: '', ingredients: ['جبن موزاريلا دبل ذائب', 'خضار'], image: 'assets/images/products/ch-mozzarella.png' },
  { id: 'ch-rumi', category: 'cheese', name: 'رومي', nameEn: 'Rumi Cheese', price: 70, description: '', ingredients: ['جبن رومي مبشور دبل ذائب', 'خضار'], image: 'assets/images/products/ch-rumi.png' },
  { id: 'ch-mix-cheese', category: 'cheese', name: 'ميكس جبن (موزاريلا - رومي - شيدر)', nameEn: 'Mix Cheese Corner', price: 75, description: '', ingredients: ['جبن موزاريلا', 'رومي', 'شيدر ذائب', 'خضار'], image: 'assets/images/products/ch-mix-cheese.webp', popular: true },

  // --- كريب الطاقة (سويت) ---
  { id: 'sw-plain', category: 'sweet', name: 'نوتيلا سادة', nameEn: 'Plain Nutella', price: 65, description: '', ingredients: ['شوكولاتة نوتيلا أصلية'], image: 'assets/images/products/sw-plain.png' },
  { id: 'sw-banana', category: 'sweet', name: 'نوتيلا موز', nameEn: 'Nutella Banana', price: 70, description: '', ingredients: ['نوتيلا', 'قطع موز طازج'], image: 'assets/images/products/sw-banana.webp', popular: true },
  { id: 'sw-oreo', category: 'sweet', name: 'نوتيلا أوريو', nameEn: 'Nutella Oreo', price: 70, description: '', ingredients: ['نوتيلا', 'قطع بسكويت أوريو'], image: 'assets/images/products/sw-oreo.webp' },

  // --- MASHROOBAT & عصائر ---
  { id: 'dr-pepsi', category: 'drinks', name: 'بيبسي كولا دبل', nameEn: 'Pepsi Cola Double', price: 15, description: 'مشروب غازي مثلج ومنعش', ingredients: ['بيبسي كولا مثلج'], image: 'assets/images/products/dr-pepsi.png' },
  { id: 'dr-max-cola', category: 'drinks', name: 'كولا ماكس سكر زيرو', nameEn: 'Cola Max Zero Sugar', price: 15, description: 'مشروب غازي منعش خالي من السكر', ingredients: ['كولا ماكس زيرو'], image: 'assets/images/products/dr-cola.png' },
  { id: 'dr-water', category: 'drinks', name: 'زجاجة مياه معدنية', nameEn: 'Mineral Water Bottle', price: 10, description: 'مياه طبيعية نقية مثلجة', ingredients: ['مياه معدنية طبيعية'], image: 'assets/images/products/dr-water.png' },
  { id: 'dr-juice-mango', category: 'drinks', name: 'عصير مانجو طازج', nameEn: 'Fresh Mango Juice', price: 35, description: 'عصير طبيعي 100% غني ومنعش', ingredients: ['مانجو طبيعي طازج'], image: 'assets/images/products/dr-juice-mango.png' },
  { id: 'dr-juice-orange', category: 'drinks', name: 'عصير برتقال فريش', nameEn: 'Fresh Orange Juice', price: 25, description: 'برتقال معصور طازج غني بفيتامين سي', ingredients: ['برتقال فريش معصور'], image: 'assets/images/products/dr-juice-orange.png' }
];

// Load from localStorage safely with try-catch fallback
let tempMenu = defaultMenuItems;
try {
  const savedMenu = localStorage.getItem('crepe_hekaya_menu_items');
  if (savedMenu) {
    tempMenu = JSON.parse(savedMenu);
  }
} catch (e) {
  console.warn("Failed to parse menu items from storage, falling back to defaults", e);
}

export let menuItems = tempMenu;

export function saveMenuToStorage() {
  localStorage.setItem('crepe_hekaya_menu_items', JSON.stringify(menuItems));
}

// Safer dynamic updates for ES6 imports to bypass read-only bindings in strict engines
export function addMenuItem(item) {
  menuItems.push(item);
  saveMenuToStorage();
}

export function deleteMenuItem(id) {
  const index = menuItems.findIndex(i => i.id === id);
  if (index > -1) {
    menuItems.splice(index, 1);
    saveMenuToStorage();
    return true;
  }
  return false;
}

export const additions = [
  { id: 'add-fries', name: 'إضافة بطاطس 🍟', price: 10 },
  { id: 'add-cheddar-sauce', name: 'إضافة صوص شيدر 🧀', price: 15 },
  { id: 'add-ranch-sauce', name: 'إضافة صوص رانشي 🥛', price: 15 },
  { id: 'add-bbq-sauce', name: 'إضافة صوص باربكيو 🪵', price: 10 },
  { id: 'add-mozzarella', name: 'إضافة موزاريلا 🧀', price: 15 },
  { id: 'add-rumi', name: 'إضافة رومي 🧀', price: 15 },
  { id: 'add-meat-chicken', name: 'إضافة لحمة أو فراخ 🥩', price: 25 },
  { id: 'add-shish-strips-cordon', name: 'إضافة شيش أو استربس أو كوردن 🍗', price: 30 },
  { id: 'add-pane-crispy', name: 'إضافة بانيه أو كرسبي 🍗', price: 15 },
  { id: 'add-max-cola', name: 'إضافة ماكس كولا 🥤', price: 15 }
];

const imageMap = {
  chicken: 'assets/images/chicken_crepe.png',
  chicken_zinger: 'assets/images/chicken_zinger.png',
  chicken_shawarma: 'assets/images/chicken_shawarma.png',
  meat: 'assets/images/meat_crepe.png',
  meat_sausage: 'assets/images/meat_sausage.png',
  cheese_bomb: 'assets/images/cheese_bomb.png',
  nutella: 'assets/images/nutella_crepe.png',
  seafood: 'assets/images/seafood_crepe.jpg',
  cheese: 'assets/images/cheese_crepe.png',
  fries: 'assets/images/fries_crepe.jpg',
  special: 'assets/images/meat_crepe.png',
  combo: 'assets/images/chicken_crepe.png'
};

export function getProductImage(imgName) {
  if (imageMap[imgName]) {
    return imageMap[imgName];
  }
  return imgName || 'assets/images/chicken_crepe.png';
}

// --- OFFERS DEALS DATABASE SECTION ---
const defaultDeals = [
  {
    id: 'deal-chicken',
    name: 'عرض التشيكن',
    nameEn: 'Chicken Deal',
    description: '2 كريب تشيكن + 2 بيبسي ماكس',
    contents: ['كريب تشيكن × 2', 'بيبسي ماكس × 2'],
    price: 240,
    oldPrice: 290,
    badge: 'الأكثر طلباً',
    badgeColor: '#e67e22',
    borderColor: '#e67e22'
  },
  {
    id: 'deal-super',
    name: 'عرض السوبر',
    nameEn: 'Super Deal',
    description: 'كريب سوبر + بطاطس + بيبسي',
    contents: ['كريب سوبر × 1', 'بطاطس × 1', 'بيبسي × 1'],
    price: 130,
    oldPrice: 165,
    badge: 'توفير',
    badgeColor: '#1abc9c',
    borderColor: '#1abc9c'
  },
  {
    id: 'deal-super-crunchy',
    name: 'عرض السوبر كرانشي',
    nameEn: 'Super Crunchy Deal',
    description: '2 كريب سوبر كرانشي محشيين',
    contents: ['كريب سوبر كرانشي × 2'],
    price: 280,
    oldPrice: 340,
    badge: 'عرض مميز',
    badgeColor: '#e74c3c',
    borderColor: '#e74c3c'
  }
];

let tempDeals = defaultDeals;
try {
  const savedDeals = localStorage.getItem('crepe_hekaya_deals_db');
  if (savedDeals) {
    tempDeals = JSON.parse(savedDeals);
  }
} catch (e) {
  console.warn("Failed to parse deals from localStorage", e);
}

export let dealsList = tempDeals;

export function saveDealsToStorage() {
  localStorage.setItem('crepe_hekaya_deals_db', JSON.stringify(dealsList));
}

export function addDeal(deal) {
  dealsList.push(deal);
  saveDealsToStorage();
}

export function deleteDeal(id) {
  const index = dealsList.findIndex(d => d.id === id);
  if (index > -1) {
    dealsList.splice(index, 1);
    saveDealsToStorage();
    return true;
  }
  return false;
}
