import { farmState, showToast } from "./firebase-config.js";

// Toggle Cart Drawer
export function toggleCart(show) {
  const d = document.getElementById('cartDrawer');
  if (d) {
    if (show) d.classList.remove('hidden');
    else d.classList.add('hidden');
  }
}

// Add Item to Cart
export function addToCart(title, price, img) {
  const item = farmState.cart.find(i => i.title === title);
  if (item) item.qty++;
  else farmState.cart.push({ title, price, img, qty: 1 });
  renderCart();
  showToast(`Added: ${title}`);
}

// Update Cart Quantity
export function updateCartQty(title, delta) {
  const item = farmState.cart.find(i => i.title === title);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) farmState.cart = farmState.cart.filter(i => i.title !== title);
  }
  renderCart();
}

// Render Cart UI
export function renderCart() {
  const list = document.getElementById('cartItemsList');
  const badge = document.getElementById('cartCountBadge');
  const total = document.getElementById('cartTotalPrice');

  const count = farmState.cart.reduce((s, i) => s + i.qty, 0);
  if (badge) badge.textContent = count;

  if (farmState.cart.length === 0) {
    if (list) list.innerHTML = `<div class="text-center py-12 text-slate-400 text-xs">கூடை காலியாக உள்ளது (Cart is empty).</div>`;
    if (total) total.textContent = '₹0';
    return;
  }

  let sum = 0;
  if (list) {
    list.innerHTML = farmState.cart.map(i => {
      sum += (i.price * i.qty);
      return `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="flex items-center gap-3">
            <img src="${i.img}" class="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200" alt="${i.title}">
            <div>
              <h4 class="font-bold text-xs text-[#143627]">${i.title}</h4>
              <span class="text-xs font-serif-title font-bold text-emerald-800">₹${i.price} each</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.updateCartQty('${i.title}', -1)" class="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-xs active:scale-95">-</button>
            <span class="text-xs font-bold w-4 text-center">${i.qty}</span>
            <button onclick="window.updateCartQty('${i.title}', 1)" class="w-6 h-6 rounded-lg bg-[#143627] text-white flex items-center justify-center font-bold text-xs active:scale-95">+</button>
          </div>
        </div>
      `;
    }).join('');
  }
  if (total) total.textContent = `₹${sum.toLocaleString('en-IN')}`;
}

// WhatsApp Checkout
export function checkoutWhatsApp() {
  if (farmState.cart.length === 0) return alert("Cart is empty!");
  let text = `🥛 *D-FARM (Polur) - NEW ORDER*\n------------------------------------\n`;
  let total = 0;
  farmState.cart.forEach((i, idx) => {
    text += `${idx + 1}. *${i.title}* x ${i.qty} = ₹${i.price * i.qty}\n`;
    total += (i.price * i.qty);
  });
  text += `------------------------------------\n💰 *Total Amount: ₹${total.toLocaleString('en-IN')}*\n📍 *Preference:* Doorstep / Farm Gate Pickup\nதயவுசெய்து ஆர்டரை உறுதிப்படுத்தவும்.`;
  window.open(`https://wa.me/917200752628?text=${encodeURIComponent(text)}`, '_blank');
}

// Direct UPI Trigger
export function checkoutUPI() {
  if (farmState.cart.length === 0) return alert("Cart is empty!");
  const total = farmState.cart.reduce((s, i) => s + (i.price * i.qty), 0);
  window.location.href = `upi://pay?pa=7200752628@upi&pn=D-FARM%20Polur&am=${total}&cu=INR&tn=DFARM%20Order`;
}

// Subscription Cost Calculator
export function calculateSubEstimate() {
  const lEl = document.getElementById('subLiters');
  const packEl = document.getElementById('subPack');
  if (!lEl || !packEl) return;

  const l = parseFloat(lEl.value);
  const pack = packEl.value;
  const rate = pack === 'bottle' ? 60 : 50;
  const totalMonth = l * rate * 30;

  const totalEl = document.getElementById('subMonthlyTotal');
  const breakEl = document.getElementById('subBreakdown');
  if (totalEl) totalEl.textContent = `₹${totalMonth.toLocaleString('en-IN')}`;
  if (breakEl) breakEl.textContent = `${(l * 30).toFixed(1)} Litres/Month @ ₹${rate} per Litre (${pack === 'bottle' ? 'Glass Bottle' : 'Fresh Pouch'})`;
}

// Subscription WhatsApp Request
export function requestSubscriptionWhatsApp() {
  const l = document.getElementById('subLiters')?.value;
  const pack = document.getElementById('subPack')?.value === 'bottle' ? 'Glass Bottle (₹60/L)' : 'Daily Pouch (₹50/L)';
  const win = document.getElementById('subTime')?.value;
  const est = document.getElementById('subMonthlyTotal')?.textContent;

  const text = `🥛 *D-FARM (Polur) - NEW MILK SUBSCRIPTION*\n------------------------------------\n• Daily Litres: *${l} Litre(s)*\n• Packaging: *${pack}*\n• Preferred Window: *${win}*\n• Est. Monthly Total: *${est}*\n------------------------------------\n📍 *Preference:* Polur Doorstep Delivery\nதயவுசெய்து சந்தா விநியோகத்தை உறுதிப்படுத்தவும்.`;
  window.open(`https://wa.me/917200752628?text=${encodeURIComponent(text)}`, '_blank');
}

// Farm Visit Booking
export function handleVisitSubmit(e) {
  e.preventDefault();
  const n = document.getElementById('vName')?.value;
  const p = document.getElementById('vPhone')?.value;
  const g = document.getElementById('vGuests')?.value;
  const d = document.getElementById('vDate')?.value;

  const text = `🌿 *D-FARM Polur - Farm Visit & Purchase Booking*\n------------------------------------\n👤 Name: *${n}*\n📱 Mobile: *${p}*\n👥 Guests: *${g}*\n📅 Date: *${d}*\n\nபண்ணை பார்வை மற்றும் நேரடி பொருட்கள் வாங்க அனுமதி கோருகிறேன்.`;
  window.open(`https://wa.me/917200752628?text=${encodeURIComponent(text)}`, '_blank');
  showToast("Visit Slot Booking sent via WhatsApp!");
  e.target.reset();
}

// Auto-Carousel (5-Second Loop)
export function startAutoCarousel() {
  setInterval(() => {
    const gal = document.getElementById('farmGalleryCarousel');
    if (gal) {
      if (gal.scrollLeft + gal.clientWidth >= gal.scrollWidth - 10) gal.scrollTo({ left: 0, behavior: 'smooth' });
      else gal.scrollBy({ left: 320, behavior: 'smooth' });
    }
    const vid = document.getElementById('ytVideosCarousel');
    if (vid) {
      if (vid.scrollLeft + vid.clientWidth >= vid.scrollWidth - 10) vid.scrollTo({ left: 0, behavior: 'smooth' });
      else vid.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }, 5000);
}
