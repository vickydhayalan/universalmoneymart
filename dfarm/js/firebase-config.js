import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJ2C0V2U8PGroB8xeHeKknzS5znY3XFE",
  authDomain: "dfarm-tracker.firebaseapp.com",
  projectId: "dfarm-tracker",
  storageBucket: "dfarm-tracker.firebasestorage.app",
  messagingSenderId: "1043858263056",
  appId: "1:1043858263056:web:d1304e8537ba74c9620e95",
  measurementId: "G-H10VRWX9CY"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Offline Fallback:", e);
}

// Global Shared Caches for Realtime Data
export const farmState = {
  db,
  animalsCache: [],
  customersCache: [],
  milkRecordsCache: [],
  expensesCache: [],
  revenueCache: [],
  capexCache: [],
  cart: []
};

// Common Toast Trigger
export function showToast(msg) {
  const t = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (t && msgEl) {
    msgEl.textContent = msg;
    t.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => t.classList.add('opacity-0', 'pointer-events-none'), 2200);
  }
}

// Common Modal Triggers
export function openModal(id, session = null) {
  if (session && id === 'cowMilkModal') {
    const sessionInput = document.getElementById('cowMilkSession');
    const titleInput = document.getElementById('cowMilkModalTitle');
    if (sessionInput) sessionInput.value = session;
    if (titleInput) titleInput.textContent = session === 'AM' ? 'காலை பால் பதிவு (AM Session)' : 'மாலை பால் பதிவு (PM Session)';
  }
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

// Export Firestore utilities for modular files
export { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
};
