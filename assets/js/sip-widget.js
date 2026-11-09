// Interactive SIP Math & Live Updation
function formatINR(val) {
  return "₹" + Math.round(val).toLocaleString('en-IN');
}

function calculateSIP() {
  const monthly = parseFloat(document.getElementById('sipAmount').value);
  const years = parseFloat(document.getElementById('sipYears').value);
  const rate = parseFloat(document.getElementById('sipRate').value);

  // Update slider badges
  document.getElementById('sipAmountVal').textContent = formatINR(monthly);
  document.getElementById('sipYearsVal').textContent = years + " Yrs";
  document.getElementById('sipRateVal').textContent = rate + "%";

  const n = years * 12;
  const i = (rate / 100) / 12;

  // SIP Future Value formula
  const invested = monthly * n;
  const futureValue = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const estimatedGains = futureValue - invested;

  document.getElementById('resInvested').textContent = formatINR(invested);
  document.getElementById('resGains').textContent = formatINR(estimatedGains);
  document.getElementById('resTotal').textContent = formatINR(futureValue);
}

document.addEventListener('DOMContentLoaded', () => {
  ['sipAmount', 'sipYears', 'sipRate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateSIP);
  });
  calculateSIP();
});
