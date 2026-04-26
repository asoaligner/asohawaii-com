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
};

export function applianceConfigKey(c: ApplianceConfig): string {
  return c.itemCode ? `${c.applianceId}:${c.itemCode}` : c.applianceId;
}

export type ToothSelection = {
  dentition: Dentition;
  /** Universal tooth IDs (e.g. "UR1", "UL3") for the current dentition. */
  upper: string[];
  lower: string[];
};

export type FormState = {
  practice: {
    name: string;
    doctor: string;
    email: string;
    phone: string;
    easyRxUser: boolean;
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
  delivery: {
    dueDate: string;
    method: string;
    address: string;
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
    easyRxUser: false,
  },
  patient: { reference: "" },
  arches: "both",
  archSync: false,
  upperAppliances: [],
  lowerAppliances: [],
  toothSelection: { dentition: "permanent", upper: [], lower: [] },
  files: { stl: [], photos: [], rxPdf: [] },
  delivery: {
    dueDate: "",
    method: "USPS Priority Mail",
    address: "",
    instructions: "",
  },
  consent: { hipaa: false, newsletter: false },
};

export const DELIVERY_METHODS: { value: string; label: string }[] = [
  { value: "Pickup", label: "Pickup at ASO Hawaii (Honolulu only)" },
  {
    value: "Local Delivery",
    label: "Local delivery (Honolulu area, some remote zones excluded)",
  },
  { value: "USPS Priority Mail", label: "USPS Priority Mail" },
];
