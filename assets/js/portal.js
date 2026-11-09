/**
 * Universal Money Mart - Client Portal & Wealth Vault Engine
 * File: assets/js/portal.js
 * Handles: OTP Authentication, Dual Portfolio Toggle, ITR Tax Calculations, and Modal Controllers
 */

// Active state variables
let activeGeneratedOtp = "123456";
let currentTab = "umm";

// Demo Multi-Folio Datasets
const portfolioData = {
  umm: {
    invested: 350000,
    current: 482450,
    gains: 132450,
    xirr: "15.8%",
    funds: [
      {
        name: "Parag Parikh Flexi Cap Fund - Reg (G)",
        folio: "10293847/01",
        sip: "₹5,000",
        invested: 180000,
        current: 254200,
        returns: "+41.2%",
        tag: "ARN-288927"
      },
      {
        name: "Nippon India Small Cap Fund - Reg (G)",
        folio: "88492011/92",
        sip: "₹3,000",
        invested: 110000,
        current: 158100,
        returns: "+43.7%",
        tag: "ARN-288927"
      },
      {
        name: "HDFC Balanced Advantage Fund - Reg (G)",
        folio: "44920199/10",
        sip: "₹2,000",
        invested: 60000,
        current: 70150,
        returns: "+16.9%",
        tag: "ARN-288927"
      }
    ]
  },
  all: {
    invested: 620000,
    current: 845200,
    gains: 225200,
    xirr: "14.9%",
    funds: [
      {
        name: "Parag Parikh Flexi Cap Fund - Reg (G)",
        folio: "10293847/01",
        sip: "₹5,000",
        invested: 180000,
        current: 254200,
        returns: "+41.2%",
        tag: "ARN-288927"
      },
      {
        name: "Nippon India Small Cap Fund - Reg (G)",
        folio: "88492011/92",
        sip: "₹3,000",
        invested: 110000,
        current: 158100,
        returns: "+43.7%",
        tag: "ARN-288927"
      },
      {
        name: "HDFC Balanced Advantage Fund - Reg (G)",
        folio: "44920199/10",
        sip: "₹2,000",
        invested: 60000,
        current: 70150,
        returns: "+16.9%",
        tag: "ARN-288927"
      },
      {
        name: "Mirae Asset Large Cap Fund - Direct (G)",
        folio: "99102833/00",
        sip: "Paused",
        invested: 150000,
        current: 201300,
        returns: "+34.2%",
        tag: "External"
      },
      {
        name: "UTI Nifty 50 Index Fund - Reg (G)",
        folio: "33948271/55",
        sip: "₹2,500",
        invested: 120000,
        current: 161450,
        returns: "+34.5%",
        tag: "External"
      }
    ]
  }
};

/**
 * Currency Formatter for Indian Rupees
 */
function formatINR(val) {
  return "₹" + Math.round(val).toLocaleString('en-IN');
}

/**
 * Generates and triggers a 6-digit OTP screen
 */
function handleSendOTP(event) {
  if (event) event.preventDefault();
  const inputEl = document.getElementById('userInput');
  if (!inputEl) return;

  const val = inputEl.value.trim();
  if (!val) {
    alert('தயவுசெய்து உங்கள் Mobile Number அல்லது PAN உள்ளிடவும்.');
    inputEl.focus();
    return;
  }

  // Generate dynamic 6-digit OTP
  activeGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpDisplayEl = document.getElementById('simulatedOtpCode');
  const targetDisplayEl = document.getElementById('otpTargetDisplay');
  const otpInputEl = document.getElementById('otpCode');

  if (otpDisplayEl) otpDisplayEl.textContent = activeGeneratedOtp;
  if (targetDisplayEl) targetDisplayEl.textContent = val;
  if (otpInputEl) {
    otpInputEl.value = activeGeneratedOtp;
    setTimeout(() => otpInputEl.focus(), 100);
  }

  const stepInput = document.getElementById('stepInputContainer');
  const stepOtp = document.getElementById('stepOtpContainer');

  if (stepInput) stepInput.style.display = 'none';
  if (stepOtp) stepOtp.style.display = 'block';
}

/**
 * Verifies OTP and unlocks the client dashboard
 */
