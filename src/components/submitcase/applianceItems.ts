import type { CatalogItem } from "@/data/product-catalog";
import { productCatalog } from "@/data/product-catalog";

/** Map appliance id (from src/data/appliances.ts) → product slug
 *  (from src/data/product-catalog.ts). Some appliances don't have a
 *  matching product tile (Digital Print, Flipper, Other) — those
 *  return an empty SKU list and are rendered as a flat checkbox. */
export const APPLIANCE_TO_PRODUCT_SLUG: Record<string, string | null> = {
  plate_type_retainer: "plate-type-retainer-expansion",
  plate_expansion: "plate-expansion",
  band_appliance: "band-appliance",
  aso_aligner: "aso-aligner",
  flat_splint: "flat-occlusal-splint",
  lingual_retainer: "lingual-retainer",
  invisible_retainer: "invisible-retainer",
  press_type: "press-type-appliance",
  study_model: "study-model",
  digital_print: null,
  sleep_apnea: "sleep-apnea",
  idb: "idb",
  flipper: null,
  functional: "functional-appliances",
  other: null,
};

/** Catalog items (SKUs) for a given appliance id, or [] if the parent
 *  product has no sub-items (e.g. ASO ALIGNER, IDB, Other). */
export function applianceItems(applianceId: string): CatalogItem[] {
  const slug = APPLIANCE_TO_PRODUCT_SLUG[applianceId];
  if (!slug) return [];
  const product = productCatalog.find((p) => p.slug === slug);
  return product?.items ?? [];
}
