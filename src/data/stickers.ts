/**
 * Sticker catalogue (#41–#69, 29 designs). Stickers are pressed into
 * the acrylic during cure; up to 3 per retainer.
 */

export type StickerCategory =
  | "animals"
  | "vehicles"
  | "sports"
  | "characters";

export interface Sticker {
  id: number;
  name: string;
  category: StickerCategory;
}

export const STICKERS: Sticker[] = [
  { id: 41, name: "Beaver", category: "animals" },
  { id: 42, name: "Car", category: "vehicles" },
  { id: 43, name: "Crocodile", category: "animals" },
  { id: 44, name: "Devil", category: "characters" },
  { id: 45, name: "Dinosaur", category: "animals" },
  { id: 46, name: "Dolphin", category: "animals" },
  { id: 47, name: "Dragon", category: "characters" },
  { id: 48, name: "Duck", category: "animals" },
  { id: 49, name: "Elephant", category: "animals" },
  { id: 50, name: "Fish", category: "animals" },
  { id: 51, name: "Football", category: "sports" },
  { id: 52, name: "Formula 1", category: "vehicles" },
  { id: 53, name: "Frog", category: "animals" },
  { id: 54, name: "Graffiti", category: "characters" },
  { id: 55, name: "Heart", category: "characters" },
  { id: 56, name: "Hello Beaver", category: "animals" },
  { id: 57, name: "Horse", category: "animals" },
  { id: 58, name: "Ladybug", category: "animals" },
  { id: 59, name: "Motorcycle", category: "vehicles" },
  { id: 60, name: "Mouse", category: "animals" },
  { id: 61, name: "Mushroom", category: "characters" },
  { id: 62, name: "Parrot", category: "animals" },
  { id: 63, name: "Pink Pony", category: "animals" },
  { id: 64, name: "Raven", category: "animals" },
  { id: 65, name: "Snail", category: "animals" },
  { id: 66, name: "Soccer Player", category: "sports" },
  { id: 67, name: "Spider", category: "animals" },
  { id: 68, name: "Teddy Bear", category: "characters" },
  { id: 69, name: "Unicorn", category: "characters" },
];

export const STICKER_CATEGORIES: {
  id: StickerCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "animals", label: "Animals" },
  { id: "vehicles", label: "Vehicles" },
  { id: "sports", label: "Sports" },
  { id: "characters", label: "Characters" },
];

export const MAX_STICKERS_PER_APPLIANCE = 3;

export function findSticker(id: number): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}
