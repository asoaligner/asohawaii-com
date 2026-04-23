"""Re-process Invisible Retainer photos with deterministic 90° CW rotation.

The earlier combined script used a brightness-based heuristic to orient
each photo into ∩ form, but the clear-plastic Invisible Retainers do not
have enough brightness contrast at the arch opening for that heuristic
to be reliable. Koji asked for a simple fixed 90° CW rotation across
all 7 photos so they share the same orientation.

Pipeline (per photo):
  1. Apply EXIF orientation so pixel orientation matches what Koji saw.
  2. Rotate 90° clockwise (unconditional).
  3. Detect appliance bounds vs dark backdrop, crop with 6% padding.
  4. Fit into 1200x900 4:3 canvas with uniform (22,22,26) backdrop.
  5. Save as optimized JPEG.
"""
from PIL import Image, ImageFilter, ImageOps
from pathlib import Path
import numpy as np
import sys

SRC = Path(r"C:\Users\asoha\OneDrive\Desktop\admin\Documents\ASO Hawaii\press type photo")
DST = Path(r"C:\Users\asoha\asohawaii-website\public\images\aso\invisible-retainer")

TARGET_W = 1200
TARGET_H = 900
BG_COLOR = (22, 22, 26)

# Source stem -> output slug
ROUTE = {
    "Direct print LuxCreo":                     "direct-print-luxcreo",
    "Invisible Retainer C+":                    "c-plus-high-strength",
    "Invisible Retainer Standard 1mm":          "standard-co-polyester",
    "Invisible Retainer Standard 1mm 2":        "standard-co-polyester-alt",
    "Invisible Retainer with Plastic Pontic":   "with-pontic",
    "Invisible Retainer with Plastic Pontic 2": "with-pontic-alt",
    "Zendura A":                                "zendura-a",
}


def detect_content_bbox(img: Image.Image, bg_threshold: int = 55):
    gs = img.convert("L").filter(ImageFilter.GaussianBlur(radius=2))
    arr = np.array(gs)
    mask = arr > bg_threshold
    if not mask.any():
        return None
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    return int(cols.min()), int(rows.min()), int(cols.max()) + 1, int(rows.max()) + 1


def process(src_path: Path, dst_path: Path) -> None:
    im = Image.open(src_path)
    im = ImageOps.exif_transpose(im).convert("RGB")

    # Deterministic 90° CW rotation.
    rotated = im.rotate(-90, expand=True)

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

    src_w, src_h = rotated.size
    target_aspect = TARGET_W / TARGET_H
    src_aspect = src_w / src_h

    if src_aspect > target_aspect:
        new_w = TARGET_W
        new_h = int(TARGET_W / src_aspect)
    else:
        new_h = TARGET_H
        new_w = int(TARGET_H * src_aspect)

    resized = rotated.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), BG_COLOR)
    off_x = (TARGET_W - new_w) // 2
    off_y = (TARGET_H - new_h) // 2
    canvas.paste(resized, (off_x, off_y))

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst_path, "JPEG", quality=88, optimize=True)


def main() -> int:
    DST.mkdir(parents=True, exist_ok=True)
    processed = []
    for stem, slug in ROUTE.items():
        src = SRC / f"{stem}.jpg"
        if not src.exists():
            print(f"MISSING: {src}")
            continue
        dst = DST / f"{slug}.jpg"
        process(src, dst)
        processed.append(f"  {slug:32s} <- {stem}.jpg")

    print(f"Processed {len(processed)} photos:")
    for line in processed:
        print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
