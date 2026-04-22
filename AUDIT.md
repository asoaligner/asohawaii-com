# Site Audit — 2026-04-19 23:32 (HST)

Audit of ASO Hawaii Next.js site (`/` + `/about`, `/how-to-order`, `/faq`,
`/contact`, `/download`, `/get-a-quote`, `/new-products`, `/pick-up`,
`/product`, `/product/[slug]`). Reference: cached asohawaii.com HTML in
`%TEMP%/aso-pages/`.

## Summary
- 3 critical issues
- 7 medium issues
- 6 cosmetic issues

---

## Critical

### 1. Dev server `.next` build is corrupted — most routes return HTTP 500
**File:** `.next/` (build cache, not source)
**What:** 14 of 21 routes I curled (including `/`, `/product`, every
`/product/[slug]`, `/new-products`, `/get-a-quote`) return HTTP 500 with
`Error: Cannot find module './682.js'`. The require stack originates from
`.next\server\app\(original)\pick-up\page.js` — typical Next.js stale-chunk
symptom after a crash mid-HMR.
**Fix:** Stop the dev server, delete `.next/`, then `npm run dev`. Source
code itself compiles (the working routes — `/about`, `/how-to-order`,
`/faq`, `/contact`, `/download`, `/pick-up` — render fine).
**Evidence (live):**
```
500 /         500 /product          500 /new-products   500 /get-a-quote
500 /product/aso-aligner (and all 11 other product slugs)
```

### 2. Download page: PDF hrefs do not match their titles
**File:** `src/app/(original)/download/page.tsx:10-35`
**What:** The three download cards title themselves "Prescription Form",
"ASO ALIGNER® Prescription Form", and "Product Catalog" — but the `href`s
are `aso-hawaii-order-form.pdf`, `aso-hawaii-submission-instructions.pdf`,
and `aso-itero-easyrx-setup.pdf` respectively. Card #2 downloads
*submission instructions*, not an aligner Rx. Card #3 downloads the
*iTero/EasyRx setup guide*, not a product catalog. Only card #1 matches.
There is no aligner Rx PDF and no product-catalog PDF in `public/pdf/`
(only 3 files exist there).
**Fix:** Either (a) add the missing PDFs to `public/pdf/` and repoint
hrefs, or (b) rename the card titles to match the actual PDFs (Order
Form · Submission Instructions · iTero/EasyRx Setup Guide). Option (b)
mirrors what the real asohawaii.com exposes (3 generic "Download"
buttons). Also: the `filename` attribute on card #1 forces download as
`aso-hawaii-prescription-form.pdf` even though the underlying file is
`aso-hawaii-order-form.pdf` — a second inconsistency.

### 3. Hash anchors `/contact#invitation` and `/contact#general` don't exist
**File:** `src/app/(original)/contact/page.tsx` (IDs used elsewhere:
`src/components/Nav.tsx:230`, `src/components/HowToSubmit.tsx:59`,
`src/app/(original)/about/page.tsx:241`, `src/components/FloatingContact.tsx:6`)
**What:** The original contact page only defines `id="location"`,
`id="c-fn"`, `id="c-ln"`, `id="c-clinic"`, `id="c-email"`, `id="c-msg"`.
The nav "Request invitation" CTA, the home-page HowToSubmit CTA, the
floating contact bubble, and the About page's "Start sending cases"
button all jump to `#invitation` / `#general` which *do* exist on the
`supabase` variant of the contact page but NOT on the `(original)` one.
The links still load `/contact` but the hash is ignored.
**Fix:** Add `<section id="invitation">` wrapper around the main
contact form (currently around line 117) and `id="general"` on the
top hero block — or change all four `href="/contact#..."` callers
to plain `/contact`.

---

## Medium

### 4. `/faq`, `/contact`, `/get-a-quote`, `/pick-up`, `/new-products` product detail pages inherit the generic root `<title>`
**File:** `src/app/layout.tsx:49` (root) + missing `export const metadata`
in `src/app/(original)/{faq,contact,get-a-quote,pick-up}/page.tsx`
**What:** Curl-verified rendered titles:
- `/faq` → `ASO International Hawaii | Digital Case Submission with EasyRx`
- `/contact` → same
- `/pick-up` → same
These pages have no `metadata` export, so they fall back to the root
title. About/How-to-order/Download/New-products/Product catalog each
have proper overrides — these 4 (and /get-a-quote) don't. Also the
root `description` is in Japanese (`ASO International Hawaii の歯科矯正
ラボへ、EasyRx を通じて…`) which may not match the intended audience.
**Fix:** Add `export const metadata: Metadata = { title: "...", description: "..." }`
to each missing page (pattern from `/download/page.tsx`). Consider
translating the root description to English or localizing.

