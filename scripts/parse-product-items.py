"""Parse Wix Pro Gallery items from each product detail page.

Each <div class="item-link-wrapper" data-idx="N" ...> block contains one
gallery item. Inside we look for:
  - The first media/e724a4_...~mv2.(jpg|png) URL (the product photo)
  - The inner <span>TITLE</span> inside info-element-title (the label)

Output: JSON map from slug -> ordered list of {idx, name, image}
"""
import re
import json
import sys
from pathlib import Path

PAGES_DIR = Path(r"C:\Users\asoha\AppData\Local\Temp\aso-pages")

# Product pages to parse (detail pages that have gallery items with names)
PAGES = [
    "plate-type-retainer-expansion",
    "plate-expansion",
    "band-appliance",
    "aso-aligner",
    "flat-occlusal-splint",
    "lingual-retainer",
    "invisible-retainer",
    "study-model",
    "functional-appliances",
    "idb",
    "new-products",
    "press-type-appliance",
]

ITEM_RE = re.compile(
    r'<div [^>]*data-hook="item-link-wrapper"[^>]*data-idx="(\d+)"[^>]*>(.*?)</div></div></div></div></div>',
    re.DOTALL,
)
# Simpler: match from one item-link-wrapper to the next (or end)
WRAPPER_SPLIT = re.compile(
    r'class="item-link-wrapper"\s+data-idx="(\d+)"'
)
IMG_RE = re.compile(
    r'media/(e724a4_[a-f0-9]+(?:f000)?)~?(?:mv2)?\.(jpg|jpeg|png|gif)'
)
TITLE_RE = re.compile(
    r'data-hook="item-title"[^>]*>\s*<span>([^<]+)</span>',
    re.DOTALL,
)


def parse_page(slug: str) -> list[dict]:
    html_file = PAGES_DIR / f"{slug}.html"
    if not html_file.exists():
        return []
    html = html_file.read_text(encoding="utf-8", errors="ignore")

    # Split on each wrapper to get item blocks
    wrapper_positions = [
        (m.start(), int(m.group(1))) for m in WRAPPER_SPLIT.finditer(html)
    ]
    # Add a sentinel at end
    wrapper_positions.append((len(html), -1))

    items = []
    seen_idx = set()
    for i in range(len(wrapper_positions) - 1):
        start_pos, idx = wrapper_positions[i]
        end_pos = wrapper_positions[i + 1][0]
        if idx in seen_idx:
            continue
        seen_idx.add(idx)
        block = html[start_pos:end_pos]

        # Find first image in this block
        img_match = IMG_RE.search(block)
        # Find title in this block
        title_match = TITLE_RE.search(block)

        if not img_match or not title_match:
            continue

        img_id = f"{img_match.group(1)}.{img_match.group(2)}"
        title = title_match.group(1).strip()
        # Clean up HTML entities + normalize whitespace
        title = (
            title.replace("&amp;", "&")
            .replace("&quot;", '"')
            .replace("&#39;", "'")
            .replace("\u00a0", " ")
            # Normalize full-width parens to ASCII
            .replace("\uff08", " (")
            .replace("\uff09", ")")
            # Roman numerals Unicode → ASCII
            .replace("\u2160", "I")
            .replace("\u2161", "II")
            .replace("\u2162", "III")
            .replace("\u2163", "IV")
        )
        # Collapse internal whitespace (covers embedded <br>s converted to \n)
        title = re.sub(r"\s+", " ", title).strip()
        # Add space between Bionator/Frankel and roman numerals that are glued
        title = re.sub(r"(Bionator|Frankel)(I+V?|IV)(?=[\s(]|$)", r"\1 \2", title)
        # Add space before opening paren if missing
        title = re.sub(r"([A-Za-z0-9])\(", r"\1 (", title)
        items.append({"idx": idx, "name": title, "image": img_id})

    # Sort by idx
    items.sort(key=lambda x: x["idx"])
    return items


result = {}
for slug in PAGES:
    items = parse_page(slug)
    result[slug] = items

output_path = sys.argv[1] if len(sys.argv) > 1 else None
if output_path:
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
else:
    # Write to stdout with utf-8 buffer
    sys.stdout.reconfigure(encoding="utf-8")
    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
