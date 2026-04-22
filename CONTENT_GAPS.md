# Content Gap Audit — 2026-04-20 19:18 HST

Audit of Next.js site (`http://localhost:3000`, `src/app/(original)/*`) vs live
`asohawaii.com`. For each gap I list:

- Where on asohawaii.com it exists (URL + context)
- Our equivalent today (page path + excerpt)
- Severity — **P0** (blocker: missing product/contact/legal/data integrity),
  **P1** (notable content gap), **P2** (minor polish)
- Concrete fix

`AUDIT.md` (prior audit, same repo) items are referenced rather than re-listed.
The three AUDIT.md "critical" items (stale `.next`, download-href mismatch,
`#invitation`/`#general` anchors) are still valid and NOT re-opened here.

---

## Summary
- **3 P0 gaps** (file/title mismatch integrity, missing Hard-Type splint photo
  confirmation, JP-language default meta description on 4 pages)
- **8 P1 gaps** (download PDF filename mismatches & missing catalog, per-item
  descriptions dropped, home trust tagline, item-26 placeholders, missing
  Dropbox link on quote form, Modified-Retainer item note, Instagram-label
  polish, 810 item rendering)
- **6 P2 gaps** (SEO polish on 4 pages, ref Japanese UI artifacts, 29-universities
  phrasing, "SNS" vs "Follow" label, sleep-apnea URL mismatch, empty 316 title)
- **Pages fully clean vs ref:** `/about`, `/how-to-order`, `/privacy-policy`,
  `/product` (catalog index), `/new-products`, `/product/aso-aligner`,
  `/product/band-appliance`, `/product/flat-occlusal-splint`,
  `/product/functional-appliances`, `/product/idb`,
  `/product/invisible-retainer`, `/product/lingual-retainer`,
  `/product/plate-expansion`, `/product/press-type-appliance`,
  `/product/sleep-apnea`, `/product/study-model`

---

## Gaps by page

### / (home)

#### P1: Home trust tagline missing
**Source:** `asohawaii.com` home, body — one-sentence trust line:
> "ASO Hawaii is a trusted orthodontic lab providing retainers, aligners, and
> appliances for dental professionals across Honolulu."

**Ours:** No equivalent sentence — our hero jumps from "Orthodontic Laboratory
Solutions." straight into the IOS scanner acceptance band and featured
products. Grep confirms the phrase "trusted orthodontic lab providing" is
absent from `src/`.

**Fix:** Add a one-line lede under the Hero (either in `Hero.tsx` as a sub-line
or as its own section before `IosAcceptanceBand`). Reuse the exact phrasing or
rework slightly — this doubles as on-page SEO for "Honolulu orthodontic lab".

#### P0: Japanese-language `<meta description>` on 4 English-content pages
**Source:** None — ref `<meta description>` is English everywhere.
**Ours:** `src/app/layout.tsx:50` root description is Japanese
(`ASO International Hawaii の歯科矯正ラボへ…`). Any page without its own
`export const metadata` inherits it. Confirmed via curl — these pages still
fall back to the JP description:
- `/` (home) → JP description
- `/faq` → JP description
- `/contact` → JP description (also title falls back)
- `/pick-up` → JP description (also title falls back)
- `/get-a-quote` → JP description (also title falls back)

