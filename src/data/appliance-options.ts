import { productCatalog } from "./product-catalog";

/**
 * Appliance dropdown options for the Submit Case form, grouped by
 * product category and including each catalog item as its own option.
 *
 * The submitted value is a single human-readable string so the email
 * Koji receives reads naturally — e.g.
 *   "Plate Type Retainer — 804 Wrap-Around (Begg)"
 *
 * URL prefill is resolved by `applianceValueFor(slug, code?)`, which
 * the form reads from `?product=<slug>&item=<code>` query params.
 */

export type ApplianceOption = {
  /** What gets submitted in the form. */
  value: string;
  /** Visible text inside the <option>. */
  label: string;
  /** Optional code so URL prefill can match without parsing the value. */
  code?: string;
};

export type ApplianceOptionGroup = {
  /** Matches `?product=` URL param. */
  slug: string;
  /** <optgroup label="..."> text. */
  groupLabel: string;
  options: ApplianceOption[];
};

const SKIP_SLUGS = new Set<string | null>([null, "new-products"]);

/** Build the full list of grouped options from the product catalog. */
export function buildApplianceOptionGroups(): ApplianceOptionGroup[] {
  const groups: ApplianceOptionGroup[] = productCatalog
    .filter((p) => !SKIP_SLUGS.has(p.slug))
    .map((p) => {
      const slug = p.slug as string;
      const generalValue = p.name;
      const itemOptions: ApplianceOption[] = (p.items ?? []).map((it) => ({
        value: it.code
          ? `${p.name} — ${it.code} ${it.name}`
          : `${p.name} — ${it.name}`,
        label: it.code ? `${it.code} — ${it.name}` : it.name,
        code: it.code,
      }));
      return {
        slug,
        groupLabel: p.name,
        options: [
          { value: generalValue, label: `${p.name} (general inquiry)` },
          ...itemOptions,
        ],
      };
    });

  // Tail group covering everything else (Sleep Apnea Device, Study Model,
  // IDB, etc. when they exist as catalog tiles too — we still include an
  // explicit "Other" so the user can free-form describe an off-catalogue
  // request without bailing out of the form).
  groups.push({
    slug: "__other__",
    groupLabel: "Other",
    options: [
      {
        value: "Other (specify in notes)",
        label: "Other (specify in notes)",
      },
    ],
  });

  return groups;
}

/** Resolve a `?product=&item=` pair into the dropdown value to preselect.
 *  Returns null if the slug is unknown — caller should leave selection blank. */
export function applianceValueFor(
  slug: string | null | undefined,
  code: string | null | undefined
): string | null {
  if (!slug) return null;
  const product = productCatalog.find((p) => p.slug === slug);
  if (!product) return null;
  if (!code) return product.name;
  const item = product.items?.find((it) => it.code === code);
  if (!item) return product.name;
  return item.code
    ? `${product.name} — ${item.code} ${item.name}`
    : `${product.name} — ${item.name}`;
}
