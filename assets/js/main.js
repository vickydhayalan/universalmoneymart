// Universal Money Mart - Main App Scripts
// 1. Live Gold Spot API fetch
(async function initGoldTicker() {
  const el = document.getElementById('tickerGoldPrice');
  if (!el) return;
  try {
    const res = await fetch('https://xaus.com/api/v1/spot?currency=INR&unit=gram');
    const data = await res.json();
    if (data.xau && data.xau.price) {
      const price22k = Math.round(data.xau.price * (22 / 24));
      el.textContent = "₹" + price22k.toLocaleString('en-IN') + "/g";
    }
  } catch(e) {
    el.textContent = "₹7,250/g (Est)";
  }
})();

// 2. Mobile Drawer Navigation toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobileDrawer');
  if (menu) menu.classList.toggle('open');
}

// 3. Lead Form submission with WhatsApp redirection
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('leadSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Processing...';
    try {
      const res = await fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        this.style.display = 'none';
        document.getElementById('leadSuccess').style.display = 'block';
        const name = this.querySelector('[name="name"]')?.value || '';
        const goal = document.getElementById('goalVal')?.value || 'Wealth Creation';
        setTimeout(() => {
          const text = encodeURIComponent(`Hi Vignesh! 👋\n\nI submitted the consultation request on universalmoneymart.com\n\nName: ${name}\nGoal: ${goal}\n\nPlease guide me on the next steps!`);
          window.open(`https://wa.me/917200752628?text=${text}`, '_blank');
        }, 1200);
      } else {
        btn.disabled = false;
        btn.textContent = 'Get Free Consultation on WhatsApp';
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Get Free Consultation on WhatsApp';
    }
  });
}

function selectLeadChip(el, group) {
  el.closest('[id$="Chips"]').querySelectorAll('.lf-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById(group + 'Val').value = el.textContent.trim();
}
