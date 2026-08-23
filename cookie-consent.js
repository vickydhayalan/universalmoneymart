/* Universal Money Mart — Cookie Consent Banner
   Lightweight, no dependencies. Shows once per browser until accepted. */
(function () {
  var STORAGE_KEY = 'umm_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY) === 'accepted') return;

  var banner = document.createElement('div');
  banner.id = 'umm-cookie-banner';
  banner.innerHTML =
    '<div id="umm-cc-inner">' +
      '<p id="umm-cc-text">🍪 We use cookies (including Google Analytics &amp; AdSense) to improve your experience. By continuing, you agree to our ' +
      '<a href="/privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div id="umm-cc-btns">' +
        '<button id="umm-cc-accept">Accept</button>' +
        '<a href="/privacy-policy.html" id="umm-cc-learn">Learn more</a>' +
      '</div>' +
    '</div>';

  var style = document.createElement('style');
  style.textContent =
    '#umm-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
    'background:#0D0D12;color:#fff;padding:14px 20px;font-family:Inter,system-ui,sans-serif;' +
    'box-shadow:0 -4px 20px rgba(0,0,0,.15);animation:ummCcSlideUp .35s ease-out}' +
    '#umm-cc-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;' +
    'justify-content:space-between;gap:16px;flex-wrap:wrap}' +
    '#umm-cc-text{font-size:13px;line-height:1.5;color:#E5E7EB;margin:0;flex:1;min-width:220px}' +
    '#umm-cc-text a{color:#F5A623;text-decoration:underline}' +
    '#umm-cc-btns{display:flex;align-items:center;gap:14px;flex-shrink:0}' +
    '#umm-cc-accept{background:#F5A623;color:#0D0D12;border:none;padding:9px 20px;' +
    'border-radius:100px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}' +
    '#umm-cc-accept:hover{background:#FFD166}' +
    '#umm-cc-learn{font-size:12.5px;color:#9CA3AF;text-decoration:underline;white-space:nowrap}' +
    '@keyframes ummCcSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '@media(max-width:600px){#umm-cookie-banner{padding:12px 16px 16px}' +
    '#umm-cc-inner{flex-direction:column;align-items:stretch;text-align:center}' +
    '#umm-cc-btns{justify-content:center}}';

  document.head.appendChild(style);
  document.body.appendChild(banner);

  document.getElementById('umm-cc-accept').addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    banner.remove();
  });
})();