function handleVerifyOTP(event) {
  if (event) event.preventDefault();
  const otpInput = document.getElementById('otpCode');
  const entered = otpInput ? otpInput.value.trim() : "";

  if (entered !== activeGeneratedOtp && entered !== "123456") {
    alert('தவறான OTP! சரியான 6-இலக்க குறியீட்டை உள்ளிடவும்.');
    if (otpInput) otpInput.focus();
    return;
  }

  const authScreen = document.getElementById('authScreen');
  const dashboard = document.getElementById('dashboardView');

  if (authScreen) authScreen.style.display = 'none';
  if (dashboard) dashboard.style.display = 'block';

  renderView('umm');
}

/**
 * Logs out and resets authentication form
 */
function handleLogout() {
  const dashboard = document.getElementById('dashboardView');
  const authScreen = document.getElementById('authScreen');
  const stepOtp = document.getElementById('stepOtpContainer');
  const stepInput = document.getElementById('stepInputContainer');
  const userInput = document.getElementById('userInput');
  const otpInput = document.getElementById('otpCode');

  if (dashboard) dashboard.style.display = 'none';
  if (authScreen) authScreen.style.display = 'block';
  if (stepOtp) stepOtp.style.display = 'none';
  if (stepInput) stepInput.style.display = 'block';
  if (userInput) userInput.value = '';
  if (otpInput) otpInput.value = '';
}

/**
 * Switcher between UMM ARN Folios and All External CAS Folios
 */
function switchTab(type) {
  currentTab = type;
  const btnUmm = document.getElementById('btnUmm');
  const btnAll = document.getElementById('btnAll');

  if (btnUmm) btnUmm.classList.toggle('active', type === 'umm');
  if (btnAll) btnAll.classList.toggle('active', type === 'all');

  renderView(type);
}

/**
 * Renders portfolio cards and summary KPIs
 */
function renderView(type) {
  const data = portfolioData[type];
  if (!data) return;

  const kpiCurrent = document.getElementById('kpiCurrent');
  const kpiInvested = document.getElementById('kpiInvested');
  const kpiGain = document.getElementById('kpiGain');
  const kpiXirr = document.getElementById('kpiXirr');

  if (kpiCurrent) kpiCurrent.textContent = formatINR(data.current);
  if (kpiInvested) kpiInvested.textContent = formatINR(data.invested);
  if (kpiGain) kpiGain.textContent = "+" + formatINR(data.gains);
  if (kpiXirr) kpiXirr.textContent = data.xirr;

  const container = document.getElementById('fundListContainer');
  if (!container) return;

  container.innerHTML = data.funds.map(f => `
    <div class="fund-card">
      <div>
        <div class="fund-name">${f.name}</div>
        <div class="fund-meta">
          Folio: ${f.folio} · SIP: ${f.sip} 
          <span style="background:#F1F5F9;padding:1px 6px;border-radius:4px;color:var(--t2);margin-left:4px">${f.tag}</span>
        </div>
      </div>
      <div class="fund-stats">
        <div class="stat-col">
          <div class="stat-lbl">Invested</div>
          <div class="stat-val">${formatINR(f.invested)}</div>
        </div>
        <div class="stat-col">
          <div class="stat-lbl">Valuation</div>
          <div class="stat-val" style="color:var(--green)">${formatINR(f.current)}</div>
        </div>
        <div class="fund-badge">${f.returns}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Modal Controllers
 */
function openTaxModal() {
  const modal = document.getElementById('taxModal');
  if (modal) modal.style.display = 'flex';
}

function closeTaxModal() {
  const modal = document.getElementById('taxModal');
  if (modal) modal.style.display = 'none';
}

function openContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.style.display = 'flex';
}

function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.style.display = 'none';
}

/**
 * Contact Details Self-Service Update
 */
function handleContactUpdate(event) {
  if (event) event.preventDefault();
  const phone = document.getElementById('newPhone')?.value || "";
  const email = document.getElementById('newEmail')?.value || "";

  alert(`Verification OTP dispatched to ${phone} and ${email}. Permanent anchor PAN ABCDE1234F retains all portfolio holdings!`);
  closeContactModal();
}

/**
 * Keyboard escape key support for closing modals
 */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeTaxModal();
    closeContactModal();
  }
});
