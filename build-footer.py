#!/usr/bin/env python3
"""
build-sitemap.py — Universal Money Mart sitemap generator

Scans the repo for real, public HTML pages and regenerates sitemap.xml.
Run this whenever pages are added/removed. It is also run automatically
by the GitHub Action (see .github/workflows/build-footer.yml).

Usage:
    python3 build-sitemap.py
"""
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOMAIN = "https://universalmoneymart.com"
TODAY = datetime.date.today().isoformat()

# Folders/files to exclude entirely (not public pages)
EXCLUDE_DIRS = {"partials", "invites", ".git", "node_modules"}
EXCLUDE_FILES = {"view.html"}

# Priority rules — first matching rule wins
def priority_for(rel_path: str) -> str:
    if rel_path == "index.html":
        return "1.0"
    if rel_path in ("about.html", "contact.html", "masterclass.html"):
        return "0.8"
    if rel_path.startswith("tools/"):
        return "0.9"
    if rel_path.startswith("blog/") and rel_path != "blog/index.html":
        return "0.7"
    if rel_path == "blog/index.html":
        return "0.8"
    if rel_path in ("privacy-policy.html", "disclaimer.html", "terms-and-conditions.html"):
        return "0.3"
    return "0.6"

def url_for(rel_path: str) -> str:
    if rel_path == "index.html":
        return f"{DOMAIN}/"
    return f"{DOMAIN}/{rel_path}"

def main():
    html_files = []
    for p in ROOT.rglob("*.html"):
        rel = p.relative_to(ROOT)
        parts = rel.parts
        if any(part in EXCLUDE_DIRS for part in parts):
            continue
        if rel.name in EXCLUDE_FILES:
            continue
        html_files.append(rel.as_posix())

    html_files.sort(key=lambda x: (x != "index.html", x))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', '']
    for rel_path in html_files:
        lines.append("  <url>")
        lines.append(f"    <loc>{url_for(rel_path)}</loc>")
        lines.append(f"    <lastmod>{TODAY}</lastmod>")
        lines.append(f"    <priority>{priority_for(rel_path)}</priority>")
        lines.append("  </url>")
    lines.append("")
    lines.append("</urlset>")

    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"sitemap.xml regenerated with {len(html_files)} URLs")

if __name__ == "__main__":
    main()
