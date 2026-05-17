import type { CustomizationType } from "@/data/colors";

export type Arches = "upper" | "lower" | "both";
export type Dentition = "permanent" | "mixed" | "primary";

export type ColorChoice = {
  type: CustomizationType;
  primary?: number;
  secondary?: number;
  tertiary?: number;
};

/** Per-appliance configuration. Only the fields relevant to the
 *  selected appliance will be populated; others stay undefined.
 *
 *  When the parent product has catalog SKUs (e.g. Plate Type Retainer
 *  → 801 Hawley, 804 Wrap-Around …), each picked SKU becomes its own
 *  ApplianceConfig with `itemCode`/`itemName` set. Parents without
 *  SKUs (e.g. Other) have only `applianceId`. Identity is therefore
 *  `applianceId + (itemCode ?? "")`. */
export type ApplianceConfig = {
  applianceId: string;
  itemCode?: string;
  itemName?: string;
  color?: ColorChoice;
  stickers?: number[];
  material?: string;
  rpe_size?: string;
  metal_components?: string[];
  activation?: string;
  free_text?: string;
  /** ASO ALIGNER package level (Basic / Advance / 3in1 / Step). */
  package_type?: string;
  /** Digital Print-Only form (with Palatal / Horse Shoe). */
  print_form?: string;
  /** Flipper / Immediate / Full denture type. */
  denture_type?: string;
  /** Multi-stage selector for denture cases (Wax Bite / Try In / Finish). */
  denture_stages?: string[];
  /** Shade colour text (e.g. Vita A1, A2). */
  shade_color?: string;
  /** Tooth position / location text (e.g. "UR1", "#21"). */
  tooth_position?: string;
  /** Flat Occlusal Splint bite thickness (e.g. "Standard 2 mm"). */
  splint_thickness?: string;
  /** Flat Occlusal Splint canine guidance opt-in. */
  canine_guidance?: boolean;
  /** Sports Mouthguard color choice (Press-Type Appliance · Sports SKUs only). */
  mouthguard_color?: string;
  /** Per-clasp tooth placements (Plate Type Retainer and similar
   *  Hawley-class appliances). Each clasp tracks its own list of tooth
   *  IDs; ball clasp specifically stores ordered pairs (consecutive
   *  even/odd entries form one "between" pair). */
  clasps?: ClaspSelections;
};

export type ClaspType =
  | "labial_bow"
  | "adams"
  | "ball_clasp"
  | "c_clasp"
  | "occlusal_rest";

export type ClaspSelections = {
  /** Range — usually the anterior teeth the wire crosses. */
  labial_bow: string[];
  /** Optional "with Resin Pad" flag for the labial bow. The lab needs
   *  to know whether to fabricate the bow plain or with the bonded
   *  resin pad accessory. */
  labial_bow_with_resin_pad?: boolean;
  /** Individual teeth — each has its own Adams clasp. */
  adams: string[];
  /** Pairs — consecutive entries (i, i+1) form one between-pair.
   *  Odd-length means the last entry is an anchor waiting for the
   *  user's second click. */
  ball_clasp: string[];
  /** Individual teeth — each has its own C clasp. */
  c_clasp: string[];
  /** Individual teeth — small metal extension on the occlusal surface
   *  for vertical support of a removable partial / flipper. */
  occlusal_rest: string[];
};

export const EMPTY_CLASPS: ClaspSelections = {
  labial_bow: [],
  adams: [],
  ball_clasp: [],
  c_clasp: [],
  occlusal_rest: [],
};

export interface ClaspMeta {
  type: ClaspType;
  label: string;
  hint: string;
  /** Tailwind background utility for the colored dot on the tooth chart. */
  dotClass: string;
  /** Tailwind ring utility for the panel card when active. */
  ringClass: string;
  /** Hex used inside the SVG (can't reach Tailwind from inside <svg>). */
  hex: string;
  /** Ball-clasp is the only "between two teeth" semantic; others are
   *  individual / range. */
  pairMode: boolean;
}

export const CLASP_META: ReadonlyArray<ClaspMeta> = [
  {
    type: "labial_bow",
    label: "Labial bow",
    hint: "Range — click 2 teeth (uses Range mode under the hood).",
    dotClass: "bg-blue-500",
    ringClass: "ring-blue-500",
    hex: "#3b82f6",
    pairMode: false,
  },
  {
    type: "adams",
    label: "Adams clasp",
    hint: "Individual teeth — click each one.",
    dotClass: "bg-emerald-500",
    ringClass: "ring-emerald-500",
    hex: "#10b981",
    pairMode: false,
  },
  {
    type: "ball_clasp",
    label: "Ball clasp",
    hint: "Between — click 2 adjacent teeth per pair.",
    dotClass: "bg-purple-500",
    ringClass: "ring-purple-500",
    hex: "#a855f7",
    pairMode: true,
  },
  {
    type: "c_clasp",
    label: "C clasp",
    hint: "Individual teeth — click each one.",
    dotClass: "bg-pink-500",
    ringClass: "ring-pink-500",
    hex: "#ec4899",
    pairMode: false,
  },
  {
    type: "occlusal_rest",
    label: "Occlusal Rest",
    hint: "Individual teeth — click each one.",
    dotClass: "bg-teal-500",
    ringClass: "ring-teal-500",
    hex: "#14b8a6",
    pairMode: false,
  },
];

