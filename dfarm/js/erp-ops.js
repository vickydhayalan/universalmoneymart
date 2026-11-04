import { 
  farmState, 
  showToast, 
  closeModal, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "./firebase-config.js";

// Save AM/PM Cow Milk Record
export async function handleCowMilkSubmit(e) {
  e.preventDefault();
  const cowSelect = document.getElementById('cowSelectMilk');
  const qtyInput = document.getElementById('cowMilkQty');
  const sessionInput = document.getElementById('cowMilkSession');

  if (!cowSelect || !qtyInput || !sessionInput) return;

  const cowTag = cowSelect.value;
  const qty = parseFloat(qtyInput.value);
  const session = sessionInput.value;

  if (isNaN(qty) || qty <= 0) return alert('Valid litres enter pannunga!');

  await addDoc(collection(farmState.db, 'milk_records'), {
    type: 'milk',
    cowTag,
    quantity: qty,
    session,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });

  closeModal('cowMilkModal');
  qtyInput.value = '';
  showToast(`Milk saved: ${qty}L (${session})`);
}

// Save Daily Spend / Expense
export async function handleExpenseSubmit(e) {
  e.preventDefault();
  const amtInput = document.getElementById('expAmount');
  const descInput = document.getElementById('expDesc');
  const catInput = document.getElementById('expCategory');

  if (!amtInput || !descInput || !catInput) return;

  const amount = parseFloat(amtInput.value);
  const desc = descInput.value.trim();
  const category = catInput.value;

  if (isNaN(amount) || amount <= 0) return alert('Valid expense amount enter pannunga!');

  await addDoc(collection(farmState.db, 'expenses'), {
    type: 'expense',
    amount,
    description: desc,
    category,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });

  closeModal('expenseModal');
  amtInput.value = '';
  descInput.value = '';
  showToast(`Expense saved: ₹${amount}`);
}

// 1-Tap Quick Expense Chips (Tea, Needle, Petrol, Feed, Labour)
export async function quickExpense(amount, desc, category) {
  await addDoc(collection(farmState.db, 'expenses'), {
    type: 'expense',
    amount,
    description: desc,
    category,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });
  showToast(`₹${amount} saved (${desc})`);
}

// Direct Farm Revenue Entry (Manure load, live stock, extra products)
export async function handleSaleSubmit(e) {
  e.preventDefault();
  const amtInput = document.getElementById('saleAmount');
  const itemInput = document.getElementById('saleItem');

  if (!amtInput || !itemInput) return;

  const amount = parseFloat(amtInput.value);
  const item = itemInput.value;

  if (isNaN(amount) || amount <= 0) return alert('Valid revenue amount enter pannunga!');

  await addDoc(collection(farmState.db, 'revenue'), {
    type: 'revenue',
    amount,
    item,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp ? serverTimestamp() : new Date()
  });

  closeModal('saleModal');
  amtInput.value = '';
  showToast(`Income added: ₹${amount}`);
}

// Realtime Listeners for Daily Ops
export function initOpsListeners() {
  if (!farmState.db) return;

  // Listen to Recent Expenses (Today's Spend & Feed List)
  const qExp = query(collection(farmState.db, 'expenses'), orderBy('timestamp', 'desc'), limit(15));
  onSnapshot(qExp, (snap) => {
    farmState.expensesCache = [];
    let todaySpend = 0;
    let html = '';
    const todayStr = new Date().toISOString().split('T')[0];

    snap.forEach(docSnap => {
      const d = docSnap.data();
      farmState.expensesCache.push(d);
      if (d.date === todayStr) todaySpend += (d.amount || 0);

      html += `
        <div class="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span class="font-medium text-[#143627]">${d.description}</span>
            <span class="text-[10px] text-slate-400 block">${d.category || 'General'}</span>
          </div>
          <span class="text-rose-600 font-bold">-₹${d.amount}</span>
        </div>
      `;
    });

    const todayExpEl = document.getElementById('erpTodayExp');
    const feedListEl = document.getElementById('erpFeedList');
    if (todayExpEl) todayExpEl.textContent = todaySpend.toLocaleString('en-IN');
    if (feedListEl) feedListEl.innerHTML = html || '<div class="text-center py-6 text-slate-400">இன்றைய செலவுப் பதிவுகள் இல்லை.</div>';
  });

  // Listen to Daily Milk Records
  const qMilk = query(collection(farmState.db, 'milk_records'), orderBy('timestamp', 'desc'), limit(40));
  onSnapshot(qMilk, (snap) => {
    farmState.milkRecordsCache = [];
    let am = 0, pm = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    snap.forEach(docSnap => {
      const d = docSnap.data();
      farmState.milkRecordsCache.push(d);
      if (d.date === todayStr) {
        if (d.session === 'AM') am += (d.quantity || 0);
        if (d.session === 'PM') pm += (d.quantity || 0);
      }
    });

    const todayMilkEl = document.getElementById('erpTodayMilk');
    const milkSplitEl = document.getElementById('erpMilkSplit');
    if (todayMilkEl) todayMilkEl.textContent = (am + pm).toFixed(1);
    if (milkSplitEl) milkSplitEl.textContent = `AM: ${am.toFixed(1)}L | PM: ${pm.toFixed(1)}L`;
  });
}
