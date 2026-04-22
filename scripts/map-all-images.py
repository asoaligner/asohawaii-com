"""Map every Wix image URL to (page, alt_text) across asohawaii.com pages."""
import re
import os
import json
import sys
from pathlib import Path

PAGES_DIR = Path(r"C:\Users\asoha\AppData\Local\Temp\aso-pages")
if not PAGES_DIR.exists():
    PAGES_DIR = Path("/tmp/aso-pages")

IMG_RE = re.compile(
    r'<img[^>]*?src="(https://static\.wixstatic\.com/media/[^"]+)"[^>]*?alt="([^"]*)"',
    re.IGNORECASE | re.DOTALL,
)

# Also catch srcSet pattern
SRCSET_RE = re.compile(
    r'<img[^>]*?srcSet="(https://static\.wixstatic\.com/media/[^"\s,]+)[^"]*"[^>]*?alt="([^"]*)"',
    re.IGNORECASE | re.DOTALL,
)

# Base URL regex to normalize
BASE_RE = re.compile(r"media/(e724a4_[a-f0-9]+(?:f000)?)(?:~mv2)?\.(jpg|jpeg|png|gif)")

def base_id(url: str) -> str | None:
    m = BASE_RE.search(url)
    if m:
        return f"{m.group(1)}.{m.group(2)}"
    return None

# Collect from pages
results: dict[str, dict] = {}  # base_id -> {alts: set, pages: set}

for html_file in sorted(PAGES_DIR.glob("*.html")):
    page = html_file.stem
    try:
        html = html_file.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    for m in IMG_RE.finditer(html):
        url = m.group(1)
        alt = m.group(2).strip()
        bid = base_id(url)
        if not bid:
            continue
        entry = results.setdefault(bid, {"alts": set(), "pages": set()})
        entry["pages"].add(page)
        if alt:
            entry["alts"].add(alt)
    for m in SRCSET_RE.finditer(html):
        url = m.group(1)
        alt = m.group(2).strip()
        bid = base_id(url)
        if not bid:
            continue
        entry = results.setdefault(bid, {"alts": set(), "pages": set()})
        entry["pages"].add(page)
        if alt:
            entry["alts"].add(alt)

# Output
for bid in sorted(results.keys()):
    entry = results[bid]
    alts = " | ".join(sorted(entry["alts"])) or "(no alt)"
    pages = ",".join(sorted(entry["pages"]))
    sys.stdout.write(f"{bid}\tPAGES={pages}\tALT={alts}\n")
