/**
 * POST /api/portal/orders/sync-shop
 *
 * Public Shop checkout (PayPal) hook — called by /shop/checkout/ after
 * a successful capture so the matching portal_orders row appears in the
 * buyer's dashboard right after the redirect to /shop/thank-you/.
 *
 * Auth model (Phase 1.4c): **no session gate**. The lab's source of
 * truth is the Formspree email that fires alongside this — losing this
 * call would mean the dashboard is silent, not that the lab is blind.
 * We do, however, only persist the row when the buyer's email already
 * exists in portal_users; orders from anonymous customers fall through
 * silently (they keep showing up in email + on PayPal, just not in the
 * portal). Spec line 437-440 reserves a guest_orders table for the
 * non-matching case — punted to Phase 2.
 *
 * Hardening punted to Phase 2:
 *   - PayPal capture verification via Orders API to confirm
 *     paypal_order_id is real before writing.
 *   - Rate-limiting per buyer_email to dampen spam if the endpoint
 *     gets discovered. For now the UNIQUE(source, source_order_id)
 *     constraint + email-must-match guard limit blast radius.
 *
 * Body shape (JSON):
 *   {
 *     paypal_order_id   string,
 *     paypal_capture_id string?,
 *     buyer_email       string,
 *     buyer_name        string,
 *     items: [{ name, applianceType?, price, quantity }, ...],
 *     subtotal          number,
 *     shipping_fee      number,
 *     total             string,        // PayPal returns "$X.YY" as a string
 *     shipping_address  string         // already formatted (multi-line)
 *   }
 *
 * Returns:
 *   200 { ok: true, linked: true,  id }    — wrote portal_orders row N
 *   200 { ok: true, linked: false }        — no portal_users match (silent skip)
 *   400 { error }                          — malformed body
 *   409 { error }                          — duplicate paypal_order_id (idempotent retry)
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../_lib/auth";
import type { PagesFunction, PortalEnv, PortalUserRow } from "../_lib/types";

interface ShopItem {
  name: string;
  applianceType?: string | null;
  price: number;
  quantity: number;
}

interface SyncShopBody {
  paypal_order_id: string;
  paypal_capture_id?: string;
  buyer_email: string;
  buyer_name?: string;
  items: ShopItem[];
  subtotal?: number;
  shipping_fee?: number;
  total?: string;
  shipping_address?: string;
}

function describeItems(items: ShopItem[]): string {
  return items
    .map((it) => {
      const tag = it.applianceType ? ` (${it.applianceType})` : "";
      const lineTotal = (it.price * it.quantity).toFixed(2);
      return `- ${it.name}${tag} × ${it.quantity}: $${lineTotal}`;
    })
    .join("\n");
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  let body: SyncShopBody;
  try {
    body = (await ctx.request.json()) as SyncShopBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.paypal_order_id || typeof body.paypal_order_id !== "string") {
    return jsonResponse(
      { error: "paypal_order_id is required." },
      { status: 400 },
    );
  }
  if (
    !body.buyer_email ||
    typeof body.buyer_email !== "string" ||
    !body.buyer_email.includes("@")
  ) {
    return jsonResponse(
      { error: "buyer_email is required." },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonResponse(
      { error: "items must be a non-empty array." },
      { status: 400 },
    );
  }

  const emailLower = body.buyer_email.trim().toLowerCase();
  const user = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE email = ? AND is_active = 1",
  )
    .bind(emailLower)
    .first<PortalUserRow>();

  if (!user) {
    // Buyer has no portal account — silently skip. The Formspree email
    // path still notifies the lab.
    return jsonResponse({ ok: true, linked: false });
  }

  const firstItem = body.items[0];
  const applianceType = firstItem?.applianceType
    ? `${firstItem.name} — ${firstItem.applianceType}`
    : firstItem?.name ?? null;
  const today = new Date().toISOString().slice(0, 10);
  const designNotes = describeItems(body.items);

  const deliveryLines: string[] = [];
  if (body.shipping_address?.trim()) {
    deliveryLines.push(`Ship to:\n${body.shipping_address.trim()}`);
  }
  if (body.total) {
    deliveryLines.push(`Total: $${body.total}`);
  }
  if (typeof body.shipping_fee === "number") {
    deliveryLines.push(`Shipping fee: $${body.shipping_fee.toFixed(2)}`);
  }
  const deliveryNotes = deliveryLines.length
    ? deliveryLines.join("\n\n")
    : null;

  const sourceData = {
    paypal_order_id: body.paypal_order_id,
    paypal_capture_id: body.paypal_capture_id ?? null,
    buyer_email: emailLower,
    buyer_name: body.buyer_name ?? null,
    items: body.items,
    subtotal: body.subtotal ?? null,
    shipping_fee: body.shipping_fee ?? null,
    total: body.total ?? null,
    shipping_address: body.shipping_address ?? null,
    linked_user_id: user.id,
  };

  let newId: number | null = null;
  try {
    const result = await ctx.env.DB.prepare(
      `INSERT INTO portal_orders (
         clinic_id, source, source_order_id, order_number, patient_name,
         appliance_type, order_date, delivery_date, delivery_notes,
         design_notes, synced_at, source_data
       ) VALUES (?, 'shop', ?, ?, ?, ?, ?, NULL, ?, ?, datetime('now'), ?)`,
    )
      .bind(
        user.clinic_id,
        body.paypal_order_id,
        body.paypal_order_id,
        body.buyer_name?.trim() || emailLower,
        applianceType,
        today,
        deliveryNotes,
        designNotes,
        JSON.stringify(sourceData),
      )
      .run();
    newId =
      result.meta?.last_row_id != null
        ? Number(result.meta.last_row_id)
        : null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique")) {
      // Idempotent retry — same paypal_order_id already linked.
      return jsonResponse(
        { error: "Order already linked." },
        { status: 409 },
      );
    }
    return jsonResponse(
      { error: "Failed to record shop order." },
      { status: 500 },
    );
  }

  await recordAudit(ctx.env.DB, {
    userId: user.id,
    action: "portal_shop_order_linked",
    resourceType: "order",
    resourceId: newId != null ? String(newId) : body.paypal_order_id,
    metadata: {
      paypal_order_id: body.paypal_order_id,
      buyer_email: emailLower,
      item_count: body.items.length,
      total: body.total ?? null,
    },
    ipAddress: clientIp(ctx.request),
  });

  return jsonResponse({ ok: true, linked: true, id: newId });
};