### 5. `FORMSPREE_ENDPOINT` is the placeholder — no form submissions will deliver
**File:** `src/data/config.ts:1-5`, `src/components/OriginalForm.tsx:78-84`
**What:** `NEXT_PUBLIC_FORMSPREE_ENDPOINT` env var is unset and
`.env.local` does not exist in the repo. `FORMSPREE_ENDPOINT` defaults
to `https://formspree.io/f/YOUR_FORM_ID`. Every contact / quote /
pick-up form POST will 404. A dev notice is shown above the form in
dev, but this is a production blocker.
**Fix:** Create `.env.local` with the real Formspree (or alternate)
endpoint before deploy.

### 6. Secondary email `asohawaii@hotmail.com` is outdated per the live site's how-to-order / faq / download sections
**File:** `src/app/(original)/contact/page.tsx:61,64`
**What:** The reference asohawaii.com **contact-us** page DOES still
list `asohawaii@hotmail.com` (so this is accurate for contact), BUT
the live how-to-order, faq, and download pages only use
`aso-digital@outlook.com`. Our contact page shows both addresses side
by side, which may confuse customers as to which to use. Asleep user
should confirm whether hotmail is still monitored.
**Fix:** If hotmail is legacy, remove it from contact/page.tsx:61-64
and promote `aso-digital@outlook.com` to the primary email card. If
both are valid, add a one-line label ("general inquiries" vs "digital
case submissions").

### 7. "Product Catalog" PDF download cannot download anything useful
**File:** `src/app/(original)/download/page.tsx:28-34`
**What:** (Part of Critical #2 but worth its own entry because the
name is displayed prominently as a customer resource.) Card claims
"Complete ASO International product catalog — every appliance line we
fabricate" but the actual downloaded file is `aso-itero-easyrx-setup.pdf`
(scanner setup guide). Customers expecting a catalogue will be
confused / mis-serviced.
**Fix:** Generate a real catalogue PDF, or re-title the card to
"iTero · EasyRx Setup Guide" and adjust description text accordingly.

### 8. `FeaturedProducts.tsx` home tile links go to bare `/product/` instead of a specific slug
**File:** `src/components/FeaturedProducts.tsx:51,118`
**What:** Two tiles on the home page link to `href="/product/"` (with
trailing slash and no slug), which lands on the catalog index rather
than the specific product the tile is about. Non-fatal (the catalog
still shows), but reduces CTR quality.
**Fix:** Pass the matching `/product/<slug>` per-tile. The data for
the tiles should already have a slug to reuse.

### 9. ASO ALIGNER® registered mark is used in `<h1>`s but the cached site uses plain "ASO ALIGNER"
**File:** `src/data/product-catalog.ts:266` (name), also printed in
the hero on `/product/aso-aligner`
**What:** Our site renders "ASO ALIGNER®" with the ® symbol. The
cached asohawaii.com page title is `ASO ALIGNER | ASO Hawaii
Orthodontic Lab` (no ®). Minor, but worth confirming the mark is
actually registered in the user's jurisdictions before displaying it
globally — displaying ® for an unregistered mark is problematic in
some US states.
**Fix:** Confirm registration status; drop the ® if not registered.

### 10. Root `<meta description>` content is Japanese
**File:** `src/app/layout.tsx:50-51`
**What:** The root layout's fallback description reads
`ASO International Hawaii の歯科矯正ラボへ、EasyRx を通じてケースを
デジタル送信。HIPAA 対応、全スキャナー対応、完全な症例履歴。150+ 医院が
利用中。`. Every page that doesn't override `metadata.description`
inherits this — so `/faq`, `/contact`, `/get-a-quote`, `/pick-up`
will have a Japanese meta description, which is inconsistent with the
English body copy and may hurt SEO for US search.
**Fix:** Translate to English (or leave JP if the target market is
Japan-first — confirm with user).

---

## Cosmetic

### 11. `productCatalog` advertises `tag: "press_type"` but `category: "splint"` — duplicate splint category
**File:** `src/data/product-catalog.ts:288,429`
**What:** Both "Flat Occlusal Splint" and "Press-Type Appliance"
use `category: "splint"`. The related-products section on either
product page will show the other. Probably fine, but they're fairly
different product lines (bruxism occlusal vs mouthguard/whitening).
**Fix:** Consider splitting press-type into its own category
("mouthguard") if you want more targeted cross-sell.

### 12. Three commented-out Hero slides reference missing image files
**File:** `src/components/Hero.tsx:19,21,26`
**What:** The commented entries reference
`/images/aso/hero-slides/left-02-aso-aligner.png`,
`left-04-flat-splint.png`, and `right-02-plate-expansion.jpg`. None
exist in `public/images/aso/hero-slides/` (only 6 slides are present:
left-01, left-03, left-04-occlusal-splint.webp, right-01, right-03,
right-04). Harmless while commented, but if re-enabled without
adding the files you'll get 404s on hero.
**Fix:** Either delete the commented lines or add the missing assets.

### 13. `flat-splint.png` vs `occlusal-splint.webp` naming drift
**File:** `src/components/Hero.tsx:21 (commented)` vs
`public/images/aso/hero-slides/left-04-occlusal-splint.webp`
**What:** The commented slide 04 references `left-04-flat-splint.png`
but the file on disk is `left-04-occlusal-splint.webp`. If hero is
ever rebuilt from the commented shape, the slot 04 will break.
**Fix:** Make the comment match the actual filename, or pick one
canonical name and reconcile.

### 14. `contact/page.tsx` has duplicated phone-number blocks
**File:** `src/app/(original)/contact/page.tsx:46-49,292-296`
**What:** The phone number `808-957-0111` is rendered twice on the
contact page (once in the "Phone" card up top, once in the location
card lower down). Not wrong, just redundant.
**Fix:** Keep both — the location block doubles as the footer address
card and the top block is the primary CTA. No action needed unless
you want to slim the page.

### 15. Press-Type Appliance items all use two recycled photos
**File:** `src/data/product-catalog.ts:444-505`
**What:** All 12 press-type variants point at only two images —
`4e762224e6fa4645a2d476ba747cffe8.png` (hard guard) and
`a761c50a86184fc0ac96b259bf65544b.png` (soft/hard laminate). The
mouthguards, whitening trays, and bleaching trays show the same
night-guard photo, which may confuse customers trying to distinguish
them visually.
**Fix:** Source per-variant photos (sports mouthguards, whitening
tray) from the reference gallery or a stock equivalent.

### 16. Download page `size` strings are not verified
**File:** `src/app/(original)/download/page.tsx:17,25,33`
**What:** Sizes hardcoded as `171 KB`, `226 KB`, `7.0 MB`. These
don't correspond to the actual file sizes in `public/pdf/` (I didn't
check byte-level but these exact sizes look suspicious when the
`href`s also don't match — see Critical #2). If the user fixes the
href mismatch, the sizes need to be regenerated.
**Fix:** Compute and update sizes from actual files.

---

## Notes (informational, not issues)

- Image integrity (Pass 1) is **clean** for everything in use. All
  46 `/images/...` refs in the source tree that aren't commented out
  resolve to real files. All 135 unique `e724a4_...` Wix IDs referenced
  in `src/` exist in `public/images/aso/wix/` (136 files on disk, 135
  referenced — one unused file is not worth flagging).

- Internal link sanity (Pass 3) is mostly clean. Every `/route` href
  in Nav, FAQ, Support, Hero CTAs, product tiles, etc. maps to an
  existing page — EXCEPT the missing `#invitation` / `#general`
  anchors flagged as Critical #3. External hrefs (`easyrxcloud.com`,
  `instagram.com/aso.orthodonticslab.honolulu`, Google Maps query)
  are well-formed.

