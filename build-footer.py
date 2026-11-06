#!/usr/bin/env python3
"""
Universal Money Mart - Automated Footer Builder
Injects/Updates global Money Mart footer on content pages while safely
ignoring standalone sub-brands like D-FARM Polur.
"""

import os
import re

FOOTER_HTML = """<footer>
  <div class="ft-grid">
    <div>
      <div class="logo" style="gap:10px">
        <div class="logo-box"><img src="/Logo.png" alt="UMM" style="width:36px;height:36px;border-radius:8px;object-fit:cover" onerror="this.parentElement.innerHTML='₹'"></div>
        <div class="ft-logo-name">Universal <span>Money</span> Mart</div>
      </div>
      <p class="ft-desc">Tamil Finance Education & Business Compliance. SIP, Tax, GST, Documentation & Free Investment Consultation — Vignesh Dhayalan & Ramya, Bangalore.</p>
      <div class="ft-badges">
        <span class="ft-badge">AMFI MFD</span>
        <span class="ft-badge">ARN 288927</span>
        <span class="ft-badge">EUIN E543710</span>
        <span class="ft-badge">GST 29BWRPV6671C1ZQ</span>
        <span class="ft-badge">Bangalore</span>
      </div>
    </div>
    <div>
      <div class="ft-col-h">Finance Guides</div>
      <div class="ft-links">
        <a href="/blog/what-is-mutual-fund.html">Mutual Fund Basics</a>
        <a href="/blog/what-is-sip.html">SIP Guide</a>
        <a href="/blog/new-vs-old-tax-regime.html">New vs Old Tax Regime</a>
        <a href="/blog/epf-vs-ppf-difference.html">EPF vs PPF</a>
        <a href="/blog/credit-score-guide.html">Credit Score 750+</a>
        <a href="/blog/index.html" style="color:var(--gold)">→ All Articles</a>
      </div>
    </div>
    <div>
      <div class="ft-col-h">Tools & Services</div>
      <div class="ft-links">
        <a href="/tools/nism-series-va-mock-test.html">NISM V-A Mock Test</a>
        <a href="/daily-quiz.html">🧠 Daily Finance Quiz</a>
        <a href="/gold-rate-today.html">🥇 Gold Rate Today</a>
        <a href="/tools/irdai-ic38-mock-test.html">IRDAI IC38 Mock Test</a>
        <a href="/tools/sip-calculator.html">SIP Calculator</a>
        <a href="/tools/fd-calculator.html">FD Calculator</a>
        <a href="/tools/rd-calculator.html">RD Calculator</a>
        <a href="/tools/budget-calculator.html">Budget Planner</a>
        <a href="#consultation" style="color:var(--green)">🎯 Free Consultation</a>
        <a href="/prompt-library.html">AI Prompt Library</a>
      </div>
    </div>
    <div>
      <div class="ft-col-h">Quick Links</div>
      <div class="ft-links">
        <a href="/about.html">About Us</a>
        <a href="/contact.html">Contact Us</a>
        <a href="/privacy-policy.html">Privacy Policy</a>
        <a href="/disclaimer.html">Disclaimer</a>
        <a href="/terms-and-conditions.html">Terms & Rules</a>
        <a href="https://wa.me/917200752628" target="_blank" rel="noopener" style="color:var(--wa)">💬 WhatsApp</a>
      </div>
      <div style="margin-top:20px;padding:14px;background:rgba(255,255,255,.05);border-radius:10px;border:1px solid var(--bdrw)">
        <div style="font-family:var(--fm);font-size:10px;color:var(--tw3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Disclaimer</div>
        <div style="font-size:11px;color:var(--tw3);line-height:1.6">Mutual Fund investments are subject to market risks. Universal Money Mart is a private business consultancy and financial services facilitation platform — not a government body or affiliated with any government agency. GST: 29BWRPV6671C1ZQ</div>
      </div>
    </div>
  </div>
  <div class="ft-bottom">
    <div class="ft-copy">© 2024–2026 Universal Money Mart · Vignesh Dhayalan & Ramya · ARN 288927 · Bangalore, India</div>
    <div class="ft-legal">
      <a href="/privacy-policy.html">Privacy Policy</a>
      <a href="/disclaimer.html">Disclaimer</a>
      <a href="/terms-and-conditions.html">Terms & Rules</a>
      <a href="/contact.html">Contact</a>
    </div>
  </div>
</footer>"""

EXCLUDED_FILES = {
    "dfarm.html",
}

def should_skip(filepath):
    normalized = filepath.replace("\\", "/")
    filename = os.path.basename(normalized)
    
    # 1. Skip if file is explicitly excluded
    if filename in EXCLUDED_FILES:
        return True
    
    # 2. Skip anything inside dfarm subfolders
    if "dfarm/" in normalized or "/dfarm" in normalized or "dfarm" in filename:
        return True
        
    return False

def update_footer_in_file(filepath):
    if should_skip(filepath):
        print(f"Skipping (Protected Standalone): {filepath}")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace existing footer or insert before closing body
    if "<footer>" in content and "</footer>" in content:
        pattern = re.compile(r"<footer>.*?</footer>", re.DOTALL)
        new_content = pattern.sub(FOOTER_HTML, content)
    elif "</body>" in content:
        new_content = content.replace("</body>", f"{FOOTER_HTML}\n</body>")
    else:
        new_content = content + "\n" + FOOTER_HTML

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Updated: {filepath}")

def main():
    root_dir = "."
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".html"):
                full_path = os.path.join(root, file)
                update_footer_in_file(full_path)

if __name__ == "__main__":
    main()
