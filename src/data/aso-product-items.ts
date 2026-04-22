import raw from "./aso-product-items.json";

/**
 * Per-product-page ordered gallery extracted from asohawaii.com's Wix Pro
 * Gallery payload. Each item is a real photo + real product name from the
 * live site, mapped 1:1.
 */
export type ParsedItem = {
  /** Original gallery ordering index (optional — the newer JSON parser
   *  derives order from position in the array rather than an explicit idx). */
  idx?: number;
  name: string;
  /** Raw Wix asset filename; live under /images/aso/wix/ */
  image: string;
};

const raw_typed = raw as unknown as Record<string, ParsedItem[]>;

export function pageItems(slug: string): ParsedItem[] {
  return raw_typed[slug] ?? [];
}

export function pageItemsWithPaths(slug: string): Array<
  ParsedItem & { imagePath: string }
> {
  return pageItems(slug).map((item) => ({
    ...item,
    imagePath: `/images/aso/wix/${item.image}`,
  }));
}
