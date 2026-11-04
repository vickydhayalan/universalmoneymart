import { 
  farmState, 
  showToast, 
  closeModal, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from "./firebase-config.js";

// Auto-fill Item Rate in Dropdown
export function autoFillItemRate() {
  const itm = document.getElementById('erpCustItemSelect')?.value || '';
  const rateInput = document.getElementById('erpCustRateManual');
  if (!rateInput) return;

  if (itm.includes('Raw Milk')) {
    const phone = document.getElementById('erpCustSelect')?.value;
    const c = farmState.customersCache.find(i => i.phone === phone);
    rateInput.value = c ? c.rate : 46;
  } else if (itm.includes('Coconut Oil')) {
    rateInput.value = 260;
  } else if (itm.includes('Groundnut Oil')) {
    rateInput.value = 210;
  } else if (itm.includes('Country Eggs')) {
    rateInput.value = 72;
  } else if (itm.includes('Cow Dung')) {
    rateInput.value = 250;
  } else if (itm.includes('Napier Stems')) {
    rateInput.value = 100;
  } else {
    rateInput.value = '';
  }
}

// Add Delivery / Multi-Product Drop to Buyer's Balance
export async function saveErpProductSaleDrop() {
  const phone = document.getElementById('erpCustSelect')?.value;
  const itm = document.getElementById('erpCustItemSelect')?.value;
  const qty = parseFloat(document.getElementById('erpCustQty')?.value || 1);
  const rate = parseFloat(document.getElementById('erpCustRateManual')?.value || 0);

  if (!phone || isNaN(qty) || qty <= 0 || isNaN(rate) || rate < 0) {
    return alert('Fill customer, qty & valid rate!');
  }

  const c = farmState.customersCache.find(item => item.phone === phone);
  if (!c) return alert('Customer not found!');

  const cost = qty * rate;

  await addDoc(collection(farmState.db, 'customer_deliveries'), {
    customerPhone: phone,
    customerName: c.name,
    item: itm,
    quantity: qty,
    rate,
    cost,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });

  let litrUpdate = (c.totalLiters || 0);
  if (itm.includes('Raw Milk')) litrUpdate += qty;

  await updateDoc(doc(farmState.db, 'customers', phone), {
    totalLiters: litrUpdate,
    balanceDue: (c.balanceDue || 0) + cost
  });

  showToast(`Added ${qty} ${itm} for ${c.name} (+₹${cost})`);
}

// Open Payment Entry Modal
export function openCustomerPaymentModal(phone, name) {
  const phoneInput = document.getElementById('payCustPhone');
  const nameText = document.getElementById('payCustNameText');
  const amtInput = document.getElementById('payAmountVal');

  if (phoneInput) phoneInput.value = phone;
  if (nameText) nameText.textContent = `${name} (${phone})`;
  if (amtInput) amtInput.value = '';

  const modal = document.getElementById('customerPaymentModal');
  if (modal) modal.classList.remove('hidden');
}

// Process Customer Payment Deduction
export async function handleCustomerPaymentSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('payCustPhone')?.value;
  const amt = parseFloat(document.getElementById('payAmountVal')?.value || 0);
  const mode = document.getElementById('payModeSelect')?.value || 'Cash';

  if (!phone || isNaN(amt) || amt <= 0) return alert('Enter valid payment amount!');

  const c = farmState.customersCache.find(item => item.phone === phone);
  if (!c) return alert('Customer not found!');

  const newDue = Math.max(0, (c.balanceDue || 0) - amt);

  await addDoc(collection(farmState.db, 'customer_payments'), {
    customerPhone: phone,
    customerName: c.name,
    amount: amt,
    mode,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });

  await updateDoc(doc(farmState.db, 'customers', phone), { balanceDue: newDue });

  await addDoc(collection(farmState.db, 'revenue'), {
    type: 'revenue',
    amount: amt,
    item: `Customer Payment: ${c.name} (${mode})`,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });

  closeModal('customerPaymentModal');
  showToast(`₹${amt} deducted from ${c.name}'s due!`);
}

// Create New Customer Profile
export async function handleCustomerSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('custName');
  const phoneInput = document.getElementById('custPhone');
  const rateInput = document.getElementById('custRate');

  if (!nameInput || !phoneInput || !rateInput) return;

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const rate = parseFloat(rateInput.value);

  if (!name || !phone || isNaN(rate)) return alert('Fill name, mobile and rate!');

  await setDoc(doc(farmState.db, 'customers', phone), {
    name,
    phone,
    rate,
    totalLiters: 0,
    balanceDue: 0,
    createdAt: serverTimestamp ? serverTimestamp() : new Date()
  });

  closeModal('customerModal');
  nameInput.value = '';
  phoneInput.value = '';
  showToast(`Buyer added: ${name}`);
}

