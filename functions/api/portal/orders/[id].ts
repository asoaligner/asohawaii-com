/**
 * GET /api/portal/orders/:id
 *
 * Single-order detail. Same access model as the list endpoint: clinic
 * users see only their own clinic's orders; aso_staff see any. We collapse
 * "not found" and "out of scope" into the same 404 so a clinic user can't
 * probe whether an order id exists for another clinic.
 *
 * internal_memo + source_data are only included for aso_staff.
 */

import {
  buildClearCookie,
  jsonResponse,
  resolveSession,
} from "../_lib/auth";
import {
  isCrossClinicViewer,
  publicOrderDetail,
  type PortalOrderRow,
} from "../_lib/orders";
import type { PagesFunction, PortalEnv } from "../_lib/types";

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for portal auth." },
      { status: 500 },
    );
  }

  const resolved = await resolveSession(
    ctx.request,
    ctx.env.DB,
    ctx.env.JWT_SECRET,
  );
  if (!resolved) {
    return jsonResponse(
      { error: "Not authenticated." },
      { status: 401, headers: { "Set-Cookie": buildClearCookie() } },
    );
  }

  const idParam = ctx.params.id;
  const id = Number.parseInt(typeof idParam === "string" ? idParam : "", 10);
  if (!Number.isFinite(id) || id <= 0) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  const row = await ctx.env.DB.prepare(
    "SELECT * FROM portal_orders WHERE id = ?",
  )
    .bind(id)
    .first<PortalOrderRow>();
  if (!row) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  // Out-of-scope row → same 404 to avoid id-enumeration across clinics.
  if (!isCrossClinicViewer(resolved.user) && row.clinic_id !== resolved.user.clinic_id) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  return jsonResponse({ order: publicOrderDetail(row, resolved.user) });
};
