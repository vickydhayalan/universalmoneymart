// Universal Money Mart - Client Portal Engine

// Demo Portfolio Datasets
const portfolioData = {
  umm: {
    invested: 350000,
    current: 482450,
    gains: 132450,
    xirr: "15.8%",
    funds: [
      { name: "Parag Parikh Flexi Cap Fund - Reg (G)", folio: "10293847/01", sip: "₹5,000", invested: 180000, current: 254200, returns: "+41.2%" },
      { name: "Nippon India Small Cap Fund - Reg (G)", folio: "88492011/92", sip: "₹3,000", invested: 110000, current: 158100, returns: "+43.7%" },
      { name: "HDFC Balanced Advantage Fund - Reg (G)", folio: "44920199/10", sip: "₹2,000", invested: 60000, current: 70150, returns: "+16.9%" }
    ]
  },
  all: {
    invested: 620000,
    current: 845200,
    gains: 225200,
    xirr: "14.9%",
    funds: [
      { name: "Parag Parikh Flexi Cap Fund - Reg (G)", folio: "10293847/01", sip: "₹5,000", invested: 180000, current: 254200, returns: "+41.2%", tag: "ARN-288927" },
      { name: "Nippon India Small Cap Fund - Reg (G)", folio: "88492011/92", sip: "₹3,000", invested: 110000, current: 158100, returns: "+43.7%", tag: "ARN-288927" },
      { name: "HDFC Balanced Advantage Fund - Reg (G)", folio: "44920199/10", sip: "₹2,000", invested: 60000, current: 70150, returns: "+16.9%", tag: "ARN-288927" },
      { name: "Mirae Asset Large Cap Fund - Direct (G)", folio: "99102833/00", sip: "Stopped", invested: 150000, current: 201300, returns: "+34.2%", tag: "External" },
      { name: "UTI Nifty 50 Index Fund - Reg (G)", folio: "33948271/55", sip: "₹2,500", invested: 120000, current: 161450, returns: "+34.5%", tag: "External" }
    ]
  }
};

function formatINR(val) {
  return "₹" + Math.round(val).toLocaleString('en-IN');
}

// Handle OTP Screen Transition
function requestOTP(e) {
  e.preventDefault();
  const input = document.getElementById('loginIdentifier').value.trim();
  if (!input) return;
  document.getElementById('stepInput').style.display = 'none';
  document.getElementById('stepOtp').style.display = 'block';
  document.getElementById('otpTarget').textContent = input;
}

function verifyOTP(e) {
  e.preventDefault();
  // Simulated instant client login
  document.getElementById('authCard').style.display = 'none';
  document.getElementById('dashboardView').style.display = 'block';
  renderPortfolio('umm');
}

function logout() {
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('authCard').style.display = 'block';
  document.getElementById('stepOtp').style.display = 'none';
  document.getElementById('stepInput').style.display = 'block';
  document.getElementById('loginIdentifier').value = '';
}

// Render Portfolio State
function renderPortfolio(type) {
  const data = portfolioData[type];
  document.getElementById('kpiCurrent').textContent = formatINR(data.current);
  document.getElementById('kpiInvested').textContent = formatINR(data.invested);
  document.getElementById('kpiGain').textContent = "+" + formatINR(data.gains);
  document.getElementById('kpiXirr').textContent = data.xirr;

  // Toggle active tab buttons
  document.getElementById('tabUmm').classList.toggle('active', type === 'umm');
  document.getElementById('tabAll').classList.toggle('active', type === 'all');

  const container = document.getElementById('fundsList');
  container.innerHTML = data.funds.map(f => `
    <div style="background:#FFF;border:1px solid #E2E8F0;border-radius:12px;padding:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:12px">
      <div style="min-width:240px;flex:1">
        <div style="font-weight:700;font-size:14.5px;color:#0F172A">${f.name}</div>
        <div style="font-size:12px;color:#64748B;margin-top:3px;font-family:monospace">Folio: ${f.folio} · SIP: ${f.sip} ${f.tag ? `<span style="background:#F1F5F9;padding:2px 8px;border-radius:6px;font-size:10px;margin-left:6px">${f.tag}</span>` : ''}</div>
      </div>
      <div style="display:flex;gap:24px;align-items:center">
        <div style="text-align:right">
          <div style="font-size:11px;color:#64748B;text-transform:uppercase">Invested</div>
          <div style="font-weight:700;font-size:14px;color:#0F172A">${formatINR(f.invested)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#64748B;text-transform:uppercase">Current Value</div>
          <div style="font-weight:800;font-size:15px;color:#10B981">${formatINR(f.current)}</div>
        </div>
        <span style="font-size:12px;font-weight:700;color:#10B981;background:#ECFDF5;padding:4px 10px;border-radius:20px">${f.returns}</span>
      </div>
    </div>
  `).join('');
}

// Modal Controllers
function openTaxModal() {
  document.getElementById('taxModal').style.display = 'flex';
}
function closeTaxModal() {
  document.getElementById('taxModal').style.display = 'none';
}
