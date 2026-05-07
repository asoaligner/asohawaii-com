/**
 * Formspree fan-out for /shop/checkout/ — sends an "internal" notification
 * email to aso-digital@outlook.com after a PayPal capture succeeds.
 *
 * PayPal already emails the buyer + the merchant account separately; this
 * is the lab-side digest that ties an order to its line-items, chosen
 * appliance types, and computed shipping fee in one place.
 *
 * Signature avoids `any` by typing on the subset of PayPal capture fields
 * we actually read. The PayPal SDK return type is a deeply-optional
 * `OrderResponseBody`, so we narrow defensively.
 */

import { FORMSPREE_ENDPOINT } from "@/data/config";
import type { CartItem } from "@/contexts/ShopCartContext";

export type PayPalCaptureSummary = {
  id?: string;
  status?: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  purchase_units?: Array<{
    amount?: { value?: string; currency_code?: string };
    shipping?: {
      name?: { full_name?: string };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_1?: string;
        admin_area_2?: string;
        postal_code?: string;
        country_code?: string;
      };
    };
    payments?: { captures?: Array<{ id?: string }> };
  }>;
};

type ShippingBlock = {
  name?: { full_name?: string };
  address?: {
    address_line_1?: string;
    address_line_2?: string;
    admin_area_1?: string;
    admin_area_2?: string;
    postal_code?: string;
    country_code?: string;
  };
};

function formatAddress(shipping?: ShippingBlock): string {
  if (!shipping) return "(no shipping address on capture)";
  const a = shipping.address;
  if (!a) return "(no address on shipping block)";
  const lines = [
    shipping.name?.full_name,
    a.address_line_1,
    a.address_line_2,
    [a.admin_area_2, a.admin_area_1, a.postal_code].filter(Boolean).join(", "),
    a.country_code,
  ].filter(Boolean);
  return lines.join("\n");
}

function formatItems(items: CartItem[]): string {
  return items
    .map((it) => {
      const tag = it.applianceType ? ` (${it.applianceType})` : "";
      const lineTotal = (it.price * it.quantity).toFixed(2);
      return `- ${it.name}${tag} × ${it.quantity}: $${lineTotal}`;
    })
    .join("\n");
}

function formatSummary(
  details: PayPalCaptureSummary,
  items: CartItem[],
  shippingFee: number
): string {
  const unit = details.purchase_units?.[0];
  const captureId = unit?.payments?.captures?.[0]?.id ?? "(unknown)";
  const customerName =
    [details.payer?.name?.given_name, details.payer?.name?.surname]
      .filter(Boolean)
      .join(" ") || "(no name)";
  const total = unit?.amount?.value ?? "(unknown)";
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  return [
    "=== NEW SHOP ORDER ===",
    `Order ID: ${details.id ?? "(no id)"}`,
    `Date: ${new Date().toISOString()}`,
    "",
    "CUSTOMER:",
    `Name: ${customerName}`,
    `Email: ${details.payer?.email_address ?? "(no email)"}`,
    "",
    "ITEMS:",
    formatItems(items),
    "",
    `Subtotal: $${subtotal.toFixed(2)}`,
    `Shipping: $${shippingFee.toFixed(2)}`,
    `Total:    $${total}`,
    "",
    "SHIPPING ADDRESS:",
    formatAddress(unit?.shipping),
    "",
    `Payment Status: ${details.status ?? "(unknown)"}`,
    `Transaction ID: ${captureId}`,
    "======================",
  ].join("\n");
}

/**
 * Fire the lab notification. Throws on network failure but the caller
 * should swallow — PayPal capture has already succeeded by the time we
 * get here, and we don't want to scare the buyer with an error after
 * their card was charged. Best-effort: still log to the console for
 * post-hoc reconciliation.
 */
export async function sendOrderNotification(
  details: PayPalCaptureSummary,
  items: CartItem[],
  shippingFee: number
): Promise<void> {
  const summary = formatSummary(details, items, shippingFee);
  const unit = details.purchase_units?.[0];

  const data = new FormData();
  data.append("_formType", "Shop Order");
  data.append("_subject", `New Shop Order — ${details.id ?? "no-id"}`);
  data.append("orderId", details.id ?? "");
  data.append("paypalEmail", details.payer?.email_address ?? "");
  data.append(
    "customerName",
    [details.payer?.name?.given_name, details.payer?.name?.surname]
      .filter(Boolean)
      .join(" ")
  );
  data.append("totalAmount", unit?.amount?.value ?? "");
  data.append("shippingFee", shippingFee.toFixed(2));
  data.append("shippingAddress", formatAddress(unit?.shipping));
  data.append("orderItems", formatItems(items));
  data.append("orderSummary", summary);

  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Formspree responded ${res.status}`);
  }
}
