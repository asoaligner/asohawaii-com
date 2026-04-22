Hero rotation videos for the Home page — 2-column full-screen split layout.

┌─────────────────────────────────────────────────────────────────────┐
│  QUALITY REQUIREMENTS                                                │
├─────────────────────────────────────────────────────────────────────┤
│  • Resolution: 1920×1080 minimum (4K preferred)                     │
│  • Codec:      H.264 MP4, web-optimized (yuv420p, +faststart)       │
│  • Bitrate:    4–8 Mbps (balance quality vs. page weight)           │
│  • Duration:   8–15 seconds per clip (short loopable segments)      │
│  • Audio:      remove completely (autoplay requires muted anyway)   │
│  • File size:  target ≤ 6 MB per clip (keeps Hero snappy)           │
│                                                                      │
│  Skip any footage that is blurry, shaky, poorly lit, or low-res.    │
│  A crisp 8-second clip beats a 20-second clip that looks soft.      │
└─────────────────────────────────────────────────────────────────────┘

LEFT PANEL  — removable products (clear/aesthetic lineup):
  hero-left-01.mp4   Invisible Retainer
  hero-left-02.mp4   ASO ALIGNER
  hero-left-03.mp4   Sleep Apnea Appliance
  hero-left-04.mp4   Flat Occlusal Splint

RIGHT PANEL — fixed / expansion products (structural lineup):
  hero-right-01.mp4  MARPE / MSE
  hero-right-02.mp4  Plate Expansion
  hero-right-03.mp4  Band Appliance
  hero-right-04.mp4  3D Metal Lingual Retainer

Ffmpeg recipe for a web-ready clip (example):
  ffmpeg -i input.mov \
    -vf "scale=1920:-2,format=yuv420p" \
    -c:v libx264 -preset slow -crf 22 \
    -movflags +faststart -an \
    -t 12 \
    hero-left-01.mp4

ACTIVATING VIDEO MODE
────────────────────────────────────────────────────────────────────────
While this folder has no .mp4 files, the Hero falls back to a 5-second
cross-fading image slideshow sourced from /public/images/aso/. When you
drop clips in, open src/components/Hero.tsx and uncomment the entries
inside LEFT_VIDEOS and RIGHT_VIDEOS. That's it — the panel auto-
detects video mode and switches over.
