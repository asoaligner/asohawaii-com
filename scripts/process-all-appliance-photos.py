"""Unified reprocess for all 18 appliance photos (Press-Type + Invisible
Retainer).

Two framing modes, per Koji's 2026-04-23 instruction:
  - FRONT_VIEW (8 photos): front-facing shots of the appliance mounted on
    a plaster model or standing upright. Keep the EXIF-normalized
    orientation exactly — no 4-way rotation search. Just crop to content
    and center in a 1200x900 frame.
  - CAP_VIEW  (10 photos): top-down bench shots of night guards / sports
    guards / mouthguards. Run orient_to_cap() to force ∩ orientation
    (landscape, arch curve on top, opening facing DOWN).

Pipeline (both modes): EXIF-transpose → orient (cap mode only) → crop to
content bbox + 6% padding → fit into 1200x900 (preserve aspect, letterbox
with (22,22,26) backdrop) → paste centered → save JPEG q=88.

The orient_to_cap() scorer tries all 4 right-angle rotations and picks
the one maximizing (landscape bbox aspect) + 2x (fraction of appliance
mass in the top half of the bbox). For a ∩ arch the curve is wide across
the top and the two legs are skinny at the bottom, so top-mass > bot-mass.
This replaces the earlier left/right-half brightness comparison, which
flipped already-correct ∩ photos onto their side when the arch was
symmetric.
"""
from PIL import Image, ImageFilter, ImageOps
from pathlib import Path
import numpy as np
import sys

SRC = Path(r"C:\Users\asoha\OneDrive\Desktop\admin\Documents\ASO Hawaii\press type photo")
DST_PT = Path(r"C:\Users\asoha\asohawaii-website\public\images\aso\press-type")
DST_IR = Path(r"C:\Users\asoha\asohawaii-website\public\images\aso\invisible-retainer")

TARGET_W = 1200
TARGET_H = 900
BG_COLOR = (22, 22, 26)

# Source stem -> (category, output slug)
ROUTE = {
    # ---- press-type (11) ----
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
    # ---- invisible-retainer (7) ----
    "Direct print LuxCreo":                     ("ir", "direct-print-luxcreo"),
    "Invisible Retainer C+":                    ("ir", "c-plus-high-strength"),
    "Invisible Retainer Standard 1mm":          ("ir", "standard-co-polyester"),
    "Invisible Retainer Standard 1mm 2":        ("ir", "standard-co-polyester-alt"),
    "Invisible Retainer with Plastic Pontic":   ("ir", "with-pontic"),
    "Invisible Retainer with Plastic Pontic 2": ("ir", "with-pontic-alt"),
    "Zendura A":                                ("ir", "zendura-a"),
}

# Photos whose orientation is "front-facing" — shot against upright
# appliance / plaster model, already reading correctly via EXIF. Skip
# the 4-way rotation search for these; just crop + center.
FRONT_VIEW = {
    "bleaching-tray",
    "direct-print-luxcreo",
    "c-plus-high-strength",
    "standard-co-polyester",
    "standard-co-polyester-alt",
    "with-pontic",
    "with-pontic-alt",
    "zendura-a",
}

# Post-orient 180° override. Symmetric sports mouthguards scored as well
# upside-down (∪) as right-side-up, so the top-heaviness heuristic picked
# ∪. Hard-code a flip for these slugs until we have a better signal.
FLIP_180 = {
    "sports-mouthguard-3.0mm",
    "sports-mouthguard-5.0mm",
}


def _mask(im: Image.Image, threshold: int = 55) -> np.ndarray:
    gs = im.convert("L").filter(ImageFilter.GaussianBlur(radius=2))
    return np.array(gs) > threshold


def _bbox(mask: np.ndarray):
    if not mask.any():
        return None
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    return int(cols.min()), int(rows.min()), int(cols.max()) + 1, int(rows.max()) + 1


def _cap_score(im: Image.Image) -> float:
    """Higher = more ∩-shaped (landscape bbox, top-heavy content)."""
    m = _mask(im)
    bb = _bbox(m)
    if bb is None:
        return -1e9
    l, t, r, b = bb
    w, h = r - l, b - t
    aspect = w / max(1, h)
    mid_y = (t + b) // 2
    top_mass = int(m[t:mid_y, l:r].sum())
    bot_mass = int(m[mid_y:b, l:r].sum())
    top_ratio = top_mass / max(1, top_mass + bot_mass)
    return min(aspect, 1.5) + 2.0 * top_ratio


