import { 
  farmState, 
  collection, 
  onSnapshot 
} from "./firebase-config.js";

let financialChartInstance = null;
export let currentTimelineMode = 'monthly';

// CFO Financial Portfolio & Capital Recovery Metric Engine
export function refreshPortfolioAndCharts() {
  const totalCapex = farmState.capexCache.reduce((s, i) => s + (i.amount || 0), 0);
  const totalRevenue = farmState.revenueCache.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpense = farmState.expensesCache.reduce((s, i) => s + (i.amount || 0), 0);
  const netProfit = totalRevenue - totalExpense;

  const capexEl = document.getElementById('portTotalCapex');
  const revEl = document.getElementById('portTotalRevenue');
  const expEl = document.getElementById('portTotalExpense');
  const netEl = document.getElementById('portNetProfit');

  if (capexEl) capexEl.textContent = totalCapex.toLocaleString('en-IN');
  if (revEl) revEl.textContent = totalRevenue.toLocaleString('en-IN');
  if (expEl) expEl.textContent = totalExpense.toLocaleString('en-IN');
  if (netEl) netEl.textContent = netProfit.toLocaleString('en-IN');

  let recoveryPct = 0;
  let balRecover = totalCapex;
  if (totalCapex > 0 && netProfit > 0) {
    recoveryPct = Math.min(100, Math.round((netProfit / totalCapex) * 100));
    balRecover = Math.max(0, totalCapex - netProfit);
  }

  const pctEl = document.getElementById('portRecoveryPercent');
  const balEl = document.getElementById('portBalanceRecover');
  const barEl = document.getElementById('portProgressBar');

  if (pctEl) pctEl.textContent = `${recoveryPct}%`;
  if (balEl) balEl.textContent = `₹${balRecover.toLocaleString('en-IN')}`;
  if (barEl) barEl.style.width = `${recoveryPct}%`;

  renderChartData(currentTimelineMode);
}

// Switch Daily, Weekly, Monthly Chart Timeline
export function updateChartTimeline(mode) {
  currentTimelineMode = mode;
  ['btnChartMonth', 'btnChartWeek', 'btnChartDay'].forEach(b => {
    const el = document.getElementById(b);
    if (el) el.className = "px-3 py-1 rounded-lg font-bold bg-slate-100 text-slate-600";
  });

  const activeBtn = mode === 'monthly' ? 'btnChartMonth' : (mode === 'weekly' ? 'btnChartWeek' : 'btnChartDay');
  const activeEl = document.getElementById(activeBtn);
  if (activeEl) activeEl.className = "px-3 py-1 rounded-lg font-bold bg-[#143627] text-white";

  renderChartData(mode);
}

// Chart.js Visual Bar Dashboard
export function renderChartData(mode) {
  const ctx = document.getElementById('farmFinancialChart');
  if (!ctx || typeof Chart === 'undefined') return;

  let labels = [];
  let revData = [];
  let expData = [];

  if (mode === 'monthly') {
    labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    revData = [12000, 18500, 24000, 31000, 42000, 48000, 56000];
    expData = [14000, 16000, 19000, 22000, 25000, 27000, 29000];
  } else if (mode === 'weekly') {
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    revData = [11000, 14500, 15000, 15500];
    expData = [7000, 8000, 6800, 7200];
  } else {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    revData = [1800, 2100, 2400, 2200, 2600, 3100, 3500];
    expData = [1100, 1300, 950, 1400, 1200, 1600, 1700];
  }

  if (financialChartInstance) financialChartInstance.destroy();

  financialChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Farm Income (₹)', data: revData, backgroundColor: '#10B981', borderRadius: 8 },
        { label: 'Feed & Ops Expenses (₹)', data: expData, backgroundColor: '#F43F5E', borderRadius: 8 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } }
    }
  });
}

// Realtime Financial Revenue & CAPEX Watcher
export function initFinancialListener() {
  if (!farmState.db) return;

  onSnapshot(collection(farmState.db, 'revenue'), (snap) => {
    farmState.revenueCache = [];
    snap.forEach(docSnap => farmState.revenueCache.push(docSnap.data()));
    refreshPortfolioAndCharts();
  });
}
