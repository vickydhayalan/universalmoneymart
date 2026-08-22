#!/usr/bin/env python3
"""
build-footer.py — Universal Money Mart footer sync tool

Edit ONLY partials/footer.html. Then run this script before every git push.
It finds the first <footer> ... </footer> block in every .html file (except
files inside partials/) and replaces it with the current master footer.

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

def main():
    dry_run = "--dry-run" in sys.argv

    if not FOOTER_PARTIAL.exists():
        print(f"ERROR: {FOOTER_PARTIAL} not found. Create it first.")
        sys.exit(1)

    master_footer = FOOTER_PARTIAL.read_text(encoding="utf-8").strip()

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
        new_text, n = FOOTER_RE.subn(master_footer, text, count=1)
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
