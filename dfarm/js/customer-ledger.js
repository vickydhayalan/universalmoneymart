import { farmState, showToast, openModal, closeModal } from "./firebase-config.js";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export let activeSelfCustomerPhone = null;

// ==========================================
// 1. ADD NEW CUSTOMER WITH WHATSAPP ONBOARDING
// ==========================================

export async function handleCustomerSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('custName')?.value.trim();
  const phone = document.getElementById('custPhone')?.value.trim();
  const dailyMilk = parseFloat(document.getElementById('custDailyMilk')?.value || 1.0);
  const ratePerLiter = parseFloat(document.getElementById('custRatePerLiter')?.value || 50);
  const address = document.getElementById('custAddress')?.value.trim() || 'Polur Town';

  if (!name || !phone || phone.length < 10) return alert('Sariyana Name matrum 10-digit WhatsApp number enter seiyavum!');

  try {
    await setDoc(doc(farmState.db, "customers", phone), {
      name,
      phone,
      dailyMilk,
      ratePerLiter,
      address,
      balanceDue: 0,
      totalSupplied: 0,
      createdAt: serverTimestamp()
    });

    closeModal('customerModal');
    showToast(`Customer added: ${name}`);
    e.target.reset();

    // Trigger Unique Welcome Message
    const today = new Date().toLocaleDateString('ta-IN');
    const welcomeMsg = `🥛 *D-FARM POLUR-க்கு அன்பான வரவேற்பு!*\n━━━━━━━━━━━━━━━━\nவணக்கம் *${name}*,\n\nD-FARM பண்ணைக் குடும்பத்தில் தங்களை இணைத்துக் கொள்வதில் மகிழ்ச்சி! எங்கள் பண்ணையில் தண்ணீர் கலக்காத 100% தூய பசும்பால் & இயற்கை பண்ணைப் பொருட்களை உங்கள் இல்லத்திற்கே கொண்டு சேர்க்க உறுதிபூண்டுள்ளோம்.\n\n🌐 *Website:* https://universalmonymart.onrender.com/dfarm.html\n📺 *YouTube:* https://youtube.com/@vigneshdhayalanofficial\n📍 *Farm:* பக்மார்பேட்டை, போளூர்\n🗓️ *தேதி:* ${today}\n\nஏதேனும் சந்தேகம் இருப்பின் தொடர்பு கொள்ளவும்:\n📞 *WhatsApp:* +91 7200752628 (விக்னேஷ் தயாளன்)\n━━━━━━━━━━━━━━━━\n*D-FARM POLUR • தூய்மை • பாரம்பரியம் • உண்மை*`;

    const sendWelcome = confirm(`New Customer Added! ${name}-க்கு WhatsApp-ல் Welcome Message அனுப்பவா?`);
    if (sendWelcome) {
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(welcomeMsg)}`, '_blank');
    }
  } catch (err) {
    alert("Customer add seivadhil error: " + err.message);
  }
}

// ==========================================
// 2. RECORD DELIVERY & INSTANT WHATSAPP BILL
// ==========================================

export async function saveErpProductSaleDrop(e) {
  if (e) e.preventDefault();
  const select = document.getElementById('ledgerCustomerSelect');
  const phone = select?.value;
  const custName = select?.options[select.selectedIndex]?.getAttribute('data-name') || 'Customer';
  const qty = parseFloat(document.getElementById('ledgerQty')?.value || 1.0);
  const rate = parseFloat(document.getElementById('ledgerRate')?.value || 50);
  const item = document.getElementById('ledgerItem')?.value || 'தூய பால் (Liters)';

  if (!phone) return alert('Customer-ஐ தேர்வு செய்யவும்!');
  if (isNaN(qty) || qty <= 0) return alert('அளவை சரியாக உள்ளிடவும்!');

  const amount = Math.round(qty * rate);

  try {
    const custRef = doc(farmState.db, "customers", phone);
    await updateDoc(custRef, {
      totalSupplied: increment(qty),
      balanceDue: increment(amount),
      lastSuppliedDate: new Date().toISOString().split('T')[0]
    });

    showToast(`Delivery logged: ${qty}L (₹${amount}) to ${custName}`);

    // Instant Invoice Message
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateToday = new Date().toLocaleDateString('ta-IN');
    const invoiceMsg = `🧾 *D-FARM POLUR • DELIVERY INVOICE*\n━━━━━━━━━━━━━━━━\n👤 *வாடிக்கையாளர்:* ${custName}\n🗓️ *தேதி & நேரம்:* ${dateToday} (${timeNow})\n🥛 *பொருள்:* ${item}\n⚖️ *அளவு:* ${qty} Litre\n💵 *விலை:* ₹${rate} / Litre\n💰 *இன்றைய தொகை:* ₹${amount}\n━━━━━━━━━━━━━━━━\nஏதேனும் சந்தேகம் இருப்பின் தொடர்பு கொள்ளவும்:\n📞 *WhatsApp:* 7200752628\n*D-FARM POLUR*`;

    const sendInvoice = confirm(`Delivery recorded! ${custName}-க்கு WhatsApp Invoice அனுப்பவா?`);
    if (sendInvoice) {
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(invoiceMsg)}`, '_blank');
    }
  } catch (err) {
    alert("Delivery record seivadhil error: " + err.message);
  }
}

