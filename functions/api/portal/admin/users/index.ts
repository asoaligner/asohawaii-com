/**
 * GET /api/portal/admin/users
 *
 * aso_staff list of all portal_users with clinic name joined. Includes
 * inactive rows (filtered in the UI). Ordered most-recent-login first,
 * NULLs (never logged in) at the end.
 *
 * No pagination today — there are <50 portal users; revisit at 500+.
 *
 * Query params:
 *   q?       case-insensitive LIKE on email / name (optional)
 *   role?    'member' | 'admin' | 'aso_staff'    (optional)
 *   clinic?  clinic_id                            (optional)
 *   include? 'active' (default) | 'all' | 'inactive'
 */

import { jsonResponse } from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

interface AdminUserRow {
  id: number;
  clinic_id: number;
  clinic_name: string | null;
  email: string;
  name: string | null;
  role: "member" | "admin" | "aso_staff";
  auth_provider: string | null;
  has_password: number;
  is_active: number;
  last_login_at: string | null;
  created_at: string;
}

const ALLOWED_ROLES = new Set(["member", "admin", "aso_staff"]);
const ALLOWED_INCLUDE = new Set(["active", "inactive", "all"]);

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const url = new URL(ctx.request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const roleParam = (url.searchParams.get("role") ?? "").trim();
  const clinicRaw = (url.searchParams.get("clinic") ?? "").trim();
  const includeParam = (url.searchParams.get("include") ?? "active").trim();

  if (roleParam && !ALLOWED_ROLES.has(roleParam)) {
    return jsonResponse({ error: "Invalid role filter." }, { status: 400 });
  }
  if (!ALLOWED_INCLUDE.has(includeParam)) {
    return jsonResponse(
      { error: "include must be 'active', 'inactive', or 'all'." },
      { status: 400 },
    );
  }

  const where: string[] = [];
  const args: unknown[] = [];

  if (includeParam === "active") {
    where.push("u.is_active = 1");
  } else if (includeParam === "inactive") {
    where.push("u.is_active = 0");
  }
  if (roleParam) {
    where.push("u.role = ?");
    args.push(roleParam);
  }
  if (clinicRaw) {
    const cid = Number.parseInt(clinicRaw, 10);
    if (!Number.isFinite(cid)) {
      return jsonResponse(
        { error: "clinic must be numeric." },
        { status: 400 },
      );
    }
    where.push("u.clinic_id = ?");
    args.push(cid);
  }
  if (q) {
    where.push("(u.email LIKE ? OR u.name LIKE ?)");
    const pattern = `%${q}%`;
    args.push(pattern, pattern);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const res = await ctx.env.DB.prepare(
    `SELECT u.id, u.clinic_id, c.name AS clinic_name, u.email, u.name,
            u.role, u.auth_provider,
            CASE WHEN u.password_hash IS NULL OR u.password_hash = ''
                 THEN 0 ELSE 1 END AS has_password,
            u.is_active, u.last_login_at, u.created_at
     FROM portal_users u
     LEFT JOIN portal_clinics c ON c.id = u.clinic_id
     ${whereSql}
     ORDER BY u.last_login_at IS NULL, u.last_login_at DESC, u.id DESC`,
  )
    .bind(...args)
    .all<AdminUserRow>();

  const users = (res.results ?? []).map((r) => ({
    id: r.id,
    clinic_id: r.clinic_id,
    clinic_name: r.clinic_name,
    email: r.email,
    name: r.name,
    role: r.role,
    auth_provider: r.auth_provider,
    has_password: r.has_password === 1,
    is_active: r.is_active === 1,
    last_login_at: r.last_login_at,
    created_at: r.created_at,
  }));

  return jsonResponse({ users });
};
