import { company } from "@/data/content";

export { company };

export const nav = {
  home: { label: "Home", href: "/supabase/" },
  products: { label: "Products", href: "/supabase/product/" },
  about: { label: "About", href: "/supabase/about/" },
  howItWorks: { label: "How it works", href: "/supabase/#how-to" },
  faq: { label: "FAQ", href: "/supabase/#faq" },
  contact: { label: "Contact", href: "/supabase/contact/" },
};

export const primaryNavLinks = [
  nav.products,
  nav.about,
  nav.howItWorks,
  nav.contact,
];

export const brand = {
  lockup: "aso_hawaii",
  tagline: "Orthodontic Lab · Honolulu · Digital-first",
};

/* ---------- HOME ---------- */

export const homeHero = {
  eyebrow: "The digital-first orthodontic lab in Hawaii",
  headlineLead: "Submit cases to",
  headlineAccent: "ASO Hawaii",
  headlineTail: "digitally — zero paper, zero friction.",
  subhead:
    "We run on EasyRx. Every scan, prescription, and note flows directly from your chairside scanner to our lab — HIPAA-compliant, fully traceable, same-day onboarding.",
  primaryCta: "Request invitation",
  secondaryCta: "See how it works",
  stats: [
    { k: "150+", v: "practices_onboarded" },
    { k: "HIPAA", v: "end_to_end_encryption" },
    { k: "6", v: "scanner_integrations" },
    { k: "< 1 day", v: "avg_setup_time" },
  ],
};

export const homeBenefits = [
  {
    tag: "01 / reliability",
    title: "Nothing gets lost.",
    body:
      "Every case, scan, and note lives in one secure thread — traceable from submission through delivery. No lost faxes. No missing attachments. No \"we never received that.\"",
  },
  {
    tag: "02 / compliance",
    title: "HIPAA compliant by design.",
    body:
      "End-to-end encrypted transmission, role-based access, and a full audit trail. Your patient data stays protected at every step of the case.",
  },
  {
    tag: "03 / visibility",
    title: "Full case history at a glance.",
    body:
      "Every prescription, scan, and message on a single timeline. Review past cases, reorder retainers, and clone submissions in seconds — without re-typing anything.",
  },
];

/* ---------- PRODUCTS ---------- */

export const productsHero = {
  eyebrow: "What we build",
  headlineLead: "Lab products, engineered for",
  headlineAccent: "digital workflow.",
  subhead:
    "Retainers, aligners, and appliances delivered from digital scans — no analogue impressions, no shipping delays, no surprises.",
};

export const productCategories = [
  {
    tag: "retainers",
    title: "Orthodontic retainers",
    body:
      "Essix, Hawley, Vivera-style clear retainers. Precision-milled from your intraoral scans. Most cases ship within 3–5 business days of submission.",
    bullets: [
      "Clear thermoformed retainers",
      "Hawley acrylic + wire retainers",
      "Duplicate retainers from scan history",
    ],
    status: "standard",
  },
  {
    tag: "aligners",
    title: "In-office clear aligners",
    body:
      "Lab-fabricated aligner sets for minor corrections, relapse, and retention refinements. Digital treatment plans reviewed by our CAD technicians.",
    bullets: [
      "Single-arch and full-arch sets",
      "Up to 20 stages per case",
      "Staging and attachment templates included",
    ],
    status: "standard",
  },
  {
    tag: "night_guards",
    title: "Night guards & splints",
    body:
      "Bruxism guards, occlusal splints, and deprogrammers. Hard, soft, and dual-laminate constructions sized directly from digital bite records.",
    bullets: [
      "Hard acrylic, soft, and dual-laminate",
      "Flat-plane or anterior deprogrammer",
      "Adjustable thickness on request",
    ],
    status: "standard",
  },
  {
    tag: "sleep_apnea",
    title: "Sleep apnea appliances",
    body:
      "Custom-made oral appliances designed to help manage snoring and mild-to-moderate obstructive sleep apnea. Multiple adjustable designs available.",
    bullets: [
      "Mandibular advancement devices (MAD)",
      "Tongue-retaining designs",
      "Telescoping & elastic mechanisms",
    ],
    status: "rx_required",
  },
  {
    tag: "space_maintainers",
    title: "Space maintainers",
    body:
      "Fixed and removable space maintainers for pediatric orthodontic cases. Band-and-loop, lingual arch, Nance, and transpalatal designs.",
    bullets: [
      "Band-and-loop",
      "Lingual arch / Nance / TPA",
      "Removable acrylic with finger-springs",
    ],
    status: "standard",
  },
  {
    tag: "custom",
    title: "Custom orthodontic appliances",
    body:
      "Habit breakers, expanders, positioners, and custom designs from your treatment plan. Our CAD team will work with your prescription.",
    bullets: [
      "Palatal expanders (RPE, slow)",
      "Habit appliances (thumb, tongue)",
      "Positioners and custom sets",
    ],
    status: "custom",
  },
];

