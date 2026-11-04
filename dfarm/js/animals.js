import { 
  farmState, 
  showToast, 
  closeModal, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from "./firebase-config.js";

// Auto Prefix Generation based on Animal Type
export function updateTagPrefix() {
  const t = document.getElementById('regAnimalType')?.value;
  const prefixEl = document.getElementById('tagPrefixDisplay');
  if (!prefixEl) return;
  if (t === 'Cow') prefixEl.textContent = 'COW-';
  else if (t === 'Goat') prefixEl.textContent = 'GOAT-';
  else if (t === 'Rabbit') prefixEl.textContent = 'RAB-';
  else prefixEl.textContent = 'POUL-';
}

// Toggle Buy Price Field for Born In Farm
export function toggleBuyPriceField() {
  const s = document.getElementById('regSource')?.value;
  const f = document.getElementById('regBuyValue');
  if (!f) return;
  if (s === 'Born In Farm') {
    f.value = '0';
    f.disabled = true;
  } else {
    f.disabled = false;
    f.value = '';
  }
}

// Open Animal Modal with Defaults
export function openAnimalRegistrationModal() {
  updateTagPrefix();
  toggleBuyPriceField();
  const modal = document.getElementById('animalRegistrationModal');
  if (modal) modal.classList.remove('hidden');
}

// Register New Animal
export async function handleAnimalSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('regAnimalType')?.value;
  const num = document.getElementById('regTagNumber')?.value.trim();
  const prefix = document.getElementById('tagPrefixDisplay')?.textContent || 'COW-';
  const tag = (prefix + num).toUpperCase();
  const breed = document.getElementById('regBreed')?.value.trim();
  const initWeight = parseFloat(document.getElementById('regInitWeight')?.value || 0);
  const source = document.getElementById('regSource')?.value;
  const buyPrice = parseFloat(document.getElementById('regBuyValue')?.value || 0);
  const aiDate = document.getElementById('regAiDate')?.value;

  let expectedCalving = '';
  if (aiDate && type === 'Cow') {
    const ai = new Date(aiDate);
    const calving = new Date(ai.getTime() + (280 * 86400000));
    expectedCalving = calving.toISOString().split('T')[0];
  }

  await addDoc(collection(farmState.db, 'animals'), {
    tag, 
    type, 
    breed, 
    initWeight, 
    currentWeight: initWeight, 
    source, 
    buyPrice, 
    status: 'Active', 
    aiDate: aiDate || null, 
    expectedCalving, 
    createdAt: serverTimestamp ? serverTimestamp() : new Date()
  });

  if (buyPrice > 0) {
    await addDoc(collection(farmState.db, 'expenses'), {
      type: 'expense',
      amount: buyPrice,
      description: `Animal Purchase: ${tag} (${breed})`,
      category: 'Livestock Capital',
      date: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp ? serverTimestamp() : new Date()
    });
  }

  closeModal('animalRegistrationModal');
  const numInput = document.getElementById('regTagNumber');
  if (numInput) numInput.value = '';
  showToast(`Registered: ${tag}`);
}

// Open Sell / Mortality Status Modal
export function openAnimalStatusModal(id, tag, buyPrice) {
  const idEl = document.getElementById('statusAnimalId');
  const tagEl = document.getElementById('statusAnimalTag');
  const costEl = document.getElementById('statusAnimalBuyCost');
  const titleEl = document.getElementById('statusModalTitle');

  if (idEl) idEl.value = id;
  if (tagEl) tagEl.value = tag;
  if (costEl) costEl.value = buyPrice || 0;
  if (titleEl) titleEl.textContent = `Status Update for ${tag}`;

  const modal = document.getElementById('animalStatusModal');
  if (modal) modal.classList.remove('hidden');
}

// Toggle Fields based on Sale or Death
export function toggleStatusFields() {
  const e = document.getElementById('statusEventType')?.value;
  const sf = document.getElementById('soldFields');
  if (!sf) return;
  if (e === 'Died') sf.classList.add('hidden');
  else sf.classList.remove('hidden');
}

