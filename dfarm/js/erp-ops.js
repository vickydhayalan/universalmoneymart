import { farmState, showToast, openModal, closeModal } from "./firebase-config.js";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 1. DELETE & EDIT HANDLERS (EDIT / DELETE FIX)
// ==========================================

// Delete any ERP Record (Expenses, Milk, Income)
window.deleteErpRecord = async (collectionName, docId) => {
  const confirmDelete = confirm("Indha entry-ai delete seiya virumbugireergala?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(farmState.db, collectionName, docId));
    showToast("Entry deleted successfully!");
  } catch (err) {
    alert("Delete seivadhil thavaru: " + err.message);
  }
};

// Edit Amount directly from card
window.editErpAmount = async (collectionName, docId, currentAmount) => {
  const newAmount = prompt("Puthiya Amount (₹)-ai உள்ளிடவும்:", currentAmount);
  if (newAmount === null || newAmount.trim() === "" || isNaN(newAmount)) return;

  try {
    await updateDoc(doc(farmState.db, collectionName, docId), {
      amount: parseFloat(newAmount)
    });
    showToast(`Amount ₹${newAmount} endru maatrapattadhu!`);
  } catch (err) {
    alert("Update seivadhil thavaru: " + err.message);
  }
};

// ==========================================
// 2. OPERATIONS FORM SUBMIT HANDLERS
// ==========================================

// Milk Entry Submit
export async function handleCowMilkSubmit(e) {
  e.preventDefault();
  const cowTag = document.getElementById('milkCowTagSelect')?.value || 'COW-01';
  const shift = document.getElementById('milkShift')?.value || 'Morning';
  const qty = parseFloat(document.getElementById('milkQtyVal')?.value || 0);
  const fat = parseFloat(document.getElementById('milkFatVal')?.value || 4.2);
  const snf = parseFloat(document.getElementById('milkSnfVal')?.value || 8.6);

  if (isNaN(qty) || qty <= 0) return alert('Sariyana paal alavai enter seiyavum!');

  try {
    await addDoc(collection(farmState.db, "milk_logs"), {
      cowTag,
      shift,
      quantity: qty,
      fat,
      snf,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    closeModal('cowMilkModal');
    showToast(`Milk logged: ${qty}L (${cowTag} - ${shift})`);
    e.target.reset();
  } catch (err) {
    alert("Milk log seivadhil thavaru: " + err.message);
  }
}

// Expense Entry Submit
export async function handleExpenseSubmit(e) {
  e.preventDefault();
  const category = document.getElementById('expenseCategory')?.value || 'Feed';
  const amount = parseFloat(document.getElementById('expenseAmount')?.value || 0);
  const description = document.getElementById('expenseDesc')?.value || '';

  if (isNaN(amount) || amount <= 0) return alert('Sariyana amount enter seiyavum!');

  try {
    await addDoc(collection(farmState.db, "expenses"), {
      category,
      amount,
      description: description || category,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    closeModal('expenseModal');
    showToast(`Spend recorded: ₹${amount} (${category})`);
    e.target.reset();
  } catch (err) {
    alert("Expense seivadhil thavaru: " + err.message);
  }
}

// 1-Tap Quick Expense Helper
export async function quickExpense(amt, label, cat) {
  try {
    await addDoc(collection(farmState.db, "expenses"), {
      category: cat || 'General',
      amount: parseFloat(amt),
      description: label,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    showToast(`Quick Spend: ₹${amt} (${label})`);
  } catch (err) {
    alert("Quick expense thavaru: " + err.message);
  }
}

// Direct Farm Gate Sale Submit
export async function handleSaleSubmit(e) {
  e.preventDefault();
  const item = document.getElementById('saleItemSelect')?.value || 'raw_milk';
  const qty = parseFloat(document.getElementById('saleQty')?.value || 1);
  const amount = parseFloat(document.getElementById('saleAmount')?.value || 0);
  const paymentMode = document.getElementById('salePaymentMode')?.value || 'Cash';

  if (isNaN(amount) || amount <= 0) return alert('Sariyana sale amount enter seiyavum!');

  try {
    await addDoc(collection(farmState.db, "sales"), {
      item,
      quantity: qty,
      amount,
      paymentMode,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    closeModal('saleModal');
    showToast(`Sale recorded: ₹${amount} (${item})`);
    e.target.reset();
  } catch (err) {
    alert("Sale record seivadhil thavaru: " + err.message);
  }
}

// ==========================================
// 3. REALTIME LISTENER WITH EDIT & DELETE BUTTONS
// ==========================================

export function initOpsListeners() {
  const container = document.getElementById('erpLiveFeedList');
  if (!container) return;

  const q = query(collection(farmState.db, "expenses"), orderBy("createdAt", "desc"), limit(10));
  
  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-slate-500 italic text-[11px] p-2">Indru endha selavu pathivum illai.</p>';
      return;
    }

    let html = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      html += `
        <div class="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div class="truncate max-w-[55%]">
            <p class="font-bold text-xs text-slate-100 truncate">${data.description || data.category}</p>
            <span class="text-[10px] text-slate-400 font-medium">${data.category} • ${data.date || 'Today'}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span class="text-rose-400 font-extrabold text-xs mr-1">-₹${data.amount}</span>
            <button onclick="window.editErpAmount('expenses', '${id}', ${data.amount})" title="Edit Amount" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 active:scale-90 transition">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.deleteErpRecord('expenses', '${id}')" title="Delete Entry" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 active:scale-90 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  });
}
