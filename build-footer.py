#!/usr/bin/env python3
"""
build-footer.py — Universal Money Mart footer sync tool (v2 — dedup fix)

Edit ONLY partials/footer.html (footer markup only — no script tags in it).
Then run this script before every git push, or let the GitHub Action run it.

It:
  1. Replaces the first <footer>...</footer> block in every .html file
     (except files inside partials/) with the current master footer.
  2. Removes ALL existing /cookie-consent.js script tags in the file,
     then inserts exactly ONE right after the footer.
This makes it safe to re-run any number of times — it will never
accumulate duplicate script tags again.

Usage:
    python3 build-footer.py            # apply changes
    python3 build-footer.py --dry-run  # show which files WOULD change, no writes
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FOOTER_PARTIAL = ROOT / "partials" / "footer.html"
FOOTER_RE = re.compile(r"<footer\b.*?</footer>", re.DOTALL | re.IGNORECASE)
COOKIE_SCRIPT_RE = re.compile(r'\s*<script\s+src="/cookie-consent\.js"[^>]*></script>', re.IGNORECASE)
COOKIE_SCRIPT_TAG = '\n<script src="/cookie-consent.js" defer></script>'

def main():
    dry_run = "--dry-run" in sys.argv

    if not FOOTER_PARTIAL.exists():
        print(f"ERROR: {FOOTER_PARTIAL} not found. Create it first.")
        sys.exit(1)

    master_footer = FOOTER_PARTIAL.read_text(encoding="utf-8").strip()
    # Safety: make sure the partial itself never carries a script tag anymore
    master_footer = COOKIE_SCRIPT_RE.sub('', master_footer).strip()

    html_files = [
        p for p in ROOT.rglob("*.html")
        if "partials" not in p.parts and ".git" not in p.parts
    ]

    changed, unchanged, no_footer = [], [], []

    for f in html_files:
        text = f.read_text(encoding="utf-8")
        if not FOOTER_RE.search(text):
            no_footer.append(f)
            continue

        # 1. Swap the footer block
        new_text, _ = FOOTER_RE.subn(master_footer, text, count=1)

        # 2. Strip every existing cookie-consent script tag (dedup)
        new_text = COOKIE_SCRIPT_RE.sub('', new_text)

        # 3. Insert exactly one, right after the (new) </footer>
        if '</footer>' in new_text:
            new_text = new_text.replace('</footer>', '</footer>' + COOKIE_SCRIPT_TAG, 1)

        if new_text != text:
            changed.append(f)
            if not dry_run:
                f.write_text(new_text, encoding="utf-8")
        else:
            unchanged.append(f)

    print(f"Scanned {len(html_files)} HTML files")
    print(f"  Updated : {len(changed)}")
    print(f"  Already up to date : {len(unchanged)}")
    print(f"  No <footer> found (skipped) : {len(no_footer)}")
    if no_footer:
        print("\nFiles with no <footer> tag (check these manually):")
        for f in no_footer:
            print(f"  - {f.relative_to(ROOT)}")
    if dry_run:
        print("\nDRY RUN — no files were written. Re-run without --dry-run to apply.")

if __name__ == "__main__":
    main()
