"""Extract individual color swatch + sticker images from the two
ASO color-chart PNGs into /public/images/aso/colors/{traditional,
glitter,neon,custom,stickers}/.

Calibration based on the actual rendered PNGs (1650x1275). The
script also writes a single mosaic preview to scripts/_mosaic.jpg
so all 60 outputs can be eyeballed in one read.
"""

from PIL import Image
import os

DOWNLOADS = r"C:\Users\asoha\Downloads"
PUBLIC = r"C:\Users\asoha\asohawaii-website\public\images\aso\colors"
PDF1 = os.path.join(DOWNLOADS, "acrylic-colors-traditional-glitter.png")
PDF2 = os.path.join(DOWNLOADS, "acrylic-colors-neon-stickers.png")

# ---- Tile geometry --------------------------------------------------
# Each photo tile holds the tooth-arch silhouette over black background.
# Width 220 / height 170 captures the arch without the caption text.
TILE_W = 220
TILE_H = 170

# Custom-example tiles (Dual Color, Color w/ Glitter, Neon Marble) are
# slightly taller/wider — they show the full arch at higher resolution.
CUSTOM_W = 230
CUSTOM_H = 175

# Sticker circles: radius covers most of the printed circle but
# stops just inside the caption text below it.
STICKER_R = 32

# ---- PDF1 grid (Traditional 3 cols + Glitter 2 cols, 4 rows) -------
# PDF1's traditional column 3 is wider apart than the others (the
# "Traditional" header sits over cols 1-2, pushing col 3 further out).
TRAD_X = [220, 475, 790]
GLIT_X = [1130, 1425]
ROWS_Y = [255, 515, 775, 1075]

TRAD_LAYOUT = [
    (1, "pink"),
    (2, "clear"),
    (3, "orange"),
    (4, "yellow"),
    (5, "green"),
    (6, "light-blue"),
    (16, "blue"),
    (17, "red"),
    (18, "black"),
    (19, "purple"),
    (20, "white"),
]
GLIT_LAYOUT = [
    (21, "blue-glitter"),
    (22, "silver-glitter"),
    (23, "aqua-glitter"),
    (24, "purple-glitter"),
    (25, "orange-glitter"),
    (26, "multi-glitter"),
    (27, "red-glitter"),
    (28, "gold-glitter"),
]

# ---- PDF2 grid -----------------------------------------------------
NEON_X = [220, 475, 730]
NEON_Y = [255, 515, 775]
NEON_LAYOUT = [
    (31, "neon-glow"),
    (32, "neon-pink"),
    (33, "neon-orange"),
    (34, "neon-red"),
    (35, "neon-blue"),
    (36, "neon-yellow"),
    (37, "neon-green"),
    (38, "neon-teal"),
    (39, "neon-purple"),
]

# Custom examples (skip the sticker example — that's redundant with the
# stickers grid below).
CUSTOM_TILES = [
    ("dual-color-example", 1130, 270),
    ("color-with-glitter-example", 1450, 270),
    ("neon-marble-example", 1130, 580),
]

# Sticker rows. Y values are the visual centre of the printed circle
# (the caption sits underneath, not inside). Row 2 + 3 are shifted
# left/up vs initial estimate after pixel inspection.
# X centres detected via colour-density peaks on the source PNG —
# more accurate than guessing because sticker spacing varies slightly
# row by row (the printer's typesetting wasn't perfectly uniform).
ROW1_Y = 905
ROW1_X = [956, 1055, 1157, 1259, 1364, 1437, 1535]
ROW2_Y = 1050
ROW2_X = [493, 611, 719, 827, 948, 1043, 1152, 1263, 1368, 1481, 1559]
ROW3_Y = 1185
ROW3_X = [494, 597, 702, 814, 933, 1029, 1147, 1243, 1352, 1456, 1551]

STICKER_LAYOUT = [
    (41, "beaver"),
    (42, "car"),
    (43, "crocodile"),
    (44, "devil"),
    (45, "dinosaur"),
    (46, "dolphin"),
    (47, "dragon"),
    (48, "duck"),
    (49, "elephant"),
    (50, "fish"),
    (51, "football"),
    (52, "formula1"),
    (53, "frog"),
    (54, "graffiti"),
    (55, "heart"),
    (56, "hello-beaver"),
    (57, "horse"),
    (58, "ladybug"),
    (59, "motorcycle"),
    (60, "mouse"),
    (61, "mushroom"),
    (62, "parrot"),
    (63, "pink-pony"),
    (64, "raven"),
    (65, "snail"),
    (66, "soccer-player"),
    (67, "spider"),
    (68, "teddy-bear"),
    (69, "unicorn"),
]