**Fix:** Either (a) translate the root description to English (ref uses:
"Trusted orthodontic lab in Honolulu offering clear aligners, retainers,
splints, and premium digital appliances with fast turnaround and Japanese
precision."), OR (b) add per-page `export const metadata` to
`faq/page.tsx`, `contact/page.tsx`, `pick-up/page.tsx`, `get-a-quote/page.tsx`.
This overlaps with AUDIT.md #4 and #10 — both still open. Listed here as **P0**
because it directly harms SEO on 5 primary customer-facing pages in the US
market.

---

### /about

No content gaps. Our page fully covers Tokyo 1982 founding, 29 dental
universities, ISO 13485, 50+ facilities, Manila/Silicon Valley expansion,
2005 Hawaii establishment. Adds polish beyond the ref (stats tiles, timeline,
global offices block).

---

### /contact

#### P1: Instagram section label & secondary Dropbox link
**Source:** `asohawaii.com/contact-us` →
- Header label "SNS Follow us" above the Instagram icon
- Instagram link `@aso.orthodonticslab.honolulu`
- STL/ZIP upload in form

**Ours:** `/contact` →
- Our label is "Follow" / "Follow us on Instagram" (cleaner, not a gap)
- Instagram link present and correct
- STL/ZIP upload present
- **Added value on our side:** Dropbox upload link
  (`dropbox.com/request/qyzCwOz9KVlxBTerdIoU`) — the reference also links this
  URL from contact, and we preserve it.

**Fix:** None needed — we're ahead of ref here.

#### Known issues (NOT re-opened — see AUDIT.md):
- AUDIT #3: `#invitation` / `#general` anchors not wired
- AUDIT #6: `asohawaii@hotmail.com` may be legacy — awaiting user confirmation
- AUDIT #14: duplicate phone-number blocks (cosmetic)

---

### /download

#### P0: Card #3 "Product Catalog" is not a catalog — file mismatch (covers AUDIT #2, #7)
**Source:** `asohawaii.com/download` offers 3 PDFs. Live filenames (verified
via HTTP `Content-Disposition` HEAD):
1. `ASO Order sheet.pdf` — generic order form (matches our #1)
2. `ASO Order sheet for Aligners.pdf` — aligner-specific Rx (matches our #2 **title** but NOT our #2 file)
3. `general.pdf` — 6.9 MB reference PDF (matches our #3 **file** but NOT our #3 title)

**Ours:** `src/app/(original)/download/page.tsx:10-35`
1. Card "Prescription Form (Rx)" → `/pdf/aso-hawaii-order-form.pdf` ✓ matches ref #1
2. Card "ASO ALIGNER® Prescription Form" → `/pdf/aso-hawaii-submission-instructions.pdf` — this is actually the *submission instructions*, not an aligner Rx. **Wrong file.**
3. Card "Product Catalog" → `/pdf/aso-itero-easyrx-setup.pdf` — this is the iTero/EasyRx scanner setup guide (7 MB), not a product catalog. **Wrong file.**

Confirmed: `public/pdf/` contains only `aso-hawaii-order-form.pdf`,
`aso-hawaii-submission-instructions.pdf`, `aso-itero-easyrx-setup.pdf`,
plus `scanner-guides/`. No aligner Rx PDF. No catalog PDF.

**Fix (two options):**
- **(Recommended)** Match the reference exactly: download and host
  `ASO Order sheet for Aligners.pdf`
  (`https://www.asohawaii.com/_files/ugd/e724a4_a5420cdcc0804bb9a2f40b982b002fc0.pdf`)
  as `/pdf/aso-aligner-order-form.pdf`, and download `general.pdf`
  (`https://www.asohawaii.com/_files/ugd/e724a4_2779b06e639a4071855b9b3937126307.pdf`)
  — inspect its contents; if it's a catalog, keep the title; if not, rename
  card #3.
- **(Fallback)** Rename card #2 to "Submission Instructions" and card #3 to
  "iTero / EasyRx Setup Guide" (honest labels of what's actually there).

Also: `filename` attribute on card #1 forces download as
`aso-hawaii-prescription-form.pdf` even though the stored file is
`aso-hawaii-order-form.pdf`. Reconcile to one name.

#### P2: Hardcoded `size` strings not verified
See AUDIT #16 — sizes `171 KB`, `226 KB`, `7.0 MB` are hardcoded. The first two
are approximately correct (file sizes match), the third (`7.0 MB`) matches the
actual file size of `aso-itero-easyrx-setup.pdf`. If the files get replaced per
the fix above, regenerate sizes from disk.

---

### /faq

No content gaps. All 8 ref questions are represented semantically. Our
wording is more polished (e.g. ref says "What is your standard turnaround
time?" → we say "What is the typical turnaround time for ASO Hawaii
products?"). 8 Q&As both sides.

Metadata falls back to the JP description — covered under home P0 above.

---

### /get-a-quote

#### P1: Dropbox upload link missing on quote page (present on contact page)
**Source:** `asohawaii.com/get-a-quote` includes the same Dropbox upload
request URL (`dropbox.com/request/qyzCwOz9KVlxBTerdIoU`) in the form footer,
not just on `/contact-us`.
**Ours:** `src/app/(original)/get-a-quote/page.tsx` has no Dropbox mention.
Our form only has the in-form `<input type="file">`.

**Fix:** Import `DROPBOX_UPLOAD_URL` from `contact/page.tsx` (or move it to
`src/data/config.ts`) and add a secondary "Or upload via Dropbox" link below
the file input on the quote form. Same pattern we already use on contact.

Metadata inherits the JP description (covered in home P0).

---

### /how-to-order

No content gaps. Covers digital submissions (all 6 scanners — iTero, Medit
Link, PrimeScan, Dexis, Shining 3D, 3Shape), the 3Shape-via-EasyRx caveat,
stone model acceptance (Type III), the Oahu afternoon pickup, and the
`aso-digital@outlook.com` / `808-957-0111` contact. Download-instructions
button goes to `/download` on both sides.

---

### /new-products

No content gaps. All 15 items on ref gallery are present + we include a 16th
(`HARMONY` — advanced lingual bracket system, polished extension, not a ref
gap). Reference Wix `totalItemsCount:16`, our tile count matches.

One nit: the ref Wix data has one "Sleep Apnea & Snoring Appliances" tile
that isn't really a new product (it's a category callout). We sensibly don't
replicate that tile. No action.

---

### /pick-up

No content gaps. Covers afternoon-only pickup, same-day-by-noon policy,
warning to call 808-957-0111 for same-day after 12pm. Form fields include
practice name, phone, address, pick-up date.

Polish wins vs ref:
- Ref typo "Phone Nuber" — we say "Phone Number"
- Ref page title "Get a Quate" on the /get-a-quote page — we say "Get a
  quote" (typo on the live site itself)

Metadata inherits the JP description (covered in home P0).

---

### /product (catalog index)

No content gaps. All 15 product tiles present. Tiles we have that ref does
not render as clickable (ref shows them as labels only):
- "New Product" (→ `/new-products`) — ours links, ref doesn't
- "Flipper/Immediate Denture" — ref shows label; we have a tile w/ blurb

Category labels match ref: New Product, Plate Type Retainer, Plate Expansion,
Band Appliance, ASO ALIGNER, Occlusal Splint, Lingual Retainer, Invisible
Retainer, Mouth Guard/Night Guard (we name it "Press-Type Appliance"), Study
Model, Digital Print-Only Service, Sleep Apnea & Snoring Appliances, IDB,
Flipper/Immediate Denture, Functional Appliances.

---

### /product/aso-aligner

No content gaps. Covers mouthpiece-type description, applicable cases
(relapse, MTM 3-3, mild crowding ≤4 mm), inapplicable cases (extractions,
Angle II/III, skeletal, open bite), Soft/Medium/Hard materials and wear
times, 1-step/3-step/5-step packages. Semantic match to ref with stronger
polish.

Note: AUDIT #9 — `®` symbol usage on "ASO ALIGNER®" flagged as needing
registration confirmation. Not re-opened here.

---

### /product/band-appliance

No content gaps. 26 variants rendered (25 parsed from Wix SSR + 1 `extraItem`
"310 Quad Helix with Sheath"). Ref `totalItemsCount:26` confirms our count.

One silent fix already baked in: ref only preloads 25 items in SSR; the 26th
tile ("310 Quad Helix with Sheath") was added as an `extraItem` in
`product-catalog.ts:256-263` using an image hash fetched from the item
detail page. Listed as a known-good addition, not a gap.

---

### /product/flat-occlusal-splint

No content gaps. All 3 variants (Hard Type, Hard-and-Soft Type, NTI) present
with correct notes (3D-printed BPA-free / soft inner hard outer / NTI anterior
contact). 2 mm default thickness mentioned. Canine guidance call-out present.
Ref doesn't have a Wix gallery for this slug (`totalItemsCount` not found);
we manually enumerated items which matches.

---

### /product/functional-appliances

#### P1: Item 26 placeholder needs real content
**Source:** Ref Wix `totalItemsCount:26` but SSR preloads only 25 tiles.
The 26th is not visible without pagination.
**Ours:** `src/data/product-catalog.ts:674-681` has a placeholder entry:
```
{ name: "502 Oral Appliance (Hard Type)",
  note: "Placeholder — Wix SSR only preloads 25/26. Confirm actual name...",
  image: "/images/aso/wix/e724a4_ff7ef089fce94ed08423e9daa724eca4.jpg" }
```
**Fix:** User needs to open `asohawaii.com/functional-appliances`, click the
last tile in the gallery to reveal the `pgid=` URL, and either confirm the
502 name or send the real title/image hash. Same pattern as the already-fixed
band-appliance 310 entry.

Note: our name guess "502 Oral Appliance (Hard Type)" is semi-plausible (we
have 501 Soft Type) but not confirmed by the source.

---

### /product/idb

No content gaps. 6 items (201 Set Up Lingual / 202 Positioning with Chart /
203 CRC / 204 Hybrid Core / 207 Kommon Base / 208 IDB Labial) all present.
Ref `totalItemsCount:6` matches.

Note: Wix item description "Cosmetically preferred treatment since brackets
are set on the lingual side of teeth" is copied onto items 201-204 in the Wix
data but we put it into the page-level description. This is better — not a
gap.

---

### /product/invisible-retainer

No content gaps. All materials (Standard Co-Polyester, C+ High-Strength,
LuxCreo Direct-Print 0.6/0.8/1.0/1.5/2.0 mm, Zendura A/FLX/VIVA), options
(Pontic, Scallop Cut), and CR3 package promo ($100 for 3 sets) all present.
Ref Wix `totalItemsCount` not found for this slug (no gallery).

---

### /product/lingual-retainer

#### P1: Item #810 display renders code without item name (tile glitch)
**Source:** Ref Wix title "810 1.Spring Retainer (above) 2.New Type Spring
Retainer (below)" and the plate-type page shows this as two sub-variants.
**Ours:** On `/product/plate-type-retainer-expansion`, the rendered tile
correctly shows the number "810" and name "1.Spring Retainer (above) 2.New
Type Spring Retainer (below)" on separate lines — actually OK. My earlier
suspicion was a false positive (dedup in my text-extract). Verified
rendered HTML contains both strings.

No real gap here — removing from P1 list. (Kept as a dropped false-positive
note so future audits don't re-flag.)

#### P2: Item metadata "description" field on Modified Retainer not shown
**Source:** Ref Wix gallery data for `plate-type-retainer-expansion` has
`"description":"setup available for tooth #7 to #10"` on the Modified
Retainer item — this renders as a small caption under the tile on the live
site.
**Ours:** Our catalog's `Modified Retainer` item has no `note` field; the
phrase *does* appear in the page-level bullets ("Modified Retainer setup for
#7–#10"), so the content is not lost — just not co-located with the tile.
**Fix (optional polish):** Add `note: "setup available for tooth #7 to #10"`
to the Modified Retainer item in `product-catalog.ts` — drop the duplicate
bullet or keep both. Parser only captures `name` currently; description
field is discarded.

Applies to `/product/plate-type-retainer-expansion`.

No gaps on `/product/lingual-retainer` itself — the 7 parsed items + the
3D Metal Lingual Retainer `extraItem` cover the full ref lineup (812 Fixed,
814 FSW, 816 Metal Fixed, Braided Wire, Flossable, 0.9mm, Fixed with Easy
Bond, plus 3D Metal) — 8 total.

---

### /product/plate-expansion

No content gaps. 13 items (325–337) all present. Ref `totalItemsCount:13`
matches our parse. Ref item 325 has a description "1. Without labial bow /
2. With labial bow" stored in Wix — same content available to our parser,
currently dropped (same limitation as Modified Retainer above). Same fix:
capture `description` in `scripts/parse-aso-products.mjs` (or whatever tool
built `aso-product-items.json`), propagate to the item `note`.

---

### /product/plate-type-retainer-expansion

See the `/product/lingual-retainer` entry above — Modified Retainer note
(P2). Otherwise no gaps. All 13 items present.

---

### /product/press-type-appliance

No content gaps (text-wise). All 12 variants enumerated in
`product-catalog.ts:444-505` — Hard/Soft/Hard-and-Soft night guards across 5
thicknesses, sports mouthguards 3.0/5.0 mm, whitening + bleaching trays. Ref
describes the same lineup in flat prose form.

#### P1: All 12 press-type items reuse only 2 photos (AUDIT #15)
Not re-opened — see AUDIT #15.

---

### /product/sleep-apnea

No content gaps. Reference doesn't have a `/sleep-apnea` page per se — the
content lives at `asohawaii.com/services-9` (confirmed via curl). We have 7
appliances (SomnoDent Flex/Avant/HAE/Fusion, EMA, Snore Guard Fixed, Snore
Guard Separate) — ref `/services-9` enumerates 6 (missing HAE); we're ahead.

#### P2: Sleep-apnea URL path mismatch vs reference
**Source:** Ref URL is `asohawaii.com/services-9`.
**Ours:** `/product/sleep-apnea`.
**Fix:** Our path is better (SEO-friendly, semantic). Only note because
if user emails customers with the old `services-9` URL, it will 404 on the
new site. Add a redirect: `next.config.js` rewrite or a simple
`src/app/services-9/route.ts` that 301s to `/product/sleep-apnea`.

---

### /product/study-model

No content gaps. All 3 items (101 Study Models, 103 RAIKA Plastic Models,
107 Miniature Models) present. Ref `totalItemsCount:3` matches.

---

## Cross-cutting / global

### Japanese-language content
Confirmed via live check: `asohawaii.com/jp` → 404, `asohawaii.com/ja` → 404,
no `hreflang` alternates in the ref home `<head>`. There's one `lang="en"`
declaration. The ref site does NOT have a separate Japanese version — only
the few `マイウォレット` / `メニュー（NEW）` strings that appear are default
Wix member-widget labels that the site owner never translated.

**Action required:** None. We do not need to replicate a JP translation.

One downstream effect: our root `<meta description>` is in Japanese (see
home P0 above) — this is an inconsistency within our codebase that SHOULD
be fixed.

### SEO & metadata — pages still using the JP description fallback
(P0 above — summarized here.)

| Route | Our title | Our meta description |
|---|---|---|
| `/` | ASO International Hawaii \| Digital Case Submission with EasyRx | JP fallback |
| `/faq` | JP fallback title | JP fallback |
| `/contact` | JP fallback title | JP fallback |
| `/pick-up` | JP fallback title | JP fallback |
| `/get-a-quote` | JP fallback title | JP fallback |

All other pages (`/about`, `/download`, `/how-to-order`, `/new-products`,
`/product`, every `/product/<slug>`, `/privacy-policy`) have proper English
title + description via their own `export const metadata`. Reference site has
English meta on all pages, so this is a widening gap on our side only.

### Downloads available on reference, missing or mislabeled on ours
Covered in `/download` P0 above. Concrete URLs for re-download:
1. `https://www.asohawaii.com/_files/ugd/e724a4_9483bc8b00d74acd9603ccec3cc0d9d8.pdf` → "ASO Order sheet.pdf" — matches our #1
2. `https://www.asohawaii.com/_files/ugd/e724a4_a5420cdcc0804bb9a2f40b982b002fc0.pdf` → "ASO Order sheet for Aligners.pdf" — our #2 is a DIFFERENT file
3. `https://www.asohawaii.com/_files/ugd/e724a4_2779b06e639a4071855b9b3937126307.pdf` → "general.pdf" — our #3 is a DIFFERENT file (bigger, iTero setup)

### External links inventory (ref → ours)
- `easyrxcloud.com` login — present both sides
- `instagram.com/aso.orthodonticslab.honolulu` — present both sides
- `dropbox.com/request/qyzCwOz9KVlxBTerdIoU` — present on contact both sides; **missing on our /get-a-quote** (P1 above)
- Google Maps link — we use `maps.google.com/?q=...`; ref embeds a Wix Google
  Map widget. Our link-out approach is lighter-weight and functionally
  equivalent. Not a gap.
- No `3shape.com/communicate`, `3shapecommunicate.com`, or other scanner-
  vendor links on either side. Ref and ours both state 3Shape must use
  EasyRx/email.

### Contact info — verified match across all pages
- Phone `808-957-0111` — present both sides, all pages
- Fax `808-957-0222` — present both sides
- Address `1441 Kapiolani Blvd #1112 Honolulu HI 96814` — present both sides
- Email `aso-digital@outlook.com` — primary, present both sides
- Email `asohawaii@hotmail.com` — only on ref `/contact-us` and our `/contact`
  (see AUDIT #6 for clarification request)
- Hours `Mon–Fri 8:00 AM – 4:30 PM · Closed Federal Holidays` — present both sides

### Wix per-item image descriptions (P2 polish)
The scraper behind `aso-product-items.json` captures each item's `title` and
`mediaUrl` but drops the `description` field. Ref uses this sparingly:
- `plate-type-retainer-expansion` / Modified Retainer → "setup available for tooth #7 to #10"
- `plate-expansion` / 325 Expansion → "1. Without labial bow / 2. With labial bow"
- `functional-appliances` / 403 Bionator I → "Orthopedic Corrector Ⅰ"
- `functional-appliances` / 404 Bionator II → "Orthopedic Corrector Ⅱ"
- `functional-appliances` / 402 EOA → "Elastic Open Activator"
- `functional-appliances` / 501 Oral Appliance → "For SAS"

All six captions provide extra clinical context not carried in our tile `note`
fields. **Fix:** extend the scrape and add `note` for these six items in
`product-catalog.ts`. Low-effort polish.

---

## Notes (informational)

- Reference `asohawaii.com` has an `/services-9` page (= Sleep Apnea) which is
  neither linked from its main `/product` catalog nor follows its URL-slug
  pattern — Wix auto-generated slug. Our semantic `/product/sleep-apnea` is
  better but we should add a 301 redirect to preserve any inbound links
  (P2 above).

- AUDIT.md items NOT re-opened but still relevant to any deploy readiness:
  - #1 stale `.next` build cache (dev-env only)
  - #2 / #7 download PDF hrefs (incorporated into /download P0)
  - #3 `#invitation` / `#general` anchors
  - #4 / #10 per-page metadata — subsumed into home P0
  - #5 FORMSPREE placeholder env var (prod blocker)
  - #6 `asohawaii@hotmail.com` legacy question
  - #8 `/product/` trailing-slash links on home
  - #9 ® registration confirmation
  - #11 press-type / splint category duplication
  - #12 / #13 commented hero slide file-drift
  - #14 duplicate phone card (cosmetic)
  - #15 press-type tiles re-using 2 photos
  - #16 PDF size strings to verify

- Reference image count per page (Wix-wide dedupe) is much higher than our
  curated set, but most of the extras are Wix chrome (logos, avatars, member
  widget glyphs). Our curated 136-image subset under `public/images/aso/wix/`
  covers every tile and hero used in content. No missing product photos — just
  some variants reuse (see AUDIT #15).

- The live `/get-a-quote` ref page has a typo in the `<title>` ("Get a Quate")
  — we get this right. Ours is a polish win, not a gap.

- Ref home has a "Consultation About Our Products" card that invites calling;
  ours has a similar "Consultation about our products / Contact us ·
  808-957-0111" card on the home. Semantic match.

- Ref about says "29 dental universities" and "50 domestic and international
  facilities." Our about says "29" and "50+" — effectively the same, and our
  phrasing is slightly stronger.