// ==========================================
// 3. UNDO WRONG DELIVERY (EDIT / DELETE FIX)
// ==========================================

window.undoCustomerDelivery = async (phone, custName, qty, rate) => {
  const amountToReduce = Math.round(qty * rate);
  const confirmUndo = confirm(`கடைசி டெலிவரியை (${qty}L - ₹${amountToReduce}) ரத்து செய்து ${custName} பாக்கியைக் குறைக்கவா?`);
  if (!confirmUndo) return;

  try {
    const custRef = doc(farmState.db, "customers", phone);
    await updateDoc(custRef, {
      totalSupplied: increment(-qty),
      balanceDue: increment(-amountToReduce)
    });
    showToast(`Delivery removed! ₹${amountToReduce} reduced for ${custName}`);
  } catch (err) {
    alert("Undo seivadhil error: " + err.message);
  }
};

// ==========================================
// 4. DUE BILL PAYMENT & RECEIPT
// ==========================================

export function openCustomerPaymentModal(phone, name) {
  document.getElementById('paymentCustomerPhone').value = phone;
  document.getElementById('paymentCustomerNameDisplay').textContent = `${name} (${phone})`;
  openModal('customerPaymentModal');
}

export async function handleCustomerPaymentSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('paymentCustomerPhone')?.value;
  const amountPaid = parseFloat(document.getElementById('paymentAmountReceived')?.value || 0);
  const mode = document.getElementById('paymentCollectionMode')?.value || 'UPI';

  if (!phone || isNaN(amountPaid) || amountPaid <= 0) return alert('சரியான தொகையை உள்ளிடவும்!');

  try {
    const custRef = doc(farmState.db, "customers", phone);
    const snap = await getDoc(custRef);
    const currentDue = snap.data()?.balanceDue || 0;
    const name = snap.data()?.name || 'Customer';

    const newDue = currentDue - amountPaid;

    await updateDoc(custRef, {
      balanceDue: increment(-amountPaid),
      lastPaymentDate: new Date().toISOString().split('T')[0]
    });

    closeModal('customerPaymentModal');
    showToast(`Payment of ₹${amountPaid} received from ${name}`);
    e.target.reset();

    // Trigger Payment Receipt
    const receiptMsg = `💳 *D-FARM POLUR • PAYMENT RECEIPT*\n━━━━━━━━━━━━━━━━\nவணக்கம் *${name}*,\nதங்களிடமிருந்து பால் கணக்குத் தொகை பெறப்பட்டது. நன்றி!\n\n🗓️ *தேதி:* ${new Date().toLocaleDateString('ta-IN')}\n💵 *செலுத்திய தொகை:* ₹${amountPaid}\n🏦 *செலுத்திய முறை:* ${mode}\n\n📌 *கணக்கு நிலை (Status):*\n• *மீதமுள்ள நிலுவை:* ₹${newDue > 0 ? newDue : 0}\n• *கூடுதல் முன்பணம்:* ₹${newDue < 0 ? Math.abs(newDue) : 0}\n━━━━━━━━━━━━━━━━\n📞 *Contact:* 7200752628\n*D-FARM POLUR*`;

    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(receiptMsg)}`, '_blank');
  } catch (err) {
    alert("Payment update seivadhil error: " + err.message);
  }
}

// ==========================================
// 5. CUSTOMER LEDGER REALTIME LISTENER
// ==========================================

export function initCustomerListener() {
  const container = document.getElementById('erpCustomerList');
  const dropdown = document.getElementById('ledgerCustomerSelect');
  if (!container) return;

  const q = query(collection(farmState.db, "customers"), orderBy("name", "asc"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-slate-500 italic text-xs">Customer பதிவு எதுவும் இல்லை.</p>';
      if (dropdown) dropdown.innerHTML = '<option value="">No Customers</option>';
      return;
    }

    let listHtml = '';
    let dropHtml = '<option value="">-- வாடிக்கையாளரைத் தேர்வு செய்க --</option>';

    snapshot.forEach(docSnap => {
      const c = docSnap.data();
      const phone = docSnap.id;
      const due = c.balanceDue || 0;
      const rate = c.ratePerLiter || 50;
      const dailyQty = c.dailyMilk || 1.0;

      dropHtml += `<option value="${phone}" data-name="${c.name}" data-rate="${rate}">${c.name} (${phone})</option>`;

      listHtml += `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-sm text-white">${c.name}</h4>
              <span class="text-[10px] text-slate-400 font-medium">${phone} • Base: ₹${rate}/L • Daily: ${dailyQty}L</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">Balance Due</span>
              <span class="font-extrabold text-sm ${due > 0 ? 'text-rose-400' : 'text-emerald-400'}">₹${due}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button onclick="window.openCustomerPaymentModal('${phone}', '${c.name}')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs active:scale-95 transition">
              Pay In
            </button>
            <button onclick="window.downloadCustomerBillPDF('${phone}')" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl" title="PDF Bill">
              <i data-lucide="file-text" class="w-4 h-4 text-amber-300"></i>
            </button>
            <button onclick="window.shareCustomerBill('${phone}')" class="p-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl border border-emerald-800" title="WhatsApp Summary">
              <i data-lucide="share-2" class="w-4 h-4"></i>
            </button>
            <!-- UNDO / DELETE LAST DELIVERY ACTION -->
            <button onclick="window.undoCustomerDelivery('${phone}', '${c.name}', ${dailyQty}, ${rate})" class="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800" title="Undo Delivery">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = listHtml;
    if (dropdown) dropdown.innerHTML = dropHtml;
    if (window.lucide) lucide.createIcons();
  });
}

