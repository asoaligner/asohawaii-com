import { pageImages } from "@/data/aso-images";
import { pageItems } from "@/data/aso-product-items";

export type CatalogItem = {
  code?: string;
  name: string;
  note?: string;
  /** Full path under /public when the item has its own photo */
  image?: string;
  /** Per-item lead time override. Used by ASO ALIGNER where each
   *  package tier has its own production time; for other products
   *  the parent ProductTile.leadTime applies to all items. */
  leadTime?: "Approx. 1 week" | "Approx. 2 weeks";
};

export type ProductTile = {
  name: string;
  tag: string;
  slug: string | null;
  blurb: string;
  description: string;
  category: string;
  bullets: string[];
  /** Primary image used for tiles / hero */
  heroImage: string;
  /** Additional gallery images (from asohawaii.com scrape) */
  gallery: string[];
  /** Numbered sub-items / specific SKUs sourced from asohawaii.com */
  items?: CatalogItem[];
  /** Optional promotional callout */
  promo?: { label: string; body: string };
  /** Approximate production lead time. Shown in Hero badge,
   *  Specifications section, and on each catalog grid card.
   *  ASO ALIGNER omits this (per-plan lead times in
   *  ASO_ALIGNER_PLANS instead). */
  leadTime?: "Approx. 1 week" | "Approx. 2 weeks";
};

function imagesFor(
  slug: string | null,
  fallback: string
): { heroImage: string; gallery: string[] } {
  if (!slug) return { heroImage: fallback, gallery: [] };
  const list = pageImages(slug);
  if (list.length === 0) return { heroImage: fallback, gallery: [] };
  return { heroImage: list[0], gallery: list.slice(0, 8) };
}

type Meta = {
  name: string;
  tag: string;
  slug: string | null;
  blurb: string;
  description: string;
  category: string;
  bullets: string[];
  fallback: string;
  leadTime?: "Approx. 1 week" | "Approx. 2 weeks";
  /**
   * Fallback catalog items used ONLY when the Wix-gallery parser returns
   * no items for this slug (e.g. aso-aligner, flat-occlusal-splint).
   * When the parser returns items, `items` is ignored to avoid duplicates.
   */
  items?: CatalogItem[];
  /**
   * Extra items appended AFTER the parsed items. Use this to add newer
   * products (e.g. the "3D Metal Lingual Retainer" new-product tile that
   * isn't in the old Lingual Retainer Wix gallery).
   */
  extraItems?: CatalogItem[];
  promo?: { label: string; body: string };
  /**
   * Curated hero image override. When set, wins over parsed items[0] and
   * pageImages()[0]. Use this to avoid text logos / labeled diagrams that
   * the Wix scrape happens to include as the first gallery image.
   */
  heroImageOverride?: string;
};

/**
 * Splits a product title into (code, name) when it starts with a numeric
 * code like "801 Retainer" or "301 (a) Lingual Arch". Names without a
 * leading numeric stay intact with code = undefined.
 */
function splitCode(fullName: string): { code?: string; name: string } {
  const m = /^(\d{3,4})\s+(.+)$/.exec(fullName);
  if (m) return { code: m[1], name: m[2] };
  return { name: fullName };
}

/** Per-item captions that live on asohawaii.com's Wix `description` field.
 * The parser only captures `title` + `mediaUrl`, so these notes are added
 * by hand. Keyed by `${slug}::${full item name}` (name as stored in the
 * parsed JSON, before splitCode strips the numeric prefix). */
const itemNoteOverrides: Record<string, string> = {
  "plate-type-retainer-expansion::Modified Retainer":
    "Setup available for tooth #7 to #10.",
  "plate-expansion::325 Expansion (Transverse)":
    "Available with or without labial bow.",
  "functional-appliances::403 Bionator I (to Open)": "Orthopedic Corrector I.",
  "functional-appliances::404 Bionator II (to Close)":
    "Orthopedic Corrector II.",
  "functional-appliances::402 EOA": "Elastic Open Activator.",
  "functional-appliances::501 Oral Appliance (Soft Type)":
    "For sleep apnea syndrome (SAS).",
};