export function getClaspMeta(type: ClaspType): ClaspMeta {
  const meta = CLASP_META.find((m) => m.type === type);
  if (!meta) throw new Error(`Unknown clasp type: ${type}`);
  return meta;
}

export function applianceConfigKey(c: ApplianceConfig): string {
  if (c.itemCode) return `${c.applianceId}:${c.itemCode}`;
  if (c.itemName) return `${c.applianceId}:name:${c.itemName}`;
  return c.applianceId;
}

export type ToothSelection = {
  dentition: Dentition;
  /** Universal tooth IDs (e.g. "UR1", "UL3") for the current dentition. */
  upper: string[];
  lower: string[];
};

/** Structured shipping address (Phase 2.2a — replaces the prior single
 *  freetext `delivery.address` string). Each input in the UI gets the
 *  matching HTML autocomplete token so browsers (Chrome / Safari /
 *  Firefox / Edge) can offer their built-in profile autofill on the
 *  second visit. Server side stays string-only via formatShippingAddress
 *  so the Formspree + portal_orders.delivery_notes payloads don't
 *  change shape. */
export type ShippingAddress = {
  /** autocomplete="address-line1" */
  line1: string;
  /** autocomplete="address-line2" (Apt / Suite — optional) */
  line2: string;
  /** autocomplete="address-level2" */
  city: string;
  /** autocomplete="address-level1" — US state code (e.g. "HI"). */
  state: string;
  /** autocomplete="postal-code" */
  zip: string;
  /** autocomplete="country-name" — ISO 3166-1 alpha-2 (e.g. "US"). The
   *  dropdown is intentionally small (US/CA/JP) since ASO Hawaii ships
   *  almost exclusively to US addresses; expand when international
   *  demand actually appears. */
  country: string;
};

export const INITIAL_SHIPPING_ADDRESS: ShippingAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "HI",
  zip: "",
  country: "US",
};

/** US states (+ DC). value = USPS 2-letter code, name = display label.
 *  Hawaii deliberately stays at its alphabetical position; the select
 *  starts pre-selected on "HI" via INITIAL_SHIPPING_ADDRESS. */
export const US_STATES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const SHIPPING_COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "JP", name: "Japan" },
];

/** Flatten the structured address into the legacy one-line format used
 *  by Formspree + the portal submit endpoint. Empty optional fields
 *  drop out so we don't end up with stray ", ," separators. */
export function formatShippingAddress(a: ShippingAddress): string {
  const cityStateZip = [
    a.city.trim(),
    [a.state.trim(), a.zip.trim()].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  const parts: string[] = [
    a.line1.trim(),
    a.line2.trim() || "",
    cityStateZip,
    a.country.trim(),
  ].filter((s) => s.length > 0);
  return parts.join(", ");
}

export type FormState = {
  practice: {
    name: string;
    doctor: string;
    email: string;
    phone: string;
  };
  patient: {
    reference: string;
  };
  arches: Arches;
  archSync: boolean;
  upperAppliances: ApplianceConfig[];
  lowerAppliances: ApplianceConfig[];
  toothSelection: ToothSelection;
  files: {
    stl: File[];
    photos: File[];
    rxPdf: File[];
  };
  /** R2 keys for STL files already uploaded on-select (portal context
   *  only). Keyed by a stable per-file key — see stlFileKey() in
   *  StlUploadField. The submit hook reuses these instead of
   *  re-uploading; files without an entry fall back to submit-time
   *  upload. Empty on the public form. */
  stlUploads: Record<string, string>;
  delivery: {
    dueDate: string;
    address: ShippingAddress;
    instructions: string;
  };
  consent: {
    hipaa: boolean;
    newsletter: boolean;
  };
};

export const INITIAL_FORM_STATE: FormState = {
  practice: {
    name: "",
    doctor: "",
    email: "",
    phone: "",
  },
  patient: { reference: "" },
  arches: "both",
  archSync: false,
  upperAppliances: [],
  lowerAppliances: [],
  toothSelection: { dentition: "permanent", upper: [], lower: [] },
  files: { stl: [], photos: [], rxPdf: [] },
  stlUploads: {},
  delivery: {
    dueDate: "",
    address: { ...INITIAL_SHIPPING_ADDRESS },
    instructions: "",
  },
  consent: { hipaa: false, newsletter: false },
};