def orient_to_cap(im: Image.Image) -> tuple[Image.Image, int]:
    best_im = im
    best_angle = 0
    best_score = -1e9
    for angle in (0, 90, 180, 270):
        cand = im.rotate(angle, expand=True)
        score = _cap_score(cand)
        if score > best_score:
            best_score = score
            best_im = cand
            best_angle = angle
    return best_im, best_angle


def crop_and_frame(
    im: Image.Image,
    pad_factor: float = 1.25,
    mask_threshold: int = 55,
) -> Image.Image:
    """Aspect-matching crop centered on content center.

    Earlier approach (crop bbox → letterbox) left non-uniform side/top
    bars across tiles because each bbox had a different aspect ratio.
    Here we always cut a 4:3 window centered on the content centroid,
    sized so the content fills 1/pad_factor of the limiting dimension
    (default 80%). The content center always lands at the tile center,
    and the appliance occupies a consistent fraction of the tile.

    mask_threshold controls how bright a pixel must be to count as
    "appliance." 55 works for top-down bench shots (appliance is the
    only bright thing on black background). Front-view retainer shots
    need ~130 — the workbench's upper backdrop is a dim-but-still-above-55
    gradient that otherwise inflates the bbox.
    """
    m = _mask(im, threshold=mask_threshold)
    bb = _bbox(m)
    if bb is None:
        return im.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    l, t, r, b = bb
    cx = (l + r) / 2.0
    cy = (t + b) / 2.0
    cw = r - l
    ch = b - t

    target_aspect = TARGET_W / TARGET_H  # 4/3
    if cw / max(1, ch) >= target_aspect:
        crop_w = cw * pad_factor
        crop_h = crop_w / target_aspect
    else:
        crop_h = ch * pad_factor
        crop_w = crop_h * target_aspect

    crop_l = cx - crop_w / 2.0
    crop_t = cy - crop_h / 2.0
    crop_r = cx + crop_w / 2.0
    crop_b = cy + crop_h / 2.0

    canvas = Image.new(
        "RGB", (int(round(crop_w)), int(round(crop_h))), BG_COLOR
    )
    sw, sh = im.size
    src_l = int(max(0, crop_l))
    src_t = int(max(0, crop_t))
    src_r = int(min(sw, crop_r))
    src_b = int(min(sh, crop_b))
    if src_r > src_l and src_b > src_t:
        patch = im.crop((src_l, src_t, src_r, src_b))
        dst_l = int(round(src_l - crop_l))
        dst_t = int(round(src_t - crop_t))
        canvas.paste(patch, (dst_l, dst_t))

    return canvas.resize((TARGET_W, TARGET_H), Image.LANCZOS)


def process(src_path: Path, dst_path: Path, slug: str) -> dict:
    im = Image.open(src_path)
    im = ImageOps.exif_transpose(im).convert("RGB")

    if slug in FRONT_VIEW:
        angle = 0
        mode = "front"
        # Zoom in tighter for front-view photos — the source frames
        # often catch the edge of the workbench or a background seam,
        # so extra padding around the bbox pulls those ugly edges into
        # the tile. 1.08 keeps a thin margin without revealing them.
        pad_factor = 1.08
        # Higher threshold so the dim-but-not-black upper backdrop
        # doesn't get counted as appliance and bloat the bbox.
        mask_threshold = 130
    else:
        im, angle = orient_to_cap(im)
        mode = "cap"
        pad_factor = 1.25
        mask_threshold = 55

    if slug in FLIP_180:
        im = im.rotate(180, expand=True)
        angle = (angle + 180) % 360

    canvas = crop_and_frame(im, pad_factor=pad_factor, mask_threshold=mask_threshold)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst_path, "JPEG", quality=88, optimize=True)
    return {"mode": mode, "rot": angle}


def main() -> int:
    DST_PT.mkdir(parents=True, exist_ok=True)
    DST_IR.mkdir(parents=True, exist_ok=True)
    rows = []
    for stem, (cat, slug) in ROUTE.items():
        src = SRC / f"{stem}.jpg"
        if not src.exists():
            rows.append((cat, slug, "MISSING", {}))
            continue
        out_dir = DST_PT if cat == "pt" else DST_IR
        dst = out_dir / f"{slug}.jpg"
        info = process(src, dst, slug)
        rows.append((cat, slug, "ok", info))

    print(f"{'cat':<3} {'slug':<36} {'mode':>5} {'rot':>4}")
    print("-" * 55)
    for cat, slug, status, info in rows:
        if status == "MISSING":
            print(f"{cat:<3} {slug:<36} MISSING")
            continue
        print(f"{cat:<3} {slug:<36} {info['mode']:>5} {info['rot']:>3}°")
    return 0


if __name__ == "__main__":
    sys.exit(main())
