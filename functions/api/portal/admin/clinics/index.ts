/**
 * GET /api/portal/admin/clinics
 *
 * Lightweight clinic list for admin UIs (currently the Invite User modal).
 * aso_staff only. Returns id + name + contact_email + is_active sorted by
 * name; no pagination — there are <500 clinics today and the dropdown
 * doesn't need it.
 */

import { jsonResponse } from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

interface ClinicListRow {
  id: number;
  name: string;
  contact_email: string;
  is_active: number;
}

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const res = await ctx.env.DB.prepare(
    "SELECT id, name, contact_email, is_active FROM portal_clinics ORDER BY name COLLATE NOCASE ASC",
  ).all<ClinicListRow>();

  const clinics = (res.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    contact_email: r.contact_email,
    is_active: r.is_active === 1,
  }));

  return jsonResponse({ clinics });
};