// Submit Sale or Mortality Event
export async function handleAnimalStatusSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('statusAnimalId')?.value;
  const tag = document.getElementById('statusAnimalTag')?.value;
  const buyCost = parseFloat(document.getElementById('statusAnimalBuyCost')?.value || 0);
  const evType = document.getElementById('statusEventType')?.value;
  const notes = document.getElementById('statusNotes')?.value;

  if (evType === 'Sold') {
    const salePrice = parseFloat(document.getElementById('statusSalePrice')?.value || 0);
    const buyer = document.getElementById('statusBuyerInfo')?.value;
    const profit = salePrice - buyCost;

    await updateDoc(doc(farmState.db, 'animals', id), {
      status: 'Sold', 
      salePrice, 
      profit, 
      buyer, 
      soldDate: new Date().toISOString().split('T')[0], 
      notes
    });

    await addDoc(collection(farmState.db, 'revenue'), {
      type: 'revenue',
      amount: salePrice,
      item: `Livestock Sold: ${tag} (Profit: ₹${profit})`,
      date: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp ? serverTimestamp() : new Date()
    });

    showToast(`Sold ${tag} for ₹${salePrice} (Net Profit ₹${profit})`);
  } else {
    await updateDoc(doc(farmState.db, 'animals', id), {
      status: 'Deceased', 
      deathDate: new Date().toISOString().split('T')[0], 
      notes
    });
    showToast(`Recorded mortality for ${tag}`);
  }

  closeModal('animalStatusModal');
}

// Monthly Weight Audit
export async function handleWeightSubmit(e) {
  e.preventDefault();
  const tagSelect = document.getElementById('weightAnimalSelect');
  const weightInput = document.getElementById('weightVal');
  const dateInput = document.getElementById('weightDate');

  if (!tagSelect || !weightInput || !dateInput) return;

  const tag = tagSelect.value;
  const weight = parseFloat(weightInput.value);
  const date = dateInput.value;

  await addDoc(collection(farmState.db, 'animal_weights'), { 
    tag, 
    weight, 
    date, 
    timestamp: serverTimestamp ? serverTimestamp() : new Date() 
  });

  const an = farmState.animalsCache.find(a => a.tag === tag);
  if (an && an.id) {
    await updateDoc(doc(farmState.db, 'animals', an.id), { currentWeight: weight });
  }

  closeModal('weightModal');
  weightInput.value = '';
  showToast(`Weight saved for ${tag}`);
}

// Vaccines & Medical Treatment Log
export async function handleMedicalSubmit(e) {
  e.preventDefault();
  const tag = document.getElementById('medAnimalSelect')?.value;
  const type = document.getElementById('medType')?.value;
  const cost = parseFloat(document.getElementById('medCost')?.value || 0);
  const desc = document.getElementById('medDesc')?.value;

  await addDoc(collection(farmState.db, 'animal_medical'), { 
    tag, 
    type, 
    cost, 
    desc, 
    date: new Date().toISOString().split('T')[0], 
    timestamp: serverTimestamp ? serverTimestamp() : new Date() 
  });

  if (cost > 0) {
    await addDoc(collection(farmState.db, 'expenses'), { 
      type: 'expense', 
      amount: cost, 
      description: `${tag}: ${desc}`, 
      category: 'Medical & Vet', 
      date: new Date().toISOString().split('T')[0], 
      timestamp: serverTimestamp ? serverTimestamp() : new Date() 
    });
  }

  closeModal('medicalModal');
  showToast(`Health record saved`);
}

