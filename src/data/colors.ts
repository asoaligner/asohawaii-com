/**
 * Acrylic colour catalogue + customisation type metadata for the new
 * Submit Case form. Numbers (and category split) match the printed
 * reference sheets in /public/images/aso/colors/charts/.
 *
 * Stage A renders these as flat hex chips. Per-swatch product photos
 * can be slotted in later via `imagePath` without code changes.
 */

export type ColorCategory = "traditional" | "glitter" | "neon";

export interface ColorOption {
  id: number;
  name: string;
  /** Approximate display swatch — used for the chip UI when no photo is set. */
  hex: string;
  category: ColorCategory;
  /** Optional path under /public to a swatch photo. */
  imagePath?: string;
}

const TRAD = "/images/aso/colors/traditional";
const GLIT = "/images/aso/colors/glitter";
const NEON = "/images/aso/colors/neon";

export const TRADITIONAL_COLORS: ColorOption[] = [
  { id: 1, name: "Pink", hex: "#F08AB0", category: "traditional", imagePath: `${TRAD}/01-pink.jpg` },
  { id: 2, name: "Clear", hex: "#E5E7EB", category: "traditional", imagePath: `${TRAD}/02-clear.jpg` },
  { id: 3, name: "Orange", hex: "#F97316", category: "traditional", imagePath: `${TRAD}/03-orange.jpg` },
  { id: 4, name: "Yellow", hex: "#FACC15", category: "traditional", imagePath: `${TRAD}/04-yellow.jpg` },
  { id: 5, name: "Green", hex: "#84CC16", category: "traditional", imagePath: `${TRAD}/05-green.jpg` },
  { id: 6, name: "Light Blue", hex: "#38BDF8", category: "traditional", imagePath: `${TRAD}/06-light-blue.jpg` },
  { id: 16, name: "Blue", hex: "#2563EB", category: "traditional", imagePath: `${TRAD}/16-blue.jpg` },
  { id: 17, name: "Red", hex: "#DC2626", category: "traditional", imagePath: `${TRAD}/17-red.jpg` },
  { id: 18, name: "Black", hex: "#0F172A", category: "traditional", imagePath: `${TRAD}/18-black.jpg` },
  { id: 19, name: "Purple", hex: "#C026D3", category: "traditional", imagePath: `${TRAD}/19-purple.jpg` },
  { id: 20, name: "White", hex: "#FFFFFF", category: "traditional", imagePath: `${TRAD}/20-white.jpg` },
];

export const GLITTER_COLORS: ColorOption[] = [
  { id: 21, name: "Blue Glitter", hex: "#7DD3FC", category: "glitter", imagePath: `${GLIT}/21-blue-glitter.jpg` },
  { id: 22, name: "Silver Glitter", hex: "#D4D4D8", category: "glitter", imagePath: `${GLIT}/22-silver-glitter.jpg` },
  { id: 23, name: "Aqua Glitter", hex: "#A5F3FC", category: "glitter", imagePath: `${GLIT}/23-aqua-glitter.jpg` },
  { id: 24, name: "Purple Glitter", hex: "#E9D5FF", category: "glitter", imagePath: `${GLIT}/24-purple-glitter.jpg` },
  { id: 25, name: "Orange Glitter", hex: "#FED7AA", category: "glitter", imagePath: `${GLIT}/25-orange-glitter.jpg` },
  { id: 26, name: "Multi Glitter", hex: "#F4F4F5", category: "glitter", imagePath: `${GLIT}/26-multi-glitter.jpg` },
  { id: 27, name: "Red Glitter", hex: "#FCA5A5", category: "glitter", imagePath: `${GLIT}/27-red-glitter.jpg` },
  { id: 28, name: "Gold Glitter", hex: "#FEF08A", category: "glitter", imagePath: `${GLIT}/28-gold-glitter.jpg` },
];

export const NEON_COLORS: ColorOption[] = [
  { id: 31, name: "Neon Glow", hex: "#F0F9D8", category: "neon", imagePath: `${NEON}/31-neon-glow.jpg` },
  { id: 32, name: "Neon Pink", hex: "#F0309F", category: "neon", imagePath: `${NEON}/32-neon-pink.jpg` },
  { id: 33, name: "Neon Orange", hex: "#FF6A1F", category: "neon", imagePath: `${NEON}/33-neon-orange.jpg` },
  { id: 34, name: "Neon Red", hex: "#FF3030", category: "neon", imagePath: `${NEON}/34-neon-red.jpg` },
  { id: 35, name: "Neon Blue", hex: "#1F8FFF", category: "neon", imagePath: `${NEON}/35-neon-blue.jpg` },
  { id: 36, name: "Neon Yellow", hex: "#E5F23C", category: "neon", imagePath: `${NEON}/36-neon-yellow.jpg` },
  { id: 37, name: "Neon Green", hex: "#3FE651", category: "neon", imagePath: `${NEON}/37-neon-green.jpg` },
  { id: 38, name: "Neon Teal", hex: "#0E9F84", category: "neon", imagePath: `${NEON}/38-neon-teal.jpg` },
  { id: 39, name: "Neon Purple", hex: "#A30FA3", category: "neon", imagePath: `${NEON}/39-neon-purple.jpg` },
];

export const ALL_COLORS: ColorOption[] = [
  ...TRADITIONAL_COLORS,
  ...GLITTER_COLORS,
  ...NEON_COLORS,
];

export function findColor(id: number): ColorOption | undefined {
  return ALL_COLORS.find((c) => c.id === id);
}

/** Customisation finishes — picked alongside the colour chips. */
export type CustomizationType =
  | "solid"
  | "dual"
  | "glitter_combo"
  | "neon_marble";

export interface CustomizationOption {
  id: CustomizationType;
  label: string;
  description: string;
  /** Maximum number of colour selections this finish requires. */
  maxColors: 1 | 2 | 3;
}

export const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  {
    id: "solid",
    label: "Solid (1 color)",
    description: "Single colour throughout.",
    maxColors: 1,
  },
  {
    id: "dual",
    label: "Dual Color",
    description: "Choose 2 colours for a split design.",
    maxColors: 2,
  },
  {
    id: "glitter_combo",
    label: "Color with Glitter",
    description: "Combine any colour with glitter accents.",
    maxColors: 2,
  },
  {
    id: "neon_marble",
    label: "Neon Marble",
    description: "Mix up to 3 neon colours for a marble effect.",
    maxColors: 3,
  },
];

/** Reference chart images — embedded once at the bottom of the picker
 *  so practices can cross-check against the printed sheet they have. */
export const COLOR_CHART_IMAGES = {
  traditionalGlitter: "/images/aso/colors/charts/traditional-glitter.jpg",
  neonStickers: "/images/aso/colors/charts/neon-stickers.jpg",
} as const;
