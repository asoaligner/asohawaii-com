"""For each asohawaii page, list image base-ids in appearance order."""
import re
import json
from pathlib import Path

PAGES_DIR = Path(r"C:\Users\asoha\AppData\Local\Temp\aso-pages")
BASE_RE = re.compile(r"media/(e724a4_[a-f0-9]+(?:f000)?)(?:~mv2)?\.(jpg|jpeg|png|gif)")

# Find img tags and their base URLs in order
IMG_RE = re.compile(r'<img[^>]*?src="(https://static\.wixstatic\.com/media/[^"]+)"', re.IGNORECASE)

result = {}
for html_file in sorted(PAGES_DIR.glob("*.html")):
    page = html_file.stem
    html = html_file.read_text(encoding="utf-8", errors="ignore")
    seen_order = []
    seen_set = set()
    for m in IMG_RE.finditer(html):
        url = m.group(1)
        mb = BASE_RE.search(url)
        if mb:
            bid = f"{mb.group(1)}.{mb.group(2)}"
            if bid not in seen_set:
                seen_set.add(bid)
                seen_order.append(bid)
    # Also catch srcSet-only
    for m in re.finditer(r'srcSet="(https://static\.wixstatic\.com/media/[^"\s,]+)', html):
        url = m.group(1)
        mb = BASE_RE.search(url)
        if mb:
            bid = f"{mb.group(1)}.{mb.group(2)}"
            if bid not in seen_set:
                seen_set.add(bid)
                seen_order.append(bid)
    result[page] = seen_order

print(json.dumps(result, indent=2))
