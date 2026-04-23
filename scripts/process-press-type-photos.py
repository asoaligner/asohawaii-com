"""Batch-process press-type and invisible-retainer photos:
  - Rotate 90° clockwise so U-shape opens downward (∩).
  - Auto-crop to the appliance bounds (detect vs dark background).
  - Pad to a consistent 4:3 aspect with soft-dark background.
  - Resize to a uniform 1200×900 so the gallery grid looks even.
  - Save to /public/images/aso/{press-type,invisible-retainer}/<slug>.jpg.
"""
from PIL import Image, ImageFilter, ImageOps
from pathlib import Path
import numpy as np
import re
import sys

SRC = Path(r"C:\Users\asoha\OneDrive\Desktop\admin\Documents\ASO Hawaii\press type photo")
DST_PT = Path(r"C:\Users\asoha\asohawaii-website\public\images\aso\press-type")
DST_IR = Path(r"C:\Users\asoha\asohawaii-website\public\images\aso\invisible-retainer")

# Target output dimensions (4:3 landscape)
TARGET_W = 1200
TARGET_H = 900

# Background color for uniform padding (slightly warmer than black so
# the dark workbench backdrop blends smoothly with the page's white card).
BG_COLOR = (22, 22, 26)

# Map source filename stem → (category, output slug)
#   category: "pt" (press-type) or "ir" (invisible-retainer)
ROUTE = {
    # ---- press-type ----
    "Hard Night Guard — 1.5 mm":          ("pt", "hard-night-guard-1.5mm"),
    "Hard Night Guard — 2.0 mm":          ("pt", "hard-night-guard-2.0mm"),
    "Hard-and-Soft Night Guard — 2.0 mm": ("pt", "hard-soft-night-guard-2.0mm"),
    "Hard-and-Soft Night Guard — 3.0 mm": ("pt", "hard-soft-night-guard-3.0mm"),
    "Hard-and-Soft Night Guard — 3.5 mm": ("pt", "hard-soft-night-guard-3.5mm"),
    "Hard-and-Soft Night Guard — 4.0 mm": ("pt", "hard-soft-night-guard-4.0mm"),
    "Soft Night Guard — 2.0 mm":          ("pt", "soft-night-guard-2.0mm"),
    "Soft Night Guard — 3.0 mm":          ("pt", "soft-night-guard-3.0mm"),
    "Sports Mouthguard — 3.0 mm":         ("pt", "sports-mouthguard-3.0mm"),
    "Sports Mouthguard — 5.0 mm":         ("pt", "sports-mouthguard-5.0mm"),
    "Bleaching Tray":                     ("pt", "bleaching-tray"),
    # ---- invisible-retainer ----
    "Direct print LuxCreo":               ("ir", "direct-print-luxcreo"),
    "Invisible Retainer C+":              ("ir", "c-plus-high-strength"),
    "Invisible Retainer Standard 1mm":    ("ir", "standard-co-polyester"),
    "Invisible Retainer Standard 1mm 2":  ("ir", "standard-co-polyester-alt"),
    "Invisible Retainer with Plastic Pontic":   ("ir", "with-pontic"),
    "Invisible Retainer with Plastic Pontic 2": ("ir", "with-pontic-alt"),
    "Zendura A":                          ("ir", "zendura-a"),
}


def detect_content_bbox(img: Image.Image, bg_threshold: int = 55) -> tuple[int, int, int, int] | None:
    """Find the bounding box of the bright appliance vs dark background.

    Uses a grayscale threshold: anything brighter than `bg_threshold` is
    considered "appliance". Small blur first to swallow sensor noise.
    Returns (left, top, right, bottom) or None if nothing found.
    """
    gs = img.convert("L").filter(ImageFilter.GaussianBlur(radius=2))
    arr = np.array(gs)
    mask = arr > bg_threshold
    if not mask.any():
        return None
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    return int(cols.min()), int(rows.min()), int(cols.max()) + 1, int(rows.max()) + 1