# ---- Crop helpers --------------------------------------------------


def crop_tile(img, cx, cy, w=TILE_W, h=TILE_H):
    left = cx - w // 2
    top = cy - h // 2
    return img.crop((left, top, left + w, top + h))


def crop_circle(img, cx, cy, r=STICKER_R):
    return img.crop((cx - r, cy - r, cx + r, cy + r))


def save_jpg(img, path, quality=82):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(path, "JPEG", quality=quality, optimize=True)


# ---- Extraction ----------------------------------------------------


def extract():
    if os.path.exists(PUBLIC):
        # Wipe previously generated swatches but preserve charts/.
        for sub in ["traditional", "glitter", "neon", "custom", "stickers"]:
            d = os.path.join(PUBLIC, sub)
            if os.path.isdir(d):
                for f in os.listdir(d):
                    os.remove(os.path.join(d, f))

    pdf1 = Image.open(PDF1).convert("RGB")
    pdf2 = Image.open(PDF2).convert("RGB")

    outputs = []

    # Traditional
    for i, (num, slug) in enumerate(TRAD_LAYOUT):
        cx = TRAD_X[i % 3]
        cy = ROWS_Y[i // 3]
        out = crop_tile(pdf1, cx, cy)
        path = os.path.join(PUBLIC, "traditional", f"{num:02d}-{slug}.jpg")
        save_jpg(out, path)
        outputs.append(("trad", num, slug, out))

    # Glitter
    for i, (num, slug) in enumerate(GLIT_LAYOUT):
        cx = GLIT_X[i % 2]
        cy = ROWS_Y[i // 2]
        out = crop_tile(pdf1, cx, cy)
        path = os.path.join(PUBLIC, "glitter", f"{num:02d}-{slug}.jpg")
        save_jpg(out, path)
        outputs.append(("glit", num, slug, out))

    # Neon
    for i, (num, slug) in enumerate(NEON_LAYOUT):
        cx = NEON_X[i % 3]
        cy = NEON_Y[i // 3]
        out = crop_tile(pdf2, cx, cy)
        path = os.path.join(PUBLIC, "neon", f"{num:02d}-{slug}.jpg")
        save_jpg(out, path)
        outputs.append(("neon", num, slug, out))

    # Custom
    for slug, cx, cy in CUSTOM_TILES:
        out = crop_tile(pdf2, cx, cy, w=CUSTOM_W, h=CUSTOM_H)
        path = os.path.join(PUBLIC, "custom", f"{slug}.jpg")
        save_jpg(out, path)
        outputs.append(("custom", 0, slug, out))

    # Stickers
    for i, (num, slug) in enumerate(STICKER_LAYOUT):
        if i < 7:
            cx, cy = ROW1_X[i], ROW1_Y
        elif i < 18:
            cx, cy = ROW2_X[i - 7], ROW2_Y
        else:
            cx, cy = ROW3_X[i - 18], ROW3_Y
        out = crop_circle(pdf2, cx, cy)
        path = os.path.join(PUBLIC, "stickers", f"{num:02d}-{slug}.jpg")
        save_jpg(out, path)
        outputs.append(("sticker", num, slug, out))

    return outputs


def build_mosaic(outputs):
    """Compose all 60 crops into one preview image so we can verify
    in a single look."""
    cell_w = 130
    cell_h = 130
    cols = 10
    rows = (len(outputs) + cols - 1) // cols
    pad = 6
    mosaic_w = cols * cell_w + pad * 2
    mosaic_h = rows * cell_h + pad * 2
    mosaic = Image.new("RGB", (mosaic_w, mosaic_h), (240, 240, 240))
    for idx, (kind, num, slug, img) in enumerate(outputs):
        thumb = img.copy()
        thumb.thumbnail((cell_w - 8, cell_h - 8))
        col = idx % cols
        row = idx // cols
        x = pad + col * cell_w + (cell_w - thumb.width) // 2
        y = pad + row * cell_h + (cell_h - thumb.height) // 2
        mosaic.paste(thumb, (x, y))
    out = r"C:\Users\asoha\asohawaii-website\scripts\_mosaic.jpg"
    mosaic.save(out, "JPEG", quality=80)
    print(f"mosaic written: {out} ({mosaic_w}x{mosaic_h})")


def main():
    outputs = extract()
    build_mosaic(outputs)
    print(f"Extracted {len(outputs)} swatches.")


if __name__ == "__main__":
    main()
