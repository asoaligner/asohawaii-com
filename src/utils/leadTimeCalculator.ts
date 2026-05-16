/**
 * Per-appliance lead-time → earliest selectable due-date.
 *
 * Single source of truth for lead times is `src/data/product-catalog.ts`:
 * - Each ProductTile has `leadTime` ("Approx. 1 week" | "Approx. 2 weeks").
 * - ASO ALIGNER overrides per CatalogItem (per package tier).
 * Mapping appliance.id → product slug lives in `applianceItems.ts`.
 *
 * Two-week appliances normally promise the ordered date + 14 calendar
 * days. When the next two weeks contain ≥2 consecutive weekday holidays
 * (e.g. ASO's year-end shutdown), the 2-week path is recounted in
 * business days (10 BD), pushing the earliest delivery past the closure.
 * One-week appliances always count 5 business days, skipping weekends
 * and holidays.
 */

import { isBusinessDay, isHoliday, isWeekend } from "@/data/holidays";
import { APPLIANCE_TO_PRODUCT_SLUG } from "@/components/submitcase/applianceItems";
import { productCatalog } from "@/data/product-catalog";
import type { ApplianceConfig } from "@/components/submitcase/types";

export type LeadTimeKey = "1week" | "2weeks";

export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) added += 1;
  }
  return result;
}

export function addCalendarDays(start: Date, days: number): Date {
  const result = new Date(start);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * True if the [start, end] window contains a run of ≥2 consecutive
 * weekday holidays. Weekends do not count toward the run on their own,
 * but they don't reset it either — so a Fri-holiday + Sat/Sun + Mon-
 * holiday still counts as a consecutive closure.
 */
export function hasConsecutiveHolidays(start: Date, end: Date): boolean {
  let run = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (isHoliday(cursor) && !isWeekend(cursor)) {
      run += 1;
      if (run >= 2) return true;
    } else if (!isWeekend(cursor)) {
      run = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

export function calculateMinDueDate(
  leadTime: LeadTimeKey,
  from: Date = new Date()
): Date {
  if (leadTime === "1week") {
    return addBusinessDays(from, 5);
  }
  const tentative = addCalendarDays(from, 14);
  if (hasConsecutiveHolidays(from, tentative)) {
    return addBusinessDays(from, 10);
  }
  return tentative;
}

function leadTimeFromString(
  s: "Approx. 1 week" | "Approx. 2 weeks" | undefined
): LeadTimeKey | undefined {
  if (s === "Approx. 1 week") return "1week";
  if (s === "Approx. 2 weeks") return "2weeks";
  return undefined;
}

/**
 * Resolve a single ApplianceConfig to a LeadTimeKey, consulting the
 * product catalog. ASO ALIGNER picks up the per-tier override on its
 * matching CatalogItem (by `code`). Falls back to "2weeks" when nothing
 * is mapped — a safe, conservative default for unknown / "Other" lines.
 */
export function leadTimeForConfig(config: ApplianceConfig): LeadTimeKey {
  const slug = APPLIANCE_TO_PRODUCT_SLUG[config.applianceId];
  if (!slug) return "2weeks";
  const product = productCatalog.find((p) => p.slug === slug);
  if (!product) return "2weeks";

  // Per-SKU override. Match by code when the catalog item has one,
  // otherwise by name — Invisible Retainer's SKUs (incl. LuxCreo
  // Direct-Print, the 2-week one) carry no code, so a code-only match
  // would silently fall through to the product-level lead time.
  if (product.items) {
    const item = product.items.find(
      (it) =>
        (!!config.itemCode && it.code === config.itemCode) ||
        (!!config.itemName && it.name === config.itemName),
    );
    const itemLT = leadTimeFromString(item?.leadTime);
    if (itemLT) return itemLT;
  }

  return leadTimeFromString(product.leadTime) ?? "2weeks";
}

/**
 * Across every selected appliance config, return the longest lead time.
 * If any line is "2weeks" the order is "2weeks"; otherwise "1week".
 * Empty selection → "1week" (no constraint yet).
 */
export function getMaxLeadTime(configs: ApplianceConfig[]): LeadTimeKey {
  if (configs.length === 0) return "1week";
  for (const c of configs) {
    if (leadTimeForConfig(c) === "2weeks") return "2weeks";
  }
  return "1week";
}

export function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
