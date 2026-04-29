/**
 * Appliance catalogue for the Submit Case form.
 *
 * The 14 entries here mirror the 14 product tiles on the HP product
 * index (the "New Product" tile is a category placeholder, not an
 * orderable line, so it's excluded). A 15th "Other (specify)" option
 * is appended as the catch-all — total 15 visible options.
 *
 * Each appliance lists the dynamic fields the form must show when
 * that appliance is selected (e.g. RPE size for banded RPE, material
 * for aligner-class items). Categories are kept on the type for
 * future filtering/searching but the picker UI now renders a flat
 * checkable list — practitioners should be able to scan the whole
 * catalogue at a glance.
 */

export type ApplianceCategory =
  | "retainer"
  | "expansion"
  | "band"
  | "aligner"
  | "splint"
  | "service"
  | "other";

export type ApplianceFieldType =
  | "color"
  | "stickers"
  | "material"
  | "rpe_size"
  | "metal_components"
  | "activation"
  | "free_text"
  | "package_type"
  | "print_form"
  | "denture_type"
  | "denture_stages"
  | "shade_color"
  | "tooth_position";

export interface ApplianceField {
  /** Field key — used as the FormData key suffix. */
  key: ApplianceFieldType;
  type: ApplianceFieldType;
  required: boolean;
  label: string;
  /** Choice list for select / radio / multi-select fields. */
  options?: string[];
  /** Optional hint shown beneath the field. */
  hint?: string;
}

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  description: string;
  fields: ApplianceField[];
}

const COLOR_STICKERS_FIELDS: ApplianceField[] = [
  { key: "color", type: "color", required: false, label: "Color" },
  { key: "stickers", type: "stickers", required: false, label: "Stickers" },
];

const METAL_FIELD: ApplianceField = {
  key: "metal_components",
  type: "metal_components",
  required: false,
  label: "Metal Components",
  // Two pairs displayed side-by-side in the form: bands first, then
  // the with/without choice for Bracket & Tube. Order matters — the
  // ApplianceDetails grid renders 2 columns, so this groups Regular /
  // 3D Bands on the first row and the Bracket & Tube pair on the second.
  options: [
    "Regular Bands",
    "3D Bands",
    "Bracket & Tube",
    "No Bracket & Tube",
  ],
};

const MATERIAL_OPTIONS = [
  "Standard",
  "Zendura A",
  "Zendura FLX",
  "Zendura VIVA",
  "Essix Ace",
  "C+",
  "LuxCreo",
];

