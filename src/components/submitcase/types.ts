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
 *  selected appliance will be populated; others stay undefined. */
export type ApplianceConfig = {
  applianceId: string;
  color?: ColorChoice;
  stickers?: number[];
  material?: string;
  rpe_size?: string;
  metal_components?: string[];
  activation?: string;
  free_text?: string;
};

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
