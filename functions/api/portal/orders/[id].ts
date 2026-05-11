/**
 * /api/portal/orders/:id
 *
 *   GET   — single-order detail. Same access model as the list endpoint:
 *           clinic users see only their own clinic's orders; aso_staff
 *           see any. "Not found" and "out of scope" collapse to the same
 *           404 so a clinic user can't probe whether an id exists for
 *           another clinic. internal_memo + source_data only included
 *           for aso_staff (see publicOrderDetail).
 *
 *   PATCH — cross-clinic order edit, aso_staff only. Lets internal staff
 *           fix typos and fill in tracking / dates / memos after the
 *           submission flow has stored a portal_orders row. Empty
 *           strings on optional text fields normalise to NULL.
 *           Audited as `portal_order_updated` with the per-column from→to
 *           diff so the Audit Log shows exactly what changed.
 */

import {
  buildClearCookie,
  clientIp,
  jsonResponse,
  recordAudit,
  resolveSession,
} from "../_lib/auth";
import { requireAsoStaff } from "../_lib/admin";
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

// ─── PATCH handler (aso_staff cross-clinic edit) ───────────────────────

interface PatchBody {
  order_number?: unknown;
  patient_name?: unknown;
  appliance_type?: unknown;
  order_date?: unknown;
  delivery_date?: unknown;
  delivery_notes?: unknown;
  tracking_number?: unknown;
  tracking_carrier?: unknown;
  additional_memo?: unknown;
  internal_memo?: unknown;
}

const EDITABLE_TEXT_FIELDS = [
  "order_number",
  "patient_name",
  "appliance_type",
  "delivery_notes",
  "tracking_number",
  "tracking_carrier",
  "additional_memo",
  "internal_memo",
] as const;

const EDITABLE_DATE_FIELDS = ["order_date", "delivery_date"] as const;

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** "" → null, otherwise the trimmed string. */
function normalizeText(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export const onRequestPatch: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const idParam = ctx.params.id;
  const id = Number.parseInt(typeof idParam === "string" ? idParam : "", 10);
  if (!Number.isFinite(id) || id <= 0) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  let body: PatchBody;
  try {
    body = (await ctx.request.json()) as PatchBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const target = await ctx.env.DB.prepare(
    "SELECT * FROM portal_orders WHERE id = ?",
  )
    .bind(id)
    .first<PortalOrderRow>();
  if (!target) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  const updates: string[] = [];
  const sqlArgs: unknown[] = [];
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  // ── Text fields ──
  for (const column of EDITABLE_TEXT_FIELDS) {
    const raw = body[column];
    if (raw === undefined) continue;
    if (raw !== null && typeof raw !== "string") {
      return jsonResponse(
        { error: `${column} must be a string or null.` },
        { status: 400 },
      );
    }
    const next = raw === null ? null : normalizeText(raw);
    const current = target[column];
    if (next !== current) {
      updates.push(`${column} = ?`);
      sqlArgs.push(next);
      changes[column] = { from: current, to: next };
    }
  }

  // ── Date fields ──
  for (const column of EDITABLE_DATE_FIELDS) {
    const raw = body[column];
    if (raw === undefined) continue;
    if (raw !== null && typeof raw !== "string") {
      return jsonResponse(
        { error: `${column} must be a YYYY-MM-DD string or null.` },
        { status: 400 },
      );
    }
    let next: string | null;
    if (raw === null) {
      next = null;
    } else {
      const trimmed = raw.trim();
      if (trimmed === "") {
        next = null;
      } else if (!isYmd(trimmed)) {
        return jsonResponse(
          { error: `${column} must be YYYY-MM-DD.` },
          { status: 400 },
        );
      } else {
        next = trimmed;
      }
    }
    const current = target[column];
    if (next !== current) {
      updates.push(`${column} = ?`);
      sqlArgs.push(next);
      changes[column] = { from: current, to: next };
    }
  }

  if (updates.length === 0) {
    return jsonResponse({
      ok: true,
      changes: 0,
      order: publicOrderDetail(target, guard.session.user),
    });
  }

  updates.push("updated_at = datetime('now')");
  await ctx.env.DB.prepare(
    `UPDATE portal_orders SET ${updates.join(", ")} WHERE id = ?`,
  )
    .bind(...sqlArgs, id)
    .run();

  await recordAudit(ctx.env.DB, {
    userId: guard.session.user.id,
    action: "portal_order_updated",
    resourceType: "order",
    resourceId: String(id),
    metadata: {
      target_clinic_id: target.clinic_id,
      changes,
    },
    ipAddress: clientIp(ctx.request),
  });

  const fresh = await ctx.env.DB.prepare(
    "SELECT * FROM portal_orders WHERE id = ?",
  )
    .bind(id)
    .first<PortalOrderRow>();
  if (!fresh) {
    return jsonResponse(
      { error: "Order disappeared after update." },
      { status: 500 },
    );
  }

  return jsonResponse({
    ok: true,
    changes: updates.length - 1, // exclude updated_at sentinel
    order: publicOrderDetail(fresh, guard.session.user),
  });
};