def auto_orient_to_inverted_u(im: Image.Image) -> Image.Image:
    """Given an image whose EXIF orientation has been normalized, rotate
    so the appliance reads as ∩ (opening facing DOWN, curve at TOP).

    Uses two heuristics:
      1. Ensure the image is landscape (wider than tall). If portrait,
         rotate 90° CW. Most phone photos come out portrait; our bench
         shots are in fact landscape composition with the arch laid
         horizontally — so after EXIF-transpose they may be portrait,
         we correct here.
      2. With the arch laid horizontally (opening left or right), test
         whether the opening is on the LEFT or RIGHT by comparing the
         brightness mass of the top-left quadrant vs top-right quadrant
         of the detected content. The opening has dark background
         showing through; the closed curve is solid appliance. Rotate
         so opening ends up at the BOTTOM.
    """
    import numpy as np

    # Step 1: make landscape
    if im.size[1] > im.size[0]:
        im = im.rotate(-90, expand=True)

    # Step 2: determine opening side
    bbox = detect_content_bbox(im)
    if bbox is None:
        # Can't detect — leave as-is
        return im.rotate(-90, expand=True)

    l, t, r, b = bbox
    gs = np.array(im.convert("L"))
    # Divide content bbox into left / right halves
    mid_x = (l + r) // 2
    left_half = gs[t:b, l:mid_x]
    right_half = gs[t:b, mid_x:r]
    # Mean brightness inside the content bbox; the opening shows
    # through to the dark background → LOWER mean → that side is the opening
    left_mean = left_half.mean() if left_half.size else 0
    right_mean = right_half.mean() if right_half.size else 0
    opening_on_right = right_mean < left_mean

    # To end with opening at BOTTOM (∩), we rotate:
    #   opening-right  → 90° CW → opening-bottom ✓
    #   opening-left   → 90° CCW → opening-bottom ✓
    if opening_on_right:
        return im.rotate(-90, expand=True)
    else:
        return im.rotate(90, expand=True)


def process(src_path: Path, dst_path: Path) -> None:
    im = Image.open(src_path)
    # Apply any EXIF rotation so we see the raw pixel orientation.
    im = ImageOps.exif_transpose(im).convert("RGB")
    # Rotate to consistent ∩ (inverted U, opening down).
    rotated = auto_orient_to_inverted_u(im)

    # 2. Detect appliance bounds, add ~5% padding, crop.
    bbox = detect_content_bbox(rotated)
    if bbox is not None:
        l, t, r, b = bbox
        w, h = r - l, b - t
        pad_x = int(w * 0.06)
        pad_y = int(h * 0.06)
        l = max(0, l - pad_x)
        t = max(0, t - pad_y)
        r = min(rotated.size[0], r + pad_x)
        b = min(rotated.size[1], b + pad_y)
        rotated = rotated.crop((l, t, r, b))

    # 3. Fit into 4:3 canvas with uniform background.
    src_w, src_h = rotated.size
    target_aspect = TARGET_W / TARGET_H
    src_aspect = src_w / src_h

    if src_aspect > target_aspect:
        # Wider than 4:3 — scale to width, pad top/bottom.
        new_w = TARGET_W
        new_h = int(TARGET_W / src_aspect)
    else:
        # Taller than 4:3 — scale to height, pad left/right.
        new_h = TARGET_H
        new_w = int(TARGET_H * src_aspect)

    resized = rotated.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), BG_COLOR)
    off_x = (TARGET_W - new_w) // 2
    off_y = (TARGET_H - new_h) // 2
    canvas.paste(resized, (off_x, off_y))

    # 4. Save as optimized JPEG
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst_path, "JPEG", quality=88, optimize=True)


def main() -> int:
    DST_PT.mkdir(parents=True, exist_ok=True)
    DST_IR.mkdir(parents=True, exist_ok=True)

    processed = []
    skipped = []
    for src in sorted(SRC.iterdir()):
        if src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        stem = src.stem
        route = ROUTE.get(stem)
        if not route:
            skipped.append(src.name)
            continue
        category, slug = route
        out_dir = DST_PT if category == "pt" else DST_IR
        dst = out_dir / f"{slug}.jpg"
        process(src, dst)
        processed.append(f"  {category:2s} {slug:40s} ← {src.name}")

    print(f"Processed {len(processed)} photos:")
    for line in processed:
        print(line)
    if skipped:
        print(f"\nSkipped {len(skipped)} (not in ROUTE):")
        for s in skipped:
            print(f"  {s}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