// Bill Share helper
window.shareCustomerBill = async (phone) => {
  const custRef = doc(farmState.db, "customers", phone);
  const snap = await getDoc(custRef);
  if (!snap.exists()) return alert('Customer not found!');
  const c = snap.data();
  const summaryMsg = `📊 *D-FARM POLUR • MONTHLY STATEMENT*\n━━━━━━━━━━━━━━━━\n👤 *வாடிக்கையாளர்:* ${c.name}\n🥛 *மொத்த சப்ளை:* ${c.totalSupplied || 0} Litres\n💵 *நிலுவைத் தொகை (Due):* ₹${c.balanceDue || 0}\n━━━━━━━━━━━━━━━━\nUPI / GPay மூலம் செலுத்த: 7200752628\n*D-FARM POLUR*`;
  window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(summaryMsg)}`, '_blank');
};

// Customer Self Check
export async function checkCustomerLedger() {
  const phone = document.getElementById('selfLedgerPhone')?.value.trim();
  const res = document.getElementById('selfLedgerResult');
  if (!phone || phone.length < 10) return alert('10-digit Mobile number enter seiyavum!');

  const custRef = doc(farmState.db, "customers", phone);
  const snap = await getDoc(custRef);
  if (!snap.exists()) {
    res.classList.remove('hidden');
    res.innerHTML = '<p class="text-rose-600 font-bold text-center">Customer details kidaikkavillai. Farm-ஐ தொடர்பு கொள்ளவும்.</p>';
    return;
  }
  const c = snap.data();
  res.classList.remove('hidden');
  res.innerHTML = `
    <div class="space-y-1.5 text-xs">
      <div class="flex justify-between font-bold"><span>பெயர்:</span><span>${c.name}</span></div>
      <div class="flex justify-between"><span>வழங்கப்பட்ட பால்:</span><span class="font-bold text-emerald-800">${c.totalSupplied || 0} L</span></div>
      <div class="flex justify-between border-t pt-1 font-bold text-sm"><span>செலுத்த வேண்டிய பாக்கி:</span><span class="${c.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}">₹${c.balanceDue || 0}</span></div>
    </div>
  `;
}

export function autoFillItemRate(item) {
  // Available for cross file references
}
