/**
 * GET /api/portal/admin/audit
 *
 * Cross-clinic action history. aso_staff only.
 *
 * Query params:
 *   page          1-indexed, default 1
 *   limit         default 50, hard cap 200 (audit rows are dense)
 *   action        exact match on `action`
 *   userId        numeric id, or 'system' for user_id IS NULL
 *   dateFrom      YYYY-MM-DD — created_at >= dateFrom 00:00:00
 *   dateTo        YYYY-MM-DD — created_at <= dateTo 23:59:59
 *   search        LIKE match against action or metadata text
 *
 * Response: { logs, total, page, limit, actions }
 *   - `logs`    rows joined with portal_users for display (email + name)
 *   - `actions` distinct action values, for the filter dropdown
 *
 * Ordering: id DESC. id is monotonic with INSERTs so this is also
 * created_at DESC without depending on the text sort of a TEXT column.
 */

import { jsonResponse } from "../_lib/auth";
import { requireAsoStaff } from "../_lib/admin";
import type { PagesFunction, PortalEnv } from "../_lib/types";

function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (raw === null) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

interface AuditRowJoined {
  id: number;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: string | null;
  ip_address: string | null;
  created_at: string;
}

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const url = new URL(ctx.request.url);
  const page = clampInt(url.searchParams.get("page"), 1, 1, 10000);
  const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
  const action = (url.searchParams.get("action") ?? "").trim();
  const userIdRaw = (url.searchParams.get("userId") ?? "").trim();
  const dateFrom = (url.searchParams.get("dateFrom") ?? "").trim();
  const dateTo = (url.searchParams.get("dateTo") ?? "").trim();
  const search = (url.searchParams.get("search") ?? "").trim();

  if (dateFrom && !isYmd(dateFrom)) {
    return jsonResponse(
      { error: "dateFrom must be YYYY-MM-DD." },
      { status: 400 },
    );
  }
  if (dateTo && !isYmd(dateTo)) {
    return jsonResponse(
      { error: "dateTo must be YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const where: string[] = [];
  const args: unknown[] = [];

  if (action) {
    where.push("a.action = ?");
    args.push(action);
  }
  if (userIdRaw) {
    if (userIdRaw === "system") {
      where.push("a.user_id IS NULL");
    } else {
      const uid = Number.parseInt(userIdRaw, 10);
      if (!Number.isFinite(uid)) {
        return jsonResponse(
          { error: "userId must be a number or 'system'." },
          { status: 400 },
        );
      }
      where.push("a.user_id = ?");
      args.push(uid);
    }
  }
  if (dateFrom) {
    where.push("a.created_at >= ?");
    args.push(`${dateFrom} 00:00:00`);
  }
  if (dateTo) {
    where.push("a.created_at <= ?");
    args.push(`${dateTo} 23:59:59`);
  }
  if (search) {
    where.push("(a.metadata LIKE ? OR a.action LIKE ?)");
    const pattern = `%${search}%`;
    args.push(pattern, pattern);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS c FROM portal_audit_logs a ${whereSql}`,
  )
    .bind(...args)
    .first<{ c: number }>();
  const total = totalRow?.c ?? 0;

  const offset = (page - 1) * limit;
  const listRes = await ctx.env.DB.prepare(
    `SELECT a.id, a.user_id, u.email AS user_email, u.name AS user_name,
            a.action, a.resource_type, a.resource_id, a.metadata,
            a.ip_address, a.created_at
     FROM portal_audit_logs a
     LEFT JOIN portal_users u ON u.id = a.user_id
     ${whereSql}
     ORDER BY a.id DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(...args, limit, offset)
    .all<AuditRowJoined>();

  const logs = (listRes.results ?? []).map((r) => {
    let metadata: unknown = null;
    if (r.metadata) {
      try {
        metadata = JSON.parse(r.metadata);
      } catch {
        metadata = r.metadata;
      }
    }
    return {
      id: r.id,
      user_id: r.user_id,
      user_email: r.user_email,
      user_name: r.user_name,
      action: r.action,
      resource_type: r.resource_type,
      resource_id: r.resource_id,
      metadata,
      ip_address: r.ip_address,
      created_at: r.created_at,
    };
  });

  const actionsRes = await ctx.env.DB.prepare(
    "SELECT DISTINCT action FROM portal_audit_logs ORDER BY action ASC",
  ).all<{ action: string }>();
  const actions = (actionsRes.results ?? []).map((r) => r.action);

  return jsonResponse({ logs, total, page, limit, actions });
};