export const APPLIANCES: Appliance[] = [
  {
    id: "plate_type_retainer",
    name: "Plate Type Retainer",
    category: "retainer",
    description:
      "Hawley / Wrap-around / QCM / Spring / Clear Bow — note variant in the notes field.",
    fields: [
      ...COLOR_STICKERS_FIELDS,
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Variant & special wires / springs",
        hint: "e.g. Hawley, Wrap-around (Begg), QCM, Spring retainer, Clear bow, Modified #7–#10. Note any special wires.",
      },
    ],
  },
  {
    id: "plate_expansion",
    name: "Plate Expansion",
    category: "expansion",
    description: "Acrylic plate with expansion screw.",
    fields: [
      ...COLOR_STICKERS_FIELDS,
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Notes",
        hint: "Variant (e.g. transverse with/without labial bow), special requirements",
      },
    ],
  },
  {
    id: "band_appliance",
    name: "Band Appliance",
    category: "band",
    description: "Banded rapid palatal expander or fixed band appliance.",
    fields: [METAL_FIELD],
  },
  {
    id: "aso_aligner",
    name: "ASO ALIGNER",
    category: "aligner",
    description:
      "ASO custom aligner. Pick the package SKU above; add treatment plan notes here. Material (Soft / Medium / Hard) is fixed by the package.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Treatment plan notes",
      },
    ],
  },
  {
    id: "flat_splint",
    name: "Flat Occlusal Splint",
    category: "splint",
    description:
      "Hard / Hard-and-Soft / NTI. Hard Acrylic available in any colour.",
    fields: [
      {
        key: "color",
        type: "color",
        required: false,
        label: "Color (Hard Acrylic)",
      },
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Type & specifications",
        hint: "e.g. Hard type, Hard-and-Soft, NTI. Note thickness and any special design.",
      },
    ],
  },
  {
    id: "lingual_retainer",
    name: "Lingual Retainer",
    category: "retainer",
    description: "Bonded lingual / 3D-printed metal retainer.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Type / Variant",
        hint: "e.g. 3D Metal Lingual Retainer, custom configuration",
      },
    ],
  },
  {
    id: "invisible_retainer",
    name: "Invisible Retainer",
    category: "aligner",
    description:
      "Co-Polyester / C+ / LuxCreo / Zendura A / with Pontic.",
    fields: [
      {
        key: "material",
        type: "material",
        required: true,
        label: "Material",
        options: MATERIAL_OPTIONS,
      },
      {
        key: "tooth_position",
        type: "tooth_position",
        required: false,
        label: "Pontic position",
        hint: "e.g. UR1, UL2, #21 — leave blank if no pontic",
      },
      {
        key: "shade_color",
        type: "shade_color",
        required: false,
        label: "Shade",
        hint: "e.g. Vita A1, A2 — only needed for pontics",
      },
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Notes (e.g. with pontic)",
      },
    ],
  },
  {
    id: "press_type",
    name: "Press-Type Appliance",
    category: "other",
    description:
      "Hard / Hard-and-Soft Night Guard, soft sports guard, etc.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: true,
        label: "Type / Variant",
        hint: "e.g. Hard 1.5 mm, Hard 2.0 mm, Hard-and-Soft 2.0 / 3.0 mm, sports guard",
      },
      { key: "color", type: "color", required: false, label: "Color" },
    ],
  },
  {
    id: "study_model",
    name: "Study Model",
    category: "other",
    description: "Diagnostic study model.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Special requirements",
      },
    ],
  },
  {
    id: "digital_print",
    name: "Digital Print-Only Service",
    category: "service",
    description:
      "STL → printed model only. Pick the form (with Palatal / Horse Shoe) above; configure print specs here.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Print specifications",
        hint: "Material, layer height, hollow/solid, base type, etc.",
      },
    ],
  },
  {
    id: "sleep_apnea",
    name: "Sleep Apnea & Snoring Appliances",
    category: "splint",
    description: "SomnoDent or similar mandibular advancement device.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: true,
        label: "Device type and specifications",
      },
    ],
  },
  {
    id: "idb",
    name: "IDB (Indirect Bonding Tray)",
    category: "other",
    description: "Indirect bonding tray for brackets.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Bracket system details",
      },
    ],
  },
  {
    id: "flipper",
    name: "Flipper / Immediate Denture",
    category: "other",
    description:
      "Pick Flipper / Immediate Denture / Full Denture above; configure stage and shade here.",
    fields: [
      {
        key: "denture_stages",
        type: "denture_stages",
        required: true,
        label: "Stage(s)",
        options: ["Wax Bite", "Try In", "Finish"],
      },
      {
        key: "shade_color",
        type: "shade_color",
        required: false,
        label: "Shade Color",
        hint: "e.g. Vita Classic A1, A2, B1",
      },
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Tooth positions and notes",
      },
    ],
  },
  {
    id: "functional",
    name: "Functional Appliances",
    category: "other",
    description: "Twin block, Frankel, Bionator, EOA, etc.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: true,
        label: "Appliance specifications",
        hint: "Type, modifications, working bite, etc.",
      },
      ...COLOR_STICKERS_FIELDS,
    ],
  },
  {
    id: "other",
    name: "Other (specify)",
    category: "other",
    description: "Custom appliance not listed above.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: true,
        label: "Appliance description and specifications",
      },
    ],
  },
];

export function findAppliance(id: string): Appliance | undefined {
  return APPLIANCES.find((a) => a.id === id);
}
