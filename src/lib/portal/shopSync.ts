/**
 * Client-side helper that pings POST /api/portal/orders/sync-shop after a
 * successful PayPal capture so the buyer's portal dashboard (if any) picks
 * up the order alongside the Formspree email.
 *
 * Mirrors the Formspree path: errors here NEVER block the buyer flow.
 * The caller in PayPalCheckout swallows + console.warns.
 */

import type { CartItem } from "@/contexts/ShopCartContext";
import type { PayPalCaptureSummary } from "@/lib/orderNotification";

type PurchaseUnit = NonNullable<
  PayPalCaptureSummary["purchase_units"]
>[number];

function formatAddress(unit: PurchaseUnit): string {
  const block = unit.shipping;
  if (!block) return "";
  const a = block.address;
  if (!a) return "";
  const lines = [
    block.name?.full_name,
    a.address_line_1,
    a.address_line_2,
    [a.admin_area_2, a.admin_area_1, a.postal_code]
      .filter(Boolean)
      .join(", "),
    a.country_code,
  ].filter(Boolean);
  return lines.join("\n");
}

export interface ShopSyncResult {
  ok: boolean;
  linked: boolean;
  id?: number;
  error?: string;
}

export async function syncShopOrderToPortal(args: {
  details: PayPalCaptureSummary;
  items: CartItem[];
  shippingFee: number;
}): Promise<ShopSyncResult> {
  const { details, items, shippingFee } = args;
  const unit = details.purchase_units?.[0];

  const buyerEmail = details.payer?.email_address ?? "";
  if (!buyerEmail) {
    return { ok: false, linked: false, error: "missing buyer_email" };
  }

  const buyerName =
    [details.payer?.name?.given_name, details.payer?.name?.surname]
      .filter(Boolean)
      .join(" ") || "";

  const subtotal = items.reduce(
    (acc, it) => acc + it.price * it.quantity,
    0,
  );

  const body = {
    paypal_order_id: details.id ?? "",
    paypal_capture_id: unit?.payments?.captures?.[0]?.id ?? undefined,
    buyer_email: buyerEmail,
    buyer_name: buyerName || undefined,
    items: items.map((it) => ({
      name: it.name,
      applianceType: it.applianceType ?? null,
      price: it.price,
      quantity: it.quantity,
    })),
    subtotal,
    shipping_fee: shippingFee,
    total: unit?.amount?.value ?? undefined,
    shipping_address: unit ? formatAddress(unit) : undefined,
  };

  try {
    const res = await fetch("/api/portal/orders/sync-shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let err = `sync-shop ${res.status}`;
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) err = j.error;
      } catch {
        /* fall through */
      }
      return { ok: false, linked: false, error: err };
    }
    const data = (await res.json()) as ShopSyncResult;
    return data;
  } catch (err) {
    return {
      ok: false,
      linked: false,
      error: err instanceof Error ? err.message : "Network error.",
    };
  }
}
