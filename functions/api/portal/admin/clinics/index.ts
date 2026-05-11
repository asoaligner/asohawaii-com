/**
 * /api/portal/admin/clinics
 *
 *   GET  — full clinic list with user_count + all editable fields
 *   POST — create a clinic
 *
 * aso_staff only. The Invite-user modal also calls GET; the extra fields
 * it doesn't render are harmless overhead.
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

interface ClinicListRow {
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
}

function publicClinic(r: ClinicListRow) {
  return {
    id: r.id,
    name: r.name,
    email_domain: r.email_domain,
    aso_account_number: r.aso_account_number,
    visualdlp_account_id: r.visualdlp_account_id,
    contact_email: r.contact_email,
    phone: r.phone,
    address: r.address,
    is_active: r.is_active === 1,
    created_at: r.created_at,
    updated_at: r.updated_at,
    user_count: r.user_count,
  };
}

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const res = await ctx.env.DB.prepare(
    `SELECT c.id, c.name, c.email_domain, c.aso_account_number,
            c.visualdlp_account_id, c.contact_email, c.phone, c.address,
            c.is_active, c.created_at, c.updated_at,
            (SELECT COUNT(*) FROM portal_users u WHERE u.clinic_id = c.id) AS user_count
     FROM portal_clinics c
     ORDER BY c.name COLLATE NOCASE ASC`,
  ).all<ClinicListRow>();

  const clinics = (res.results ?? []).map(publicClinic);
  return jsonResponse({ clinics });
};

interface CreateBody {
  name?: unknown;
  contact_email?: unknown;
  email_domain?: unknown;
  aso_account_number?: unknown;
  visualdlp_account_id?: unknown;
  phone?: unknown;
  address?: unknown;
}

function strOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  let body: CreateBody;
  try {
    body = (await ctx.request.json()) as CreateBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = strOrNull(body.name);
  if (!name) {
    return jsonResponse(
      { error: "Clinic name is required." },
      { status: 400 },
    );
  }
  const contactEmail = strOrNull(body.contact_email);
  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return jsonResponse(
      { error: "A valid contact_email is required." },
      { status: 400 },
    );
  }

  const emailDomain = strOrNull(body.email_domain);
  const asoAccountNumber = strOrNull(body.aso_account_number);
  const visualdlpAccountId = strOrNull(body.visualdlp_account_id);
  const phone = strOrNull(body.phone);
  const address = strOrNull(body.address);

  let newId: number | null = null;
  try {
    const result = await ctx.env.DB.prepare(
      `INSERT INTO portal_clinics
         (name, email_domain, aso_account_number, visualdlp_account_id,
          contact_email, phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        name,
        emailDomain,
        asoAccountNumber,
        visualdlpAccountId,
        contactEmail,
        phone,
        address,
      )
      .run();
    newId =
      result.meta?.last_row_id != null
        ? Number(result.meta.last_row_id)
        : null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique")) {
      return jsonResponse(
        { error: "A clinic with that aso_account_number already exists." },
        { status: 409 },
      );
    }
    return jsonResponse(
      { error: "Failed to create clinic." },
      { status: 500 },
    );
  }

  await recordAudit(ctx.env.DB, {
    userId: guard.session.user.id,
    action: "portal_clinic_created",
    resourceType: "clinic",
    resourceId: newId != null ? String(newId) : null,
    metadata: {
      name,
      contact_email: contactEmail,
      visualdlp_account_id: visualdlpAccountId,
      aso_account_number: asoAccountNumber,
    },
    ipAddress: clientIp(ctx.request),
  });

  return jsonResponse({ ok: true, id: newId });
};
