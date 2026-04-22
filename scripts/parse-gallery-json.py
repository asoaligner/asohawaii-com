"""Parse Wix Pro Gallery items from embedded itemId JSON blocks.

Unlike parse-product-items.py which reads DOM wrappers (only the first ~15
lazy-loaded tiles), this reads the `"itemId":...` JSON structure that Wix
embeds for the WHOLE gallery, giving us all items up front.

Output: JSON map from slug -> ordered list of {name, image} where `image`
is the e724a4_HASH.ext (no "~mv2" suffix, no path).
"""
import re
import json
import sys
from pathlib import Path

PAGES_DIR = Path(r"C:\Users\asoha\AppData\Local\Temp\aso-pages")

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

ITEM_ID_RE = re.compile(r'"itemId":"[a-f0-9-]+"')


def clean_title(t: str) -> str:
    t = t.replace("\\/", "/")
    t = (
        t.replace("&amp;", "&")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("\u00a0", " ")
        .replace("\uff08", " (")
        .replace("\uff09", ")")
        .replace("\u2160", "I")
        .replace("\u2161", "II")
        .replace("\u2162", "III")
        .replace("\u2163", "IV")
    )
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"(Bionator|Frankel)(I+V?|IV)(?=[\s(]|$)", r"\1 \2", t)
    t = re.sub(r"([A-Za-z0-9])\(", r"\1 (", t)
    return t


def parse_page(slug: str) -> list[dict]:
    html_file = PAGES_DIR / f"{slug}.html"
    if not html_file.exists():
        return []
    html = html_file.read_text(encoding="utf-8", errors="ignore")

    marker_starts = [m.start() for m in ITEM_ID_RE.finditer(html)]
    if not marker_starts:
        return []
    marker_starts.append(len(html))

    items = []
    seen = set()
    for i in range(len(marker_starts) - 1):
        block = html[marker_starts[i] : marker_starts[i + 1]]
        # Only take blocks close to original itemId definition — 2000 chars
        block = block[:2000]
        title_m = re.search(r'"title":"([^"]*)"', block)
        name_m = re.search(r'"(?:name|mediaUrl)":"(e724a4_[^"~]+)~?(?:mv2)?\.(jpg|jpeg|png|gif|webp)"', block)
        if not title_m or not name_m:
            continue
        title = clean_title(title_m.group(1))
        if not title:
            continue
        image = f"{name_m.group(1)}.{name_m.group(2)}"
        key = (title, image)
        if key in seen:
            continue
        seen.add(key)
        items.append({"name": title, "image": image})
    return items


def main():
    result = {}
    for slug in PAGES:
        items = parse_page(slug)
        result[slug] = items
        print(f"  {slug}: {len(items)} items", file=sys.stderr)

    output = sys.argv[1] if len(sys.argv) > 1 else None
    if output:
        Path(output).write_text(
            json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print(f"wrote {output}", file=sys.stderr)
    else:
        sys.stdout.reconfigure(encoding="utf-8")
        json.dump(result, sys.stdout, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
