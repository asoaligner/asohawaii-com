"""Install Dentaurum sticker artwork into public/images/aso/colors/stickers/.

Run after extract-swatches.py — this overwrites the crop-based sticker
files for SKUs that have a clean Dentaurum source.

Mapping built by visually identifying each Dentaurum product image
against the ASO #41-#69 sticker catalog.
"""

import shutil
import os

RAW = r"C:\Users\asoha\asohawaii-website\scripts\dentaurum_raw"
OUT = r"C:\Users\asoha\asohawaii-website\public\images\aso\colors\stickers"

# ASO sticker id -> (Dentaurum SKU number, ASO slug). Verified by
# eyeballing each downloaded SKU image — alphabetical sort meant
# SKUs 32-37 don't follow the position I'd guessed from the mosaic.
MAPPING = {
    41: ("37", "beaver"),         # blue beaver with hammer
    42: ("19", "car"),
    43: ("01", "crocodile"),
    44: ("29", "devil"),
    45: ("13", "dinosaur"),
    46: ("34", "dolphin"),        # blue dolphin
    47: ("06", "dragon"),
    48: ("12", "duck"),
    49: ("10", "elephant"),
    50: ("07", "fish"),
    51: ("36", "football"),       # soccer ball
    52: ("09", "formula1"),
    53: ("02", "frog"),
    54: ("30", "graffiti"),
    55: ("11", "heart"),
    # 56 Hello Beaver — only available as multi-pack on Dentaurum, keep PDF crop
    57: ("35", "horse"),          # brown horse silhouette
    58: ("05", "ladybug"),
    59: ("14", "motorcycle"),
    60: ("45", "mouse"),          # gray mouse
    61: ("18", "mushroom"),
    62: ("04", "parrot"),
    # 63 Pink Pony — only available as multi-pack on Dentaurum, keep PDF crop
    64: ("27", "raven"),
    65: ("15", "snail"),
    66: ("31", "soccer-player"),
    67: ("28", "spider"),
    68: ("16", "teddy-bear"),
    69: ("46", "unicorn"),
}


def main():
    installed = 0
    for aso_id, (sku, slug) in MAPPING.items():
        src = os.path.join(RAW, f"{sku}.jpg")
        if not os.path.exists(src):
            print(f"  WARN: missing source for #{aso_id} {slug} (sku {sku})")
            continue
        dst = os.path.join(OUT, f"{aso_id:02d}-{slug}.jpg")
        shutil.copyfile(src, dst)
        installed += 1
    print(f"Installed {installed} Dentaurum sticker images. ")
    print(f"#56 Hello Beaver kept as PDF crop (not in Dentaurum SKU range).")


if __name__ == "__main__":
    main()