- Content vs asohawaii.com (Pass 4):
  - **Phone/fax/address/hours:** ✅ Match across contact, about,
    support. `808-957-0111`, `808-957-0222`, `1441 Kapiolani Blvd
    #1112 Honolulu HI 96814`, `Mon–Fri 8:00 AM – 4:30 PM`.
  - **Emails:** `aso-digital@outlook.com` correct across 40+ call
    sites. `asohawaii@hotmail.com` correct on contact page per ref
    (flagged in Medium #6 only as a customer-clarity concern).
  - **About page:** Our copy covers Tokyo 1982 founding, 29 dental
    universities, ISO 13485, 50+ facilities, Manila/Silicon Valley
    expansion, and 2005 Hawaii establishment — all match ref.
  - **FAQ page:** All 8 questions from the reference are represented
    (turnaround 7–10 days, Oahu pickup 1-4pm, same-day before noon,
    EasyRx Rx submission, scanner STL types, rush service, appliance
    list, contact info). Our wording is more polished but semantically
    equivalent.
  - **How-to-order:** Ref lists `aso-digital@outlook.com` and
    `808-957-0111` — both present on our page. Scanner list
    (iTero / Medit Link / PrimeScan / Dexis / Shining 3D / 3Shape)
    matches.

- Instagram handle `aso.orthodonticslab.honolulu` used consistently
  (Nav, Support, contact page, footer).

- `out/` directory is present in repo root — looks like a stale
  static export. If you're deploying via `next export`, worth
  regenerating after the dev-server fix.

- Three `tmp-<uuid>.jpg` files at repo root
  (`tmp-980e652c...`, `tmp-bb4e0d03...`, `tmp-dc3aae19...`) —
  untracked scratch files, safe to delete.
