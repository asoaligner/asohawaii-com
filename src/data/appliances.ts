/**
 * Detailed appliance catalogue for the multi-step Submit Case form.
 *
 * Each appliance lists the dynamic fields the form must show when that
 * appliance is selected (e.g. RPE size for banded RPE, material for
 * aligner-class items). The form renders these field-by-field based
 * on `Appliance.fields`.
 */

export type ApplianceCategory =
  | "retainer"
  | "expansion"
  | "band"
  | "aligner"
  | "splint"
  | "other";

export type ApplianceFieldType =
  | "color"
  | "stickers"
  | "material"
  | "rpe_size"
  | "metal_components"
  | "activation"
  | "free_text";

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

const RETAINER_COLOR_FIELDS: ApplianceField[] = [
  { key: "color", type: "color", required: false, label: "Color" },
  { key: "stickers", type: "stickers", required: false, label: "Stickers" },
];

const METAL_FIELD: ApplianceField = {
  key: "metal_components",
  type: "metal_components",
  required: false,
  label: "Metal Components",
  options: ["Regular Bands", "Brackets", "3D Bands", "No Brackets"],
};

const ACTIVATION_FIELD: ApplianceField = {
  key: "activation",
  type: "activation",
  required: false,
  label: "Activation",
  options: ["Pre-activated", "Patient-activated"],
};

const MATERIAL_OPTIONS = [
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
    description: "Acrylic Hawley-style retainer.",
    fields: [
      ...RETAINER_COLOR_FIELDS,
      METAL_FIELD,
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Special wires / springs",
      },
    ],
  },
  {
    id: "modified_retainer",
    name: "Modified Retainer (#7–#10)",
    category: "retainer",
    description: "Modified setup for tooth #7 to #10.",
    fields: [
      ...RETAINER_COLOR_FIELDS,
      METAL_FIELD,
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Modification details",
      },
    ],
  },
  {
    id: "wrap_around",
    name: "Wrap-Around (Begg)",
    category: "retainer",
    description: "Begg-style wrap-around retainer.",
    fields: RETAINER_COLOR_FIELDS,
  },
  {
    id: "qcm",
    name: "QCM",
    category: "retainer",
    description: "Quad cantilever mechanism.",
    fields: RETAINER_COLOR_FIELDS,
  },
  {
    id: "spring_retainer",
    name: "Spring Retainer",
    category: "retainer",
    description: "Anterior spring retainer.",
    fields: [
      ...RETAINER_COLOR_FIELDS,
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Spring details",
      },
    ],
  },
  {
    id: "clear_bow",
    name: "Clear Bow",
    category: "retainer",
    description: "Clear acrylic bow retainer.",
    fields: [
      { key: "color", type: "color", required: false, label: "Color (base)" },
      { key: "stickers", type: "stickers", required: false, label: "Stickers" },
    ],
  },
  {
    id: "plate_expansion",
    name: "Plate Expansion",
    category: "expansion",
    description: "Acrylic plate with expansion screw.",
    fields: [
      ...RETAINER_COLOR_FIELDS,
      METAL_FIELD,
      ACTIVATION_FIELD,
    ],
  },
  {
    id: "band_appliance",
    name: "Band Appliance (RPE)",
    category: "band",
    description: "Banded rapid palatal expander.",
    fields: [
      {
        key: "rpe_size",
        type: "rpe_size",
        required: true,
        label: "RPE Size",
        options: ["8 mm", "10 mm", "12 mm"],
      },
      ACTIVATION_FIELD,
      ...RETAINER_COLOR_FIELDS,
    ],
  },
  {
    id: "functional",
    name: "Functional Appliance",
    category: "other",
    description: "Twin block, Frankel, Bionator, etc.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: true,
        label: "Appliance specifications",
        hint: "Type, modifications, working bite, etc.",
      },
      ...RETAINER_COLOR_FIELDS,
    ],
  },
  {
    id: "aso_aligner",
    name: "ASO ALIGNER",
    category: "aligner",
    description: "ASO custom aligner.",
    fields: [
      {
        key: "material",
        type: "material",
        required: true,
        label: "Material",
        options: MATERIAL_OPTIONS,
      },
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Treatment plan notes",
      },
    ],
  },
  {
    id: "invisible_retainer",
    name: "Invisible Retainer",
    category: "aligner",
    description: "Clear thermoformed retainer.",
    fields: [
      {
        key: "material",
        type: "material",
        required: true,
        label: "Material",
        options: MATERIAL_OPTIONS,
      },
    ],
  },
  {
    id: "clear_retainer",
    name: "Clear Retainer",
    category: "aligner",
    description: "Standard clear retainer.",
    fields: [
      {
        key: "material",
        type: "material",
        required: true,
        label: "Material",
        options: MATERIAL_OPTIONS,
      },
    ],
  },
  {
    id: "flat_splint",
    name: "Flat Occlusal Splint",
    category: "splint",
    description: "Flat-plane occlusal splint (Hard Acrylic).",
    fields: [
      {
        key: "color",
        type: "color",
        required: false,
        label: "Color (Hard Acrylic — all colors available)",
      },
      {
        key: "free_text",
        type: "free_text",
        required: false,
        label: "Splint specifications",
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
    id: "press_type",
    name: "Press-Type Appliance",
    category: "other",
    description: "Pressed acrylic appliance.",
    fields: [
      {
        key: "free_text",
        type: "free_text",
        required: true,
        label: "Appliance specifications",
      },
      { key: "color", type: "color", required: false, label: "Color" },
    ],
  },
  {
    id: "sleep_apnea",
    name: "Sleep Apnea Device",
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

export const APPLIANCE_CATEGORIES: {
  id: ApplianceCategory;
  label: string;
}[] = [
  { id: "retainer", label: "Retainers" },
  { id: "expansion", label: "Expansion" },
  { id: "band", label: "Bands & RPE" },
  { id: "aligner", label: "Aligners & Clear" },
  { id: "splint", label: "Splints" },
  { id: "other", label: "Other" },
];

export function findAppliance(id: string): Appliance | undefined {
  return APPLIANCES.find((a) => a.id === id);
}