// Realtime Herd Alerts (Calving Countdown & Low Yield Warning)
export function evaluateHerdAlerts() {
  const box = document.getElementById('herdAlertsList');
  if (!box) return;
  let alerts = [];

  farmState.animalsCache.forEach(a => {
    if (a.status === 'Active') {
      if (a.expectedCalving) {
        const today = new Date();
        const calv = new Date(a.expectedCalving);
        const daysLeft = Math.round((calv - today) / (86400000));
        if (daysLeft >= 0 && daysLeft <= 30) {
          alerts.push(`🚨 <b>${a.tag} (${a.breed}):</b> Calving expected in approx <b>${daysLeft} days</b> (${a.expectedCalving}). Shift to calving shed!`);
        }
      }
      if (a.type === 'Cow') {
        const myMilk = farmState.milkRecordsCache.filter(m => m.cowTag === a.tag);
        if (myMilk.length >= 3) {
          const avg = myMilk.slice(0, 5).reduce((s, i) => s + (i.quantity || 0), 0) / Math.min(5, myMilk.length);
          if (avg < 5.0) {
            alerts.push(`⚠️ <b>${a.tag}: Low Milk Performer Alert</b> (Avg: ${avg.toFixed(1)}L). Review green fodder protein intake or consider cull/sale.`);
          }
        }
      }
    }
  });

  if (alerts.length > 0) {
    box.innerHTML = alerts.map(al => `<div class="p-2 bg-white rounded-xl border border-amber-200 text-rose-800">${al}</div>`).join('');
  } else {
    box.innerHTML = `<p class="text-emerald-800">✓ All registered livestock health and production parameters are optimal.</p>`;
  }
}

// Initialize Realtime Animals Sync
export function initAnimalsListener() {
  if (!farmState.db) return;

  onSnapshot(collection(farmState.db, 'animals'), (snap) => {
    farmState.animalsCache = [];
    const cowSelect = document.getElementById('cowSelectMilk');
    const weightSelect = document.getElementById('weightAnimalSelect');
    const medSelect = document.getElementById('medAnimalSelect');

    if (cowSelect) cowSelect.innerHTML = '<option value="GENERAL">General All Cows</option>';
    if (weightSelect) weightSelect.innerHTML = '<option value="">Select Animal...</option>';
    if (medSelect) medSelect.innerHTML = '<option value="">Select Animal...</option>';

    let html = '';
    snap.forEach(docSnap => {
      const a = { id: docSnap.id, ...docSnap.data() };
      farmState.animalsCache.push(a);

      if (a.status === 'Active') {
        if (a.type === 'Cow' && cowSelect) cowSelect.innerHTML += `<option value="${a.tag}">${a.tag} (${a.breed})</option>`;
        if (weightSelect) weightSelect.innerHTML += `<option value="${a.tag}">${a.tag}</option>`;
        if (medSelect) medSelect.innerHTML += `<option value="${a.tag}">${a.tag}</option>`;
      }

      html += `
        <div class="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center text-xs shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-base text-[#143627]">${a.tag}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${a.status === 'Sold' ? 'bg-blue-100 text-blue-800' : (a.status === 'Deceased' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800')}">${a.status || 'Active'}</span>
              ${a.source === 'Born In Farm' ? '<span class="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Born</span>' : ''}
            </div>
            <p class="text-slate-500">${a.type} • ${a.breed} • Buy Cost: ₹${a.buyPrice || 0}</p>
            ${a.expectedCalving ? `<p class="text-amber-700 font-bold text-[11px] mt-0.5">ETA Calving: ${a.expectedCalving}</p>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-emerald-800 text-sm">${a.currentWeight || '-'} kg</span>
            ${a.status === 'Active' ? `<button onclick="window.openAnimalStatusModal('${a.id}', '${a.tag}', ${a.buyPrice || 0})" class="bg-slate-100 hover:bg-slate-200 text-[#143627] font-bold px-2.5 py-1.5 rounded-lg text-[10px] border border-slate-300">Sell / Status</button>` : ''}
          </div>
        </div>
      `;
    });

    const listEl = document.getElementById('erpAnimalsList');
    if (listEl) listEl.innerHTML = html || '<div class="text-center py-6 text-slate-400 text-xs">கால்நடைகள் இல்லை.</div>';
    evaluateHerdAlerts();
  });
}
