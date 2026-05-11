/**
 * PATCH /api/portal/admin/clinics/:id
 *
 * Single update endpoint for portal_clinics. Body may carry any subset
 * of: { name, contact_email, email_domain, aso_account_number,
 *       visualdlp_account_id, phone, address, is_active }.
 * Empty strings on optional fields are normalised to NULL.
 *
 * aso_staff only. There is no DELETE — clinics are deactivated
 * (is_active=false) rather than deleted so the orders + users that
 * reference them keep their foreign keys.
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import type {
  PagesFunction,
  PortalClinicRow,
  PortalEnv,
} from "../../_lib/types";

interface PatchBody {
  name?: unknown;
  contact_email?: unknown;
  email_domain?: unknown;
  aso_account_number?: unknown;
  visualdlp_account_id?: unknown;
  phone?: unknown;
  address?: unknown;
  is_active?: unknown;
}

/** "" or whitespace-only → null; otherwise the trimmed string. */
function normalizeOptional(v: unknown): string | null {
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
    return jsonResponse({ error: "Clinic not found." }, { status: 404 });
  }

  let body: PatchBody;
  try {
    body = (await ctx.request.json()) as PatchBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const targetMaybe = await ctx.env.DB.prepare(
    "SELECT * FROM portal_clinics WHERE id = ?",
  )
    .bind(id)
    .first<PortalClinicRow>();
  if (!targetMaybe) {
    return jsonResponse({ error: "Clinic not found." }, { status: 404 });
  }
  const target: PortalClinicRow = targetMaybe;

  const updates: string[] = [];
  const sqlArgs: unknown[] = [];
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  function maybeSet<K extends keyof PortalClinicRow>(
    column: K,
    raw: unknown,
    options: {
      required?: boolean;
      validate?: (v: string) => string | null; // returns error message or null
    } = {},
  ) {
    if (raw === undefined) return null;
    if (options.required && typeof raw === "string" && raw.trim().length === 0) {
      return `${String(column)} cannot be empty.`;
    }
    const next =
      options.required && typeof raw === "string"
        ? raw.trim()
        : normalizeOptional(raw);
    if (options.validate && typeof next === "string") {
      const err = options.validate(next);
      if (err) return err;
    }
    const current = target[column];
    if (next !== current) {
      updates.push(`${String(column)} = ?`);
      sqlArgs.push(next);
      changes[String(column)] = { from: current, to: next };
    }
    return null;
  }

  const nameErr = maybeSet("name", body.name, { required: true });
  if (nameErr) return jsonResponse({ error: nameErr }, { status: 400 });
  const emailErr = maybeSet("contact_email", body.contact_email, {
    required: true,
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "contact_email is not valid.",
  });
  if (emailErr) return jsonResponse({ error: emailErr }, { status: 400 });

  maybeSet("email_domain", body.email_domain);
  maybeSet("aso_account_number", body.aso_account_number);
  maybeSet("visualdlp_account_id", body.visualdlp_account_id);
  maybeSet("phone", body.phone);
  maybeSet("address", body.address);

  if (body.is_active !== undefined) {
    if (typeof body.is_active !== "boolean") {
      return jsonResponse(
        { error: "is_active must be a boolean." },
        { status: 400 },
      );
    }
    const desired = body.is_active ? 1 : 0;
    if (target.is_active !== desired) {
      updates.push("is_active = ?");
      sqlArgs.push(desired);
      changes.is_active = {
        from: target.is_active === 1,
        to: desired === 1,
      };
    }
  }

  if (updates.length === 0) {
    return jsonResponse({ ok: true, changes: 0 });
  }

  updates.push("updated_at = datetime('now')");
  try {
    await ctx.env.DB.prepare(
      `UPDATE portal_clinics SET ${updates.join(", ")} WHERE id = ?`,
    )
      .bind(...sqlArgs, id)
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique")) {
      return jsonResponse(
        { error: "Another clinic already uses that aso_account_number." },
        { status: 409 },
      );
    }
    return jsonResponse(
      { error: "Failed to update clinic." },
      { status: 500 },
    );
  }

  await recordAudit(ctx.env.DB, {
    userId: guard.session.user.id,
    action: "portal_clinic_updated",
    resourceType: "clinic",
    resourceId: String(id),
    metadata: { changes },
    ipAddress: clientIp(ctx.request),
  });

  const fresh = await ctx.env.DB.prepare(
    `SELECT c.id, c.name, c.email_domain, c.aso_account_number,
            c.visualdlp_account_id, c.contact_email, c.phone, c.address,
            c.is_active, c.created_at, c.updated_at,
            (SELECT COUNT(*) FROM portal_users u WHERE u.clinic_id = c.id) AS user_count
     FROM portal_clinics c WHERE c.id = ?`,
  )
    .bind(id)
    .first<{
      id: number;
      name: string;
      email_domain: string | null;
      aso_account_number: string | null;
      visualdlp_account_id: string | null;
      contact_email: string;
      phone: string | null;
      address: string | null;
      is_active: number;
      created_at: string;
      updated_at: string;
      user_count: number;
    }>();

  return jsonResponse({
    ok: true,
    changes: updates.length - 1, // exclude updated_at sentinel
    clinic: fresh && {
      id: fresh.id,
      name: fresh.name,
      email_domain: fresh.email_domain,
      aso_account_number: fresh.aso_account_number,
      visualdlp_account_id: fresh.visualdlp_account_id,
      contact_email: fresh.contact_email,
      phone: fresh.phone,
      address: fresh.address,
      is_active: fresh.is_active === 1,
      created_at: fresh.created_at,
      updated_at: fresh.updated_at,
      user_count: fresh.user_count,
    },
  });
};