/** Build CatalogItem[] for a slug from the parsed gallery data (with photos). */
function catalogItemsFor(slug: string | null): CatalogItem[] | undefined {
  if (!slug) return undefined;
  const parsed = pageItems(slug);
  if (parsed.length === 0) return undefined;

  // Merge any accidental duplicates (Wix sometimes shows the same code twice
  // for multi-photo items). We keep the first occurrence per name.
  const seen = new Set<string>();
  const merged = parsed.filter((p) => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged.map((p) => {
    const { code, name } = splitCode(p.name);
    const note = itemNoteOverrides[`${slug}::${p.name}`];
    return {
      code,
      name,
      image: `/images/aso/wix/${p.image}`,
      ...(note ? { note } : {}),
    };
  });
}

function build(meta: Meta): ProductTile {
  const { heroImage, gallery } = imagesFor(meta.slug, meta.fallback);
  // Catalog item resolution:
  //   - If the scraper parsed items for this slug, use THOSE (never merge
  //     meta.items — that would duplicate the same SKU list).
  //   - Then append any meta.extraItems for net-new additions.
  //   - If no parsed items exist, fall back to meta.items only.
  const parsed = catalogItemsFor(meta.slug);
  const items =
    parsed && parsed.length > 0
      ? meta.extraItems && meta.extraItems.length > 0
        ? [...parsed, ...meta.extraItems]
        : parsed
      : meta.items;
  // Priority: explicit override > first parsed item photo > pageImages[0] > fallback
  const preferredHero =
    meta.heroImageOverride ??
    (items && items.length > 0 && items[0].image
      ? items[0].image
      : heroImage);
  const preferredGallery =
    items && items.length > 0
      ? items
          .slice(1, 7)
          .map((it) => it.image)
          .filter((p): p is string => !!p)
      : gallery;
  return {
    name: meta.name,
    tag: meta.tag,
    slug: meta.slug,
    blurb: meta.blurb,
    description: meta.description,
    category: meta.category,
    bullets: meta.bullets,
    heroImage: preferredHero,
    gallery: preferredGallery,
    items,
    promo: meta.promo,
    leadTime: meta.leadTime,
  };
}

export const productCatalog: ProductTile[] = [
  build({
    name: "New Product",
    tag: "new_products",
    slug: "new-products",
    blurb: "The latest launches from ASO — sleep, expanders, printed aligners.",
    description:
      "A rolling showcase of our newest appliances: sleep apnea devices (SomnoDent Flex / Avant / HAE / Fusion), mini-implant expansion (MSE / MARPE / Keyless), direct-printed aligners and retainers (LuxCreo, Zendura A), and 3D metal lingual retainers.",
    category: "launches",
    bullets: [
      "SomnoDent Flex / Avant / HAE / Fusion",
      "MSE / MARPE / Keyless expanders",
      "LuxCreo direct-print aligners & retainers",
      "Zendura A / FLX / VIVA retainers",
      "3D metal lingual retainers",
      "SHU-Lider · SYMPHONY",
    ],
    fallback: "/images/aso/product-3.jpg",
  }),
  build({
    name: "Plate Type Retainer",
    tag: "plate_type_retainer",
    slug: "plate-type-retainer-expansion",
    leadTime: "Approx. 2 weeks",
    blurb:
      "Acrylic Hawley-style retainers with stainless steel retention wires.",
    description:
      "Classic Hawley-family retainers with acrylic bases and stainless-steel clasps. Modified setup available for tooth #7 – #10. Over a dozen numbered configurations to suit retention, close, open, and soldered variants.",
    category: "retainer",
    bullets: [
      "Hawley · Wrap-Around (Begg) · QCM · Spring · Clear Bow",
      "C Clasps, Adams Clasps, rests, labial bow variants",
      "Acrylic base — custom tints available",
      "Modified Retainer setup for #7–#10",
      "Fabricated from STL or stone models",
    ],
    fallback: "/images/aso/product-1.jpg",
    items: [
      { code: "801", name: "Retainer" },
      { code: "802", name: "Retainer" },
      { code: "803", name: "Hawley (Close)" },
      {
        code: "804",
        name: "Wrap-Around (Begg)",
        note: "Soldered C Clasps",
      },
      {
        code: "805",
        name: "Hawley",
        note: "Soldered C Clasps",
      },
      {
        code: "806",
        name: "Wrap-Around (Begg)",
        note: "Soldered Adams Clasps",
      },
      { code: "807", name: "QCM Retainer" },
      { code: "808", name: "Hawley with Rests" },
      { code: "809", name: "Metal Retainer" },
      { code: "810", name: "Spring Retainer", note: "Classic or New Type" },
      { code: "818", name: "Clear Bow Retainer" },
      {
        code: "901",
        name: "Slim Retainer",
        note: "Soldered C Clasps (U)",
      },
    ],
  }),
  build({
    name: "Plate Expansion",
    tag: "plate_expansion",
    slug: "plate-expansion",
    leadTime: "Approx. 2 weeks",
    blurb:
      "Removable acrylic expansion appliances with midline expansion screws.",
    description:
      "Slow, controlled transverse and sagittal arch development. Thirteen activation modes across transverse, fan (upper/lower), labial, distal, sagittal (upper/lower), Y-type, piston spring, and traction-screw variants.",
    category: "expander",
    bullets: [
      "Transverse · Fan (Upper/Lower) · Labial · Distal",
      "Sagittal Appliance — Upper + Lower variants",
      "Y Type · Piston Spring",
      "Traction Screw — Upper / Lower / Anterior",
      "Optional labial bow · patient self-activation",
    ],
    fallback: "/images/aso/product-4.jpg",
  }),
  build({
    name: "Band Appliance",
    tag: "band_appliance",
    slug: "band-appliance",
    leadTime: "Approx. 2 weeks",
    blurb:
      "Fixed banded appliances — space maintainers, lingual arch, Nance, TPA.",
    description:
      "Fixed orthodontic appliances banded to molars — band-and-loop space maintainers, lingual arches, Nance, TPA, Quad Helix, Bi Helix, Porter, rapid expansion (Hyrax / Haas / Fan / Bulldozer), Crozats, GMD, Lip Bumper, Pendulum, CLEA, Distal Jet, and MSE / MARPE / Keyless Expander. 26 variants.",
    category: "fixed",
    bullets: [
      "MSE / MARPE · Keyless Expander (featured)",
      "Lingual Arch — a / b / c / d variants",
      "Nance · TPA · Quad Helix · Bi Helix · Porter",
      "Rapid Expansion: Hyrax · Haas · Fan · Bulldozer",
      "Crozats · GMD · Lip Bumper · Pendulum · CLEA",
      "26 appliance variants, solder-reinforced",
    ],
    fallback: "/images/aso/product-3.jpg",
    // 26th item is paginated in Wix SSR (totalItemsCount:26 but only 25
    // preloaded). The missing tile is 310 Quad Helix with Sheath — user
    // confirmed it via the item-detail URL pgid, image fetched from the
    // item page (hash 3d184221...).
    extraItems: [
      {
        name: "310 Quad Helix with Sheath",
        note:
          "Quad helix with bilateral sheaths — removable main arch for reactivation without rebanding.",
        image: "/images/aso/wix/e724a4_a069557342b34bcf898fc7acf9cc5715.jpg",
      },
    ],
  }),
  build({
    name: "ASO ALIGNER",
    tag: "aso_aligner",
    slug: "aso-aligner",
    blurb:
      "ASO's signature digital aligner system — five tiers from minor refinement to comprehensive treatment.",
    description:
      "A transparent, thin, aesthetically pleasing mouthpiece-type appliance — available in Basic, Advance, 3in1, 5in1, and Complete by LuxCreo packages. Designed in ASO's CAD pipeline and the first fully systemized clear aligner solution in Japan (2005).",
    category: "aligner",
    bullets: [
      "Soft · Medium · Hard materials (0.5 / 0.6 / 0.8 mm)",
      "Five package tiers: Basic / Advance / 3in1 / 5in1 / Complete by LuxCreo",
      "Wear time: Soft/Medium 140–200 hrs (7–10 days)",
      "Hard wear time: ~250 hrs (~2 weeks)",
      "Ideal: relapse, MTM (mainly 3–3), mild crowding ≤4 mm",
      "Comprehensive option available with Complete by LuxCreo",
      "Not recommended: extraction cases, Angle II/III, skeletal, open bite",
    ],
    fallback: "/images/aso/aso-aligner-package.png",
    // ASO ALIGNER uses an intro/brochure layout — the product-detail page
    // branches on this slug. Hero is the actual retail packaging photo
    // (Soft + Hard pouches visible, AsoAligner DIGITAL branding printed).
    heroImageOverride: "/images/aso/aso-aligner-package.png",
    items: [
      {
        code: "BASIC",
        name: "Basic",
        note:
          "Soft + Hard. Entry-level package for minor relapse / mild MTM cases.",
        image: "/images/aso/aso-aligner-package.png",
        leadTime: "Approx. 1 week",
      },
      {
        code: "ADVANCE",
        name: "Advance",
        note:
          "Soft + Medium + Hard. Mid-tier — broader movement scope, additional refinement.",
        image: "/images/aso/aso-aligner-package.png",
        leadTime: "Approx. 1 week",
      },
      {
        code: "3IN1",
        name: "3in1",
        note:
          "Three-step package — most common, recommended starting tier.",
        image: "/images/aso/aso-aligner-package.png",
        leadTime: "Approx. 2 weeks",
      },
      {
        code: "5IN1",
        name: "5in1",
        note:
          "Five-step package — for complex cases. LuxCreo direct-print.",
        image: "/images/aso/aso-aligner-package.png",
        leadTime: "Approx. 2 weeks",
      },
      {
        code: "COMPLETE",
        name: "Complete by LuxCreo",
        note:
          "Full comprehensive treatment with unlimited refinements. Quote required.",
        image: "/images/aso/aso-aligner-package.png",
        leadTime: "Approx. 2 weeks",
      },
    ],
  }),
  build({
    name: "Flat Occlusal Splint",
    tag: "occlusal_splint",
    slug: "flat-occlusal-splint",
    leadTime: "Approx. 2 weeks",
    blurb: "Bruxism guards, occlusal splints, NTI, and flat-plane deprogrammers.",
    description:
      "Standard 2 mm thickness with custom options available. Each splint mounted on an articulator. Canine guidance available on request. Ideal for protecting implants and prosthetic restorations.",
    category: "splint",
    bullets: [
      "Hard Type — 3D-printed, BPA-free",
      "Hard-and-Soft Type — soft inner / hard outer for sensitive patients",
      "NTI — anti-clench / migraine prevention (anterior-only contact)",
      "Standard 2 mm thickness, custom available (≥ 2 mm)",
      "Optional canine guidance on request",
      "Protects implants & prosthetic restorations",
    ],
    fallback: "/images/aso/product-3.jpg",
    // Use the clean U-arch Hard Type photo as the category hero. The labeled
    // "Soft inner / Hard outer" diagram is reserved for the Hard-and-Soft
    // Type item card where that explanation belongs.
    heroImageOverride:
      "/images/aso/wix/e724a4_74890f8965394826b4dbc0d21bffd9b7.webp",
    items: [
      {
        name: "Hard Type",
        note: "3D-printed · BPA-free · durable and precise fit",
        // U-shaped hard acrylic arch — matches the asohawaii.com Hard Type photo.
        image: "/images/aso/wix/e724a4_74890f8965394826b4dbc0d21bffd9b7.webp",
      },
      {
        name: "Hard-and-Soft Type",
        note: "Soft inner, hard outer — for sensitive patients",
        image: "/images/aso/wix/e724a4_a761c50a86184fc0ac96b259bf65544b.png",
      },
      {
        name: "NTI (Nociceptive Trigeminal Inhibition)",
        note: "Anterior-only contact to prevent clenching + migraines",
        image: "/images/aso/wix/e724a4_4e762224e6fa4645a2d476ba747cffe8.png",
      },
    ],
  }),
  build({
    name: "Lingual Retainer",
    tag: "lingual_retainer",
    slug: "lingual-retainer",
    leadTime: "Approx. 2 weeks",
    blurb: "Bonded lingual retainers for long-term post-treatment retention.",
    description:
      "Stainless steel and 3D-printed metal lingual retainers bonded to the palatal/lingual surface of the anterior teeth. Braided, flossable, and FSW variants — designed from your intraoral scan.",
    category: "retainer",
    bullets: [
      "Fixed · FSW · Metal Fixed",
      "Braided wire (twist wire)",
      "Flossable type",
      "0.9 mm Fixed with Easy Bond",
      "3D-printed metal option available",
    ],
    fallback: "/images/aso/product-3.jpg",
    // Use the 3D Metal Lingual Retainer hero on home / catalog tiles — it's
    // the flagship product for this line and visually cleaner than the
    // bonded-wire gallery photos.
    heroImageOverride:
      "/images/aso/wix/e724a4_93c8cf01becb4c9aafbec0535ba8dd8a.jpg",
    // extraItems are appended AFTER the 7 parsed Wix-gallery items so the
    // lingual-retainer page shows the scraped lineup + this newer product.
    extraItems: [
      {
        name: "3D Metal Lingual Retainer",
        note:
          "CAD-designed, laser-sintered metal retainer with superior fit. Segmented palatal wire from digital scan.",
        image: "/images/aso/wix/e724a4_93c8cf01becb4c9aafbec0535ba8dd8a.jpg",
      },
    ],
  }),
  build({
    name: "Invisible Retainer",
    tag: "invisible_retainer",
    slug: "invisible-retainer",
    leadTime: "Approx. 1 week",
    blurb: "Thermoformed & direct-print clear retainers.",
    description:
      "Standard Co-Polyester through premium Zendura VIVA. Direct-printed LuxCreo available in five gauges. Optional pontics and scallop-cut finish.",
    category: "retainer",
    bullets: [
      "Standard Co-Polyester · C+ High-Strength",
      "LuxCreo Direct-Print (0.6 / 0.8 / 1.0 / 1.5 / 2.0 mm)",
      "Zendura A — single-layer TPU",
      "Zendura FLX — 3-layer with shape-memory core",
      "Zendura VIVA — 150% torque retention vs. FLX",
      "Optional pontic / scallop-cut finish",
    ],
    fallback: "/images/aso/product-1.jpg",
    promo: {
      label: "CR3 Package",
      body: "3 sets for $100 — ask us for details.",
    },
    heroImageOverride:
      "/images/aso/invisible-retainer/standard-co-polyester-alt.jpg",
    items: [
      {
        name: "Standard Co-Polyester",
        note: "1.0 mm · thermoformed clear",
        image: "/images/aso/invisible-retainer/standard-co-polyester-alt.jpg",
      },
      {
        name: "C+ High-Strength",
        note: "1.0 mm · reinforced co-polyester",
        image: "/images/aso/invisible-retainer/c-plus-high-strength.jpg",
      },
      {
        name: "LuxCreo Direct-Print",
        note: "0.6 / 0.8 / 1.0 / 1.5 / 2.0 mm · 3D-printed resin",
        image: "/images/aso/invisible-retainer/direct-print-luxcreo.jpg",
        // Direct-print resin runs longer than the thermoformed SKUs —
        // overrides the product-level "Approx. 1 week" so the due-date
        // calendar blocks anything earlier than 2 weeks out. The SKU
        // row renders a "2-week lead time" badge off this field.
        leadTime: "Approx. 2 weeks",
      },
      {
        name: "Zendura A",
        note: "0.625 / 0.76 / 1.0 mm · single-layer TPU",
        image: "/images/aso/invisible-retainer/zendura-a.jpg",
      },
      {
        name: "Invisible Retainer with Pontic",
        note: "Tooth-colored pontic filled into the retainer for single-tooth gaps",
        image: "/images/aso/invisible-retainer/with-pontic.jpg",
      },
    ],
  }),
  build({
    name: "Press-Type Appliance",
    tag: "press_type",
    slug: "press-type-appliance",
    leadTime: "Approx. 1 week",
    blurb: "Custom-fit mouthguards, bite splints, sports guards, and bleaching trays.",
    description:
      "Press-formed appliances for bruxism protection, sports safety, and at-home whitening. Night guards in Hard, Soft, and Hard-and-Soft constructions across five thicknesses. Sports mouthguards in 3.0 / 5.0 mm with strap + color options. Whitening and bleaching trays fabricated from your Rx.",
    category: "splint",
    bullets: [
      "Hard Night Guard — 1.5 / 2.0 mm",
      "Hard-and-Soft — 2.0 / 3.0 / 3.5 / 4.0 mm",
      "Soft Night Guard — 2.0 / 3.0 mm",
      "Sports Mouthguard — 3.0 / 5.0 mm (strap + colors)",
      "Whitening Trays · Bleaching Trays",
    ],
    fallback: "/images/aso/product-3.jpg",
    heroImageOverride:
      "/images/aso/press-type/hard-soft-night-guard-3.0mm.jpg",
    items: [
      {
        name: "Hard Night Guard — 1.5 mm",
        note: "PETG pressed, low-profile bruxism protection",
        image: "/images/aso/press-type/hard-night-guard-1.5mm.jpg",
      },
      {
        name: "Hard Night Guard — 2.0 mm",
        note: "Standard thickness hard guard",
        image: "/images/aso/press-type/hard-night-guard-2.0mm.jpg",
      },
      {
        name: "Hard-and-Soft Night Guard — 2.0 mm",
        note: "Soft inner · hard outer",
        image: "/images/aso/press-type/hard-soft-night-guard-2.0mm.jpg",
      },
      {
        name: "Hard-and-Soft Night Guard — 3.0 mm",
        note: "Mid-thickness for moderate bruxers",
        image: "/images/aso/press-type/hard-soft-night-guard-3.0mm.jpg",
      },
      {
        name: "Hard-and-Soft Night Guard — 3.5 mm",
        note: "Thicker lamination for heavy grinders",
        image: "/images/aso/press-type/hard-soft-night-guard-3.5mm.jpg",
      },
      {
        name: "Hard-and-Soft Night Guard — 4.0 mm",
        note: "Maximum protection dual-laminate",
        image: "/images/aso/press-type/hard-soft-night-guard-4.0mm.jpg",
      },
      {
        name: "Soft Night Guard — 2.0 mm",
        note: "Flexible EVA for sensitive patients",
        image: "/images/aso/press-type/soft-night-guard-2.0mm.jpg",
      },
      {
        name: "Soft Night Guard — 3.0 mm",
        note: "Thicker soft EVA",
        image: "/images/aso/press-type/soft-night-guard-3.0mm.jpg",
      },
      {
        name: "Sports Mouthguard — 3.0 mm",
        note: "With strap and color options",
        image: "/images/aso/press-type/sports-mouthguard-3.0mm.jpg",
      },
      {
        name: "Sports Mouthguard — 5.0 mm",
        note: "Heavy-duty with strap and color options",
        image: "/images/aso/press-type/sports-mouthguard-5.0mm.jpg",
      },
      {
        name: "Bleaching Tray",
        note: "Custom-fit for professional bleaching or at-home whitening gel",
        image: "/images/aso/press-type/bleaching-tray.jpg",
      },
    ],
  }),
  build({
    name: "Study Model",
    tag: "study_model",
    slug: "study-model",
    leadTime: "Approx. 2 weeks",
    blurb: "Printed or traditional study models from your scans or impressions.",
    description:
      "Diagnostic study models fabricated from intraoral scans (3D-printed) or traditional stone pour-ups from impressions. Includes RAIKA plastic models and miniature diagnostic models.",
    category: "model",
    bullets: [
      "101 Study Models",
      "103 RAIKA plastic models",
      "107 Miniature Models",
      "Trimmed, labeled, articulated",
      "Archived digitally for reprint",
    ],
    fallback: "/images/aso/product-3.jpg",
    items: [
      { code: "101", name: "Study Models" },
      { code: "103", name: "Plastic Models", note: "RAIKA" },
      { code: "107", name: "Miniature Models" },
    ],
  }),
  build({
    name: "Digital Print-Only Service",
    tag: "digital_print",
    slug: "digital-print-only-service",
    leadTime: "Approx. 1 week",
    blurb: "Send STL → receive printed model. Print-only service for your lab.",
    description:
      "Lab-to-lab service: send us an STL/PLY and we'll run it on our calibrated SLA printers. Great for practices without in-house printing capacity.",
    category: "model",
    bullets: [
      "SLA resin printing",
      "Your design, our printer",
      "Multiple resin options",
      "Per-print pricing on quote",
    ],
    fallback: "/images/aso/product-3.jpg",
    heroImageOverride:
      "/images/aso/wix/e724a4_5b8d1aec1f5e4ea7b61b14c03fc9b96c.png",
    items: [
      {
        name: "with Palatal",
        note: "Full upper-arch model including the palate — best for retention/registration cases.",
        image: "/images/aso/wix/e724a4_5b8d1aec1f5e4ea7b61b14c03fc9b96c.png",
      },
      {
        name: "Horse Shoe",
        note: "Horseshoe model (no palate) — saves resin and print time when palate isn't needed.",
        image: "/images/aso/wix/e724a4_5b8d1aec1f5e4ea7b61b14c03fc9b96c.png",
      },
    ],
  }),
  build({
    name: "Sleep Apnea & Snoring Appliances",
    tag: "sleep_apnea",
    slug: "sleep-apnea",
    leadTime: "Approx. 2 weeks",
    blurb: "MAD, tongue-retaining, and telescoping sleep appliances.",
    description:
      "A range of custom-made oral appliances designed to help manage snoring and obstructive sleep apnea. Each device is fabricated to fit the patient precisely and selected based on clinical needs — balancing comfort, stability, and controlled mandibular advancement.",
    category: "sleep",
    bullets: [
      "SomnoDent Flex — adjustable mandibular advancement",
      "SomnoDent Avant — fin-coupling design",
      "SomnoDent HAE — Herbst-style element",
      "SomnoDent Fusion — dual-laminate w/ hard occlusal",
      "EMA — interchangeable elastic straps",
      "Snore Guard (Fixed & Separate types)",
    ],
    fallback: "/images/aso/product-2.jpg",
    // heroImageOverride removed — previously reused the homepage hero-slide,
    // making Sleep Apnea look identical on /, /product/, and /product/sleep-apnea/.
    // Falls through to items[0].image (dedicated SomnoDent Flex photo).
    items: [
      {
        name: "SomnoDent Flex",
        note:
          "Custom oral sleep appliance with a built-in adjustment screw for precise mandibular advancement, optimal airway support, and patient comfort.",
        image: "/images/aso/wix/e724a4_76fb08407abd470d8a3c571f051615b8.png",
      },
      {
        name: "Snore Guard Fixed",
        note:
          "Custom-made oral appliance that reduces snoring by maintaining a fixed mandibular position. Simple, non-adjustable, stable.",
        image: "/images/aso/wix/e724a4_3690bd2c2fe84a41954262bc7f237ea9.jpg",
      },
      {
        name: "Snore Guard (Separate Type)",
        note:
          "Upper and lower appliances connected with elastics, gently advancing the lower jaw while allowing natural jaw movement.",
        image: "/images/aso/wix/e724a4_3bb937ffd80e4123bd15f644f01f1a67.jpg",
      },
      {
        name: "EMA",
        note:
          "Custom oral sleep appliance with interchangeable elastic straps, allowing easy incremental mandibular advancement.",
        image: "/images/aso/wix/e724a4_a4a45caa785843bf91c3a9bb1cf73767.png",
      },
      {
        name: "SomnoDent Avant",
        note:
          "Innovative fin-coupling design allows natural jaw movement while maintaining effective mandibular advancement.",
        image: "/images/aso/wix/e724a4_4db1add57fbf4808a5d1c315f6c950f3.jpg",
      },
      {
        name: "SomnoDent Fusion",
        note:
          "Rigid acrylic design with midline adjustment screw for precise, stable mandibular advancement.",
        image: "/images/aso/wix/e724a4_0183e18246234931bf68dabf3e38b007.png",
      },
      {
        name: "SomnoDent HAE",
        note:
          "Herbst-style element for precise titration of mandibular position.",
        image: "/images/aso/wix/e724a4_52b68fb97ecc47f5b24e14d4fab6f496.jpg",
      },
    ],
  }),
  build({
    name: "IDB",
    tag: "idb",
    slug: "idb",
    leadTime: "Approx. 2 weeks",
    blurb: "Indirect Bonding trays — bracket placement from your treatment plan.",
    description:
      "Indirect Bonding (IDB) trays fabricated from your digital treatment plan. Bracket positions locked in 3D, trays printed for chairside bonding. Lingual and labial options — cosmetically preferred treatment since brackets can be set on the lingual side of teeth.",
    category: "aligner",
    bullets: [
      "Set Up (Lingual)",
      "Positioning with Chart",
      "CRC · Hybrid Core · Kommon Base",
      "IDB (Labial) for traditional bonding",
      "Cuts chair-time for bonding visits",
    ],
    fallback: "/images/aso/product-3.jpg",
    // Hero uses the 208 IDB (Labial) photo — the "SHOWN" label on the page
    // hero updates automatically. Previously first-parsed was Set Up
    // (Lingual), the articulator photo; user prefers the Labial tray image.
    heroImageOverride:
      "/images/aso/wix/e724a4_fee6e10ee23f43509c855318d13b36a8.png",
    items: [
      { code: "201", name: "Set Up (Lingual)" },
      { code: "202", name: "Positioning with Chart" },
      { code: "203", name: "CRC" },
      { code: "204", name: "Hybrid Core" },
      { code: "207", name: "Kommon Base" },
      { code: "208", name: "IDB (Labial)" },
    ],
  }),
  build({
    name: "Flipper / Immediate Denture",
    tag: "flipper",
    slug: "flipper-immediate-denture",
    leadTime: "Approx. 2 weeks",
    blurb: "Esthetic acrylic flippers and immediate dentures for interim use.",
    description:
      "Interim removable partials and flippers for missing anterior teeth. Useful as esthetic placeholders during implant healing, or as a transitional appliance while implants integrate.",
    category: "removable",
    bullets: [
      "Acrylic base, tooth-colored teeth",
      "Single-tooth or multi-unit flippers",
      "Fabricated from STL or impressions",
      "Rush service available",
    ],
    fallback: "/images/aso/product-3.jpg",
    heroImageOverride:
      "/images/aso/wix/e724a4_066c0c324f934d8998e5fcd71bed29ab.jpg",
    items: [
      {
        name: "Flipper",
        note: "Single-tooth or small multi-unit acrylic flipper — quick interim replacement.",
        image: "/images/aso/wix/e724a4_066c0c324f934d8998e5fcd71bed29ab.jpg",
      },
      {
        name: "Immediate Denture",
        note: "Immediate-placement denture delivered at the time of extractions for seamless healing.",
        image: "/images/aso/wix/e724a4_066c0c324f934d8998e5fcd71bed29ab.jpg",
      },
      {
        name: "Full Denture",
        note: "Full upper / lower acrylic denture (conventional, processed after healing).",
        image: "/images/aso/wix/e724a4_066c0c324f934d8998e5fcd71bed29ab.jpg",
      },
    ],
  }),
  build({
    name: "Functional Appliances",
    tag: "functional_appliances",
    slug: "functional-appliances",
    leadTime: "Approx. 2 weeks",
    blurb: "Twin-blocks, Bionators, Frankels, Bimlers — functional therapy.",
    description:
      "Removable and fixed functional appliances for skeletal correction in growing patients — 25 variants across Activator, Bionator, Bimler, Frankel, Twin Block, Herbst, Muh, Biobloc Stages I–IV, and Vestibular Appliance. Designed and fabricated from your Rx.",
    category: "functional",
    bullets: [
      "Activator (FKO) · EOA · Muh · Herbst",
      "Bionator I / II / III — Orthopedic Correctors",
      "Bimler A · B · C",
      "Frankel II / III / IV · Twin Block · BJA",
      "Biobloc Stage I – IV · Vestibular Appliance",
      "26 functional variants in total",
    ],
    fallback: "/images/aso/product-3.jpg",
    // 26th item is paginated in Wix SSR (totalItemsCount:26, only 25 in
    // preload). User confirmed via pgid URL: "406 Balters". Image fetched
    // from the item-detail page (hash bdf760937c2f4e75ba07d6141d01cdb2).
    extraItems: [
      {
        code: "406",
        name: "Balters",
        note:
          "Balters Bionator-family functional appliance for Class II correction in growing patients.",
        image: "/images/aso/wix/e724a4_bdf760937c2f4e75ba07d6141d01cdb2.jpg",
      },
    ],
  }),
];

/**
 * Curated "Related products" shown at the bottom of each product detail
 * page. Keyed by product slug, values are the slugs to surface. Falls
 * back to same-category products when a slug is not in this map.
 *
 * Most product categories have only 1–2 siblings, so the plain category
 * filter alone leaves several pages with 0 or 1 related tile. This map
 * reaches across categories based on clinical affinity (e.g. aligners
 * surface IDB + retainers rather than each other alone).
 */
export const RELATED_BY_SLUG: Record<string, string[]> = {
  "plate-type-retainer-expansion": [
    "invisible-retainer",
    "lingual-retainer",
    "plate-expansion",
  ],
  "plate-expansion": [
    "band-appliance",
    "functional-appliances",
    "plate-type-retainer-expansion",
  ],
  "band-appliance": [
    "plate-expansion",
    "functional-appliances",
    "lingual-retainer",
  ],
  "aso-aligner": ["idb", "invisible-retainer", "functional-appliances"],
  "flat-occlusal-splint": [
    "press-type-appliance",
    "sleep-apnea",
    "study-model",
  ],
  "lingual-retainer": [
    "invisible-retainer",
    "plate-type-retainer-expansion",
    "idb",
  ],
  "invisible-retainer": [
    "lingual-retainer",
    "plate-type-retainer-expansion",
    "aso-aligner",
  ],
  "press-type-appliance": [
    "flat-occlusal-splint",
    "sleep-apnea",
    "invisible-retainer",
  ],
  "study-model": ["idb", "flat-occlusal-splint", "press-type-appliance"],
  "sleep-apnea": [
    "flat-occlusal-splint",
    "press-type-appliance",
    "functional-appliances",
  ],
  idb: ["aso-aligner", "invisible-retainer", "study-model"],
  "functional-appliances": [
    "plate-expansion",
    "band-appliance",
    "aso-aligner",
  ],
};

export function findProductBySlug(slug: string): ProductTile | undefined {
  return productCatalog.find((p) => p.slug === slug);
}

export function slugList(): string[] {
  return productCatalog
    .map((p) => p.slug)
    .filter((s): s is string => s !== null);
}

export function productDetailSlugs(): string[] {
  return slugList().filter((s) => s !== "new-products");
}
