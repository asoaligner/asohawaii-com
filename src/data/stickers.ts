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
  imagePath: string;
}

const S = "/images/aso/colors/stickers";

export const STICKERS: Sticker[] = [
  { id: 41, name: "Beaver", category: "animals", imagePath: `${S}/41-beaver.jpg` },
  { id: 42, name: "Car", category: "vehicles", imagePath: `${S}/42-car.jpg` },
  { id: 43, name: "Crocodile", category: "animals", imagePath: `${S}/43-crocodile.jpg` },
  { id: 44, name: "Devil", category: "characters", imagePath: `${S}/44-devil.jpg` },
  { id: 45, name: "Dinosaur", category: "animals", imagePath: `${S}/45-dinosaur.jpg` },
  { id: 46, name: "Dolphin", category: "animals", imagePath: `${S}/46-dolphin.jpg` },
  { id: 47, name: "Dragon", category: "characters", imagePath: `${S}/47-dragon.jpg` },
  { id: 48, name: "Duck", category: "animals", imagePath: `${S}/48-duck.jpg` },
  { id: 49, name: "Elephant", category: "animals", imagePath: `${S}/49-elephant.jpg` },
  { id: 50, name: "Fish", category: "animals", imagePath: `${S}/50-fish.jpg` },
  { id: 51, name: "Football", category: "sports", imagePath: `${S}/51-football.jpg` },
  { id: 52, name: "Formula 1", category: "vehicles", imagePath: `${S}/52-formula1.jpg` },
  { id: 53, name: "Frog", category: "animals", imagePath: `${S}/53-frog.jpg` },
  { id: 54, name: "Graffiti", category: "characters", imagePath: `${S}/54-graffiti.jpg` },
  { id: 55, name: "Heart", category: "characters", imagePath: `${S}/55-heart.jpg` },
  { id: 56, name: "Hello Beaver", category: "animals", imagePath: `${S}/56-hello-beaver.jpg` },
  { id: 57, name: "Horse", category: "animals", imagePath: `${S}/57-horse.jpg` },
  { id: 58, name: "Ladybug", category: "animals", imagePath: `${S}/58-ladybug.jpg` },
  { id: 59, name: "Motorcycle", category: "vehicles", imagePath: `${S}/59-motorcycle.jpg` },
  { id: 60, name: "Mouse", category: "animals", imagePath: `${S}/60-mouse.jpg` },
  { id: 61, name: "Mushroom", category: "characters", imagePath: `${S}/61-mushroom.jpg` },
  { id: 62, name: "Parrot", category: "animals", imagePath: `${S}/62-parrot.jpg` },
  { id: 63, name: "Pink Pony", category: "animals", imagePath: `${S}/63-pink-pony.jpg` },
  { id: 64, name: "Raven", category: "animals", imagePath: `${S}/64-raven.jpg` },
  { id: 65, name: "Snail", category: "animals", imagePath: `${S}/65-snail.jpg` },
  { id: 66, name: "Soccer Player", category: "sports", imagePath: `${S}/66-soccer-player.jpg` },
  { id: 67, name: "Spider", category: "animals", imagePath: `${S}/67-spider.jpg` },
  { id: 68, name: "Teddy Bear", category: "characters", imagePath: `${S}/68-teddy-bear.jpg` },
  { id: 69, name: "Unicorn", category: "characters", imagePath: `${S}/69-unicorn.jpg` },
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
