/**
 * GET /api/portal/orders
 *
 * Query params:
 *   page          1-indexed, default 1
 *   limit         default 20, hard cap 100
 *   search        matches order_number OR patient_name (case-insensitive LIKE)
 *   source        'visualdlp' | 'shop' (any other value rejected)
 *   dateFrom      ISO date 'YYYY-MM-DD' — order_date >= this
 *   dateTo        ISO date 'YYYY-MM-DD' — order_date <= this
 *   applianceType exact match on appliance_type
 *
 * Access control:
 *   - member / admin → restricted to their own clinic_id
 *   - aso_staff      → cross-clinic (no clinic filter)
 *
 * Response: { orders: PortalOrderListItem[], total, page, limit }
 *
 * Ordering: order_date DESC, id DESC (stable on ties / null dates).
 */

import {
  buildClearCookie,
  jsonResponse,
  resolveSession,
} from "../_lib/auth";
import {
  isCrossClinicViewer,
  publicOrderListItem,
  type PortalOrderRow,
} from "../_lib/orders";
import type { PagesFunction, PortalEnv } from "../_lib/types";

const ALLOWED_SOURCES = new Set(["visualdlp", "shop"]);

// Whitelist of sortable columns → safe SQL expression. Hard-coded to
// prevent injection; an attacker cannot ORDER BY anything not listed.
// `id` is appended unconditionally as a tiebreaker so paging stays
// stable when many rows share the same sort value.
const SORT_COLUMNS = new Map<string, string>([
  ["order_date", "order_date"],
  ["delivery_date", "delivery_date"],
  ["order_number", "order_number"],
  ["patient_name", "patient_name"],
  ["appliance_type", "appliance_type"],
  ["source", "source"],
]);

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  if (raw === null) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

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

  const url = new URL(ctx.request.url);
  const page = clampInt(url.searchParams.get("page"), 1, 1, 10000);
  const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
  const search = (url.searchParams.get("search") ?? "").trim();
  const sourceParam = url.searchParams.get("source");
  const dateFrom = (url.searchParams.get("dateFrom") ?? "").trim();
  const dateTo = (url.searchParams.get("dateTo") ?? "").trim();
  const applianceType = (url.searchParams.get("applianceType") ?? "").trim();
  const sortParam = (url.searchParams.get("sort") ?? "order_date").trim();
  const sortDir = (url.searchParams.get("dir") ?? "desc").trim().toLowerCase();

  if (sourceParam && !ALLOWED_SOURCES.has(sourceParam)) {
    return jsonResponse(
      { error: "source must be 'visualdlp' or 'shop'." },
      { status: 400 },
    );
  }
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
  if (!SORT_COLUMNS.has(sortParam)) {
    return jsonResponse(
      { error: `sort must be one of: ${Array.from(SORT_COLUMNS.keys()).join(", ")}.` },
      { status: 400 },
    );
  }
  if (sortDir !== "asc" && sortDir !== "desc") {
    return jsonResponse(
      { error: "dir must be 'asc' or 'desc'." },
      { status: 400 },
    );
  }

  const where: string[] = [];
  const args: unknown[] = [];

  if (!isCrossClinicViewer(resolved.user)) {
    where.push("clinic_id = ?");
    args.push(resolved.user.clinic_id);
  }
  if (sourceParam) {
    where.push("source = ?");
    args.push(sourceParam);
  }
  if (dateFrom) {
    where.push("order_date >= ?");
    args.push(dateFrom);
  }
  if (dateTo) {
    where.push("order_date <= ?");
    args.push(dateTo);
  }
  if (applianceType) {
    where.push("appliance_type = ?");
    args.push(applianceType);
  }
  if (search) {
    where.push("(order_number LIKE ? OR patient_name LIKE ?)");
    const pattern = `%${search}%`;
    args.push(pattern, pattern);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS c FROM portal_orders ${whereSql}`,
  )
    .bind(...args)
    .first<{ c: number }>();
  const total = totalRow?.c ?? 0;

  const offset = (page - 1) * limit;
  // SORT_COLUMNS is a hard-coded whitelist, so direct interpolation is
  // safe (no user-controlled SQL). NULLs go last regardless of direction
  // so blank order_date / appliance rows don't displace populated data
  // at the top of a desc sort.
  const sortCol = SORT_COLUMNS.get(sortParam) as string;
  const dirSql = sortDir === "asc" ? "ASC" : "DESC";
  const orderBySql = `ORDER BY (${sortCol} IS NULL) ASC, ${sortCol} ${dirSql}, id DESC`;
  const listRes = await ctx.env.DB.prepare(
    `SELECT * FROM portal_orders ${whereSql} ${orderBySql} LIMIT ? OFFSET ?`,
  )
    .bind(...args, limit, offset)
    .all<PortalOrderRow>();

  const orders = (listRes.results ?? []).map(publicOrderListItem);

  return jsonResponse({ orders, total, page, limit });
};
