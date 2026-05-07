/**
 * Tiered miniature-collection shipping rate logic.
 *
 * Source of truth for /shop/checkout/. Two interfaces:
 *
 *  - calculateShipping(destination) — flat rate for a chosen tier.
 *  - detectDestination(country, state) — derive the tier from PayPal's
 *    captured shipping address. Defaults to "us-mainland" when state is
 *    missing on a US address (PayPal usually fills it but we don't want
 *    to fall through to free shipping by accident).
 *
 * Currency is implicitly USD — the only currency we wire into PayPal.
 */

export type ShippingDestination = "hawaii" | "us-mainland" | "international";

export const SHIPPING_RATES: Record<ShippingDestination, number> = {
  hawaii: 0,
  "us-mainland": 10,
  international: 30,
};

export const SHIPPING_LABELS: Record<ShippingDestination, string> = {
  hawaii: "Hawaii (Free)",
  "us-mainland": "US Mainland ($10)",
  international: "International ($30)",
};

export function calculateShipping(destination: ShippingDestination): number {
  return SHIPPING_RATES[destination];
}

export function detectDestination(
  countryCode: string | undefined | null,
  stateCode?: string | undefined | null
): ShippingDestination {
  if (!countryCode) return "international";
  const country = countryCode.toUpperCase();
  if (country !== "US") return "international";
  const state = (stateCode ?? "").toUpperCase();
  if (state === "HI") return "hawaii";
  return "us-mainland";
}
