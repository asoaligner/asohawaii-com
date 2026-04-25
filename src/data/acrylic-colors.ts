/**
 * ASO Hawaii acrylic color palette + sticker catalogue.
 *
 * Image references point at the two full-page reference charts in
 * `/public/images/aso/colors/charts/`. The metadata below mirrors the
 * numbering printed on those charts so practices can copy "#N <name>"
 * verbatim onto an Rx form.
 */

export type AcrylicColor = {
  /** Catalogue number stamped on the printed reference sheet. */
  id: number;
  /** Display name (matches the printed caption). */
  name: string;
  /** Hex swatch used for the small chip rendered next to the name. */
  swatch: string;
};

/** Traditional opaque/translucent acrylics. */
export const TRADITIONAL_COLORS: AcrylicColor[] = [
  { id: 1, name: "Pink", swatch: "#F08AB0" },
  { id: 2, name: "Clear", swatch: "#E5E7EB" },
  { id: 3, name: "Orange", swatch: "#F97316" },
  { id: 4, name: "Yellow", swatch: "#FACC15" },
  { id: 5, name: "Green", swatch: "#84CC16" },
  { id: 6, name: "Light Blue", swatch: "#38BDF8" },
  { id: 16, name: "Blue", swatch: "#2563EB" },
  { id: 17, name: "Red", swatch: "#DC2626" },
  { id: 18, name: "Black", swatch: "#0F172A" },
  { id: 19, name: "Purple", swatch: "#C026D3" },
  { id: 20, name: "White", swatch: "#FFFFFF" },
];

/** Glitter-infused acrylics (clear or tinted base + glitter fleck). */
export const GLITTER_COLORS: AcrylicColor[] = [
  { id: 21, name: "Blue Glitter", swatch: "#7DD3FC" },
  { id: 22, name: "Silver Glitter", swatch: "#D4D4D8" },
  { id: 23, name: "Aqua Glitter", swatch: "#A5F3FC" },
  { id: 24, name: "Purple Glitter", swatch: "#E9D5FF" },
  { id: 25, name: "Orange Glitter", swatch: "#FED7AA" },
  { id: 26, name: "Multi Glitter", swatch: "#F4F4F5" },
  { id: 27, name: "Red Glitter", swatch: "#FCA5A5" },
  { id: 28, name: "Gold Glitter", swatch: "#FEF08A" },
];

/** Neon (high-saturation) acrylics. */
export const NEON_COLORS: AcrylicColor[] = [
  { id: 31, name: "Neon Glow", swatch: "#F0F9D8" },
  { id: 32, name: "Neon Pink", swatch: "#F0309F" },
  { id: 33, name: "Neon Orange", swatch: "#FF6A1F" },
  { id: 34, name: "Neon Red", swatch: "#FF3030" },
  { id: 35, name: "Neon Blue", swatch: "#1F8FFF" },
  { id: 36, name: "Neon Yellow", swatch: "#E5F23C" },
  { id: 37, name: "Neon Green", swatch: "#3FE651" },
  { id: 38, name: "Neon Teal", swatch: "#0E9F84" },
  { id: 39, name: "Neon Purple", swatch: "#A30FA3" },
];

/** Mix-and-match custom finishes available on request. */
export type CustomOption = {
  id: string;
  title: string;
  description: string;
  example: string;
};

export const CUSTOM_OPTIONS: CustomOption[] = [
  {
    id: "dual",
    title: "Dual Color",
    description: "Choose 2 colors for a unique split design.",
    example: "e.g. #38 Neon Teal / #32 Neon Pink",
  },
  {
    id: "glitter-combo",
    title: "Color with Glitter",
    description: "Combine any color with glitter accents.",
    example: "e.g. Color #6 & Glitter #22",
  },
  {
    id: "neon-marble",
    title: "Neon Marble",
    description: "Mix up to 3 neon colors for a marble effect.",
    example: "e.g. #32 / #36 / #38",
  },
];

/** Sticker catalogue (#41–#69, 29 designs).
 *  Stickers are pressed into the acrylic during cure — multiple may be
 *  applied per retainer. Patient-friendly designs aimed at kids. */
export type Sticker = {
  id: number;
  name: string;
};

export const STICKERS: Sticker[] = [
  { id: 41, name: "Beaver" },
  { id: 42, name: "Car" },
  { id: 43, name: "Crocodile" },
  { id: 44, name: "Devil" },
  { id: 45, name: "Dinosaur" },
  { id: 46, name: "Dolphin" },
  { id: 47, name: "Dragon" },
  { id: 48, name: "Duck" },
  { id: 49, name: "Elephant" },
  { id: 50, name: "Fish" },
  { id: 51, name: "Football" },
  { id: 52, name: "Formula 1" },
  { id: 53, name: "Frog" },
  { id: 54, name: "Graffiti" },
  { id: 55, name: "Heart" },
  { id: 56, name: "Hello Beaver" },
  { id: 57, name: "Horse" },
  { id: 58, name: "Ladybug" },
  { id: 59, name: "Motorcycle" },
  { id: 60, name: "Mouse" },
  { id: 61, name: "Mushroom" },
  { id: 62, name: "Parrot" },
  { id: 63, name: "Pink Pony" },
  { id: 64, name: "Raven" },
  { id: 65, name: "Snail" },
  { id: 66, name: "Soccer Player" },
  { id: 67, name: "Spider" },
  { id: 68, name: "Teddy Bear" },
  { id: 69, name: "Unicorn" },
];

/** Reference chart images.
 *  These are the original ASO color sample sheets with all swatches and
 *  captions baked in — used as the visual centerpiece in the color
 *  selector UI. */
export const COLOR_CHART_IMAGES = {
  traditionalGlitter: "/images/aso/colors/charts/traditional-glitter.jpg",
  neonStickers: "/images/aso/colors/charts/neon-stickers.jpg",
} as const;
