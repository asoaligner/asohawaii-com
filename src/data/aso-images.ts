import raw from "./aso-images.json";

/**
 * Mapping of asohawaii.com page slug → ordered list of image file IDs
 * (relative to /public/images/aso/wix/).
 *
 * The first two entries of every page are the shared site logo + Instagram
 * icon, so we skip them and expose only the page-specific images via
 * `pageImages()`.
 */
const manifest = raw as Record<string, string[]>;
const SKIP = 2; // shared logo + instagram icon

export function pageImages(slug: string): string[] {
  const list = manifest[slug];
  if (!list) return [];
  return list.slice(SKIP).map((id) => `/images/aso/wix/${id}`);
}

export function firstImage(slug: string): string | null {
  const list = pageImages(slug);
  return list[0] ?? null;
}

export function nthImage(slug: string, n: number): string | null {
  const list = pageImages(slug);
  return list[n] ?? null;
}