export const productMaterials = [
  {
    tag: "thermoplastics",
    title: "Aligner & retainer materials",
    body:
      "Dual-laminate Essix, Vivera-grade PET-G, and EVA-blend sheets. Multiple gauges for different clinical requirements.",
  },
  {
    tag: "acrylics",
    title: "Orthodontic acrylics",
    body:
      "Heat-cure and cold-cure PMMA. Clear, tooth-colored, and custom tints available for Hawley bases and sleep appliances.",
  },
  {
    tag: "wires",
    title: "Stainless & beta-titanium wires",
    body:
      "Round and rectangular stainless steel, beta-titanium, and NiTi wires for retainer clasps, bows, and springs.",
  },
  {
    tag: "milling",
    title: "CAD/CAM milling",
    body:
      "5-axis milling for occlusal splints and hard appliances. Direct from your STL/PLY exports — no impression pour-up required.",
  },
];

/* ---------- ABOUT ---------- */

export const aboutHero = {
  eyebrow: "Our thesis",
  headlineLead: "Honolulu's",
  headlineAccent: "digital-first",
  headlineTail: "orthodontic lab.",
  subhead:
    "We rebuilt how cases move between practice and lab. No faxed Rx forms, no PVS impressions in boxes, no guessing whether your case arrived. Digital in, digital out, every time.",
};

export const aboutPillars = [
  {
    tag: "01 / digital_in",
    title: "Every case starts as data.",
    body:
      "Intraoral scans from any major scanner, prescriptions in EasyRx, case photos inline. Nothing is re-keyed. Nothing is re-scanned.",
  },
  {
    tag: "02 / cad_cam",
    title: "Engineered in CAD, milled or printed in-house.",
    body:
      "STL/PLY exports flow into our CAD pipeline. Our technicians design appliances digitally, then fabricate on calibrated mills and SLA printers.",
  },
  {
    tag: "03 / digital_out",
    title: "Traceable delivery, every case.",
    body:
      "Status visible in EasyRx from submission to shipment. Our couriers handle Honolulu pickup & delivery; mainland ships UPS/FedEx tracked.",
  },
];

export const aboutNumbers = [
  { k: "150+", v: "practices_served" },
  { k: "1441", v: "kapiolani_blvd" },
  { k: "5 days", v: "typical_turnaround" },
  { k: "HIPAA", v: "compliance_posture" },
];

export const aboutStory = [
  {
    year: "Founded",
    title: "Built for a digital-first island workflow.",
    body:
      "ASO International Hawaii was founded to serve orthodontic practices across the Hawaiian Islands and the Pacific. We chose digital as the default from day one — because shipping impressions across an ocean is slow and fragile.",
  },
  {
    year: "Today",
    title: "150+ practices. One shared digital pipeline.",
    body:
      "We've onboarded over 150 practices onto EasyRx. Every case is encrypted, traceable, and reviewable. Our team handles retainers, aligners, sleep appliances, and custom orthodontic work — scanner-agnostic.",
  },
  {
    year: "Tomorrow",
    title: "AI-assisted CAD, continuous integrations.",
    body:
      "We're expanding CAD/CAM capacity and integrating with emerging scanners and practice-management systems. Our goal: every practice in Hawaii on a fully digital lab pipeline by default.",
  },
];

/* ---------- CONTACT ---------- */

export const contactHero = {
  eyebrow: "Get in touch",
  headlineLead: "Let's get your practice",
  headlineAccent: "live on EasyRx.",
  subhead:
    "Three ways to reach us: invitation request for new practices, pick-up scheduling, or a general message for anything else.",
};

export const contactChannels = [
  {
    tag: "new_practice",
    title: "Request EasyRx invitation",
    body:
      "Not yet on EasyRx? Tell us about your practice and we'll send a secure invitation — typically same business day.",
    cta: "Start invitation",
    href: "/supabase/contact/#invitation",
  },
  {
    tag: "pickup",
    title: "Schedule a pick-up",
    body:
      "Hawaii-based practice? Request a courier pick-up for impressions, models, or returns. We cover Honolulu and most of Oahu.",
    cta: "Request pick-up",
    href: "/supabase/contact/#pickup",
  },
  {
    tag: "general",
    title: "Anything else",
    body:
      "Quotes, materials questions, complaints, compliments. Our team reads every message and replies within one business day.",
    cta: "Send a message",
    href: "/supabase/contact/#general",
  },
];