// Share Single Customer Due Statement via WhatsApp
export function shareCustomerBill(phone) {
  const c = farmState.customersCache.find(item => item.phone === phone);
  if (!c) return;
  const text = `🥛 *D-FARM (Polur) - பால் கணக்கு*\n------------------------------------\n👤 *Buyer:* ${c.name}\n• Total Delivered: *${(c.totalLiters || 0).toFixed(1)} L*\n• Base Rate: *₹${c.rate}/L*\n🔴 *Pending Due: ₹${(c.balanceDue || 0).toLocaleString('en-IN')}*\n------------------------------------\n📱 GPay/PhonePe: 7200752628\n💳 UPI ID: 7200752628@upi\nBakmar Pettai, Murugapadi, Polur`;
  window.open(`https://wa.me/91${c.phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// Public Customer Self-Ledger Search
export let activeSelfCustomer = null;
export function searchCustomerSelfLedger() {
  const p = document.getElementById('custSearchPhone')?.value.trim();
  if (!p) return alert("Enter 10-digit mobile number!");

  const c = farmState.customersCache.find(i => i.phone === p);
  const res = document.getElementById('custSelfLedgerResult');

  if (c) {
    activeSelfCustomer = c;
    const nameEl = document.getElementById('custSelfName');
    const phoneEl = document.getElementById('custSelfPhone');
    const dueEl = document.getElementById('custSelfDue');
    const litrEl = document.getElementById('custSelfLiters');
    const rateEl = document.getElementById('custSelfRate');

    if (nameEl) nameEl.textContent = c.name;
    if (phoneEl) phoneEl.textContent = `Mobile: ${c.phone}`;
    if (dueEl) dueEl.textContent = `Due: ₹${(c.balanceDue || 0).toLocaleString('en-IN')}`;
    if (litrEl) litrEl.textContent = `${(c.totalLiters || 0).toFixed(1)} L`;
    if (rateEl) rateEl.textContent = `₹${c.rate}/L`;
    if (res) res.classList.remove('hidden');
  } else {
    alert("Customer record not found for this number. Contact 7200752628 to register.");
    if (res) res.classList.add('hidden');
  }
}

// Realtime Customer Registry Sync
export function initCustomerListener() {
  if (!farmState.db) return;

  onSnapshot(collection(farmState.db, 'customers'), (snap) => {
    farmState.customersCache = [];
    const custSelect = document.getElementById('erpCustSelect');
    if (custSelect) custSelect.innerHTML = '<option value="">Select Buyer...</option>';

    let html = '';
    snap.forEach(docSnap => {
      const c = docSnap.data();
      farmState.customersCache.push(c);

      if (custSelect) {
        custSelect.innerHTML += `<option value="${c.phone}">${c.name} (${c.phone})</option>`;
      }

      html += `
        <div class="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center text-xs shadow-sm">
          <div>
            <span class="font-bold text-sm text-[#143627]">${c.name}</span>
            <span class="text-slate-400 block text-[11px]">${c.phone} • Base Rate: ₹${c.rate}/L</span>
            <span class="text-slate-500 text-[10px] block">Supplied: ${(c.totalLiters || 0).toFixed(1)} L</span>
          </div>
          <div class="text-right space-y-1">
            <span class="font-bold text-base text-rose-600 block">₹${(c.balanceDue || 0).toLocaleString('en-IN')}</span>
            <div class="flex gap-1.5 justify-end">
              <button onclick="window.openCustomerPaymentModal('${c.phone}', '${c.name}')" class="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-lg text-[10px]">Pay In</button>
              <button onclick="window.downloadCustomerBillPDF('${c.phone}')" class="bg-slate-100 hover:bg-slate-200 text-[#143627] font-bold px-2 py-1 rounded-lg text-[10px] border border-slate-300">PDF</button>
              <button onclick="window.shareCustomerBill('${c.phone}')" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-2 py-1 rounded-lg text-[10px]">WhatsApp</button>
            </div>
          </div>
        </div>
      `;
    });

    const listEl = document.getElementById('erpCustList');
    if (listEl) listEl.innerHTML = html || '<div class="text-center py-6 text-slate-400 text-xs">வாடிக்கையாளர்கள் இல்லை.</div>';
    autoFillItemRate();
  });
}
