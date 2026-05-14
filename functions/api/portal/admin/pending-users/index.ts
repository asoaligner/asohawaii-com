/**
 * GET /api/portal/admin/pending-users  (aso_staff)
 *
 * Phase 2.1 review queue. Lists portal_pending_users rows joined with
 * reviewer + approved_clinic info. Filtered by status; defaults to
 * 'pending' so the admin lands on the work queue.
 *
 * Query params:
 *   status?  'pending' | 'approved' | 'rejected' | 'all'  (default 'pending')
 *   q?       LIKE filter on email / clinic_name / doctor_name
 *
 * No pagination today — application volume is low (<10/day expected).
 */

import { jsonResponse } from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

interface PendingRow {
  id: number;
  email: string;
  google_id: string | null;
  name: string | null;
  doctor_name: string | null;
  clinic_name: string;
  aso_account_number: string | null;
  easyrx_email: string | null;
  reason: string | null;
  ip_address: string | null;
  attempted_at: string;
  admin_notified_at: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  reviewed_by_user_id: number | null;
  reviewer_email: string | null;
  reviewer_name: string | null;
  approved_clinic_id: number | null;
  approved_clinic_name: string | null;
  rejection_reason: string | null;
  migrated_user_id: number | null;
  created_at: string;
}

const ALLOWED_STATUS = new Set(["pending", "approved", "rejected", "all"]);

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const url = new URL(ctx.request.url);
  const status = (url.searchParams.get("status") ?? "pending").trim();
  const q = (url.searchParams.get("q") ?? "").trim();

  if (!ALLOWED_STATUS.has(status)) {
    return jsonResponse(
      { error: "status must be 'pending', 'approved', 'rejected', or 'all'." },
      { status: 400 },
    );
  }

  const where: string[] = [];
  const args: unknown[] = [];

  if (status !== "all") {
    where.push("p.status = ?");
    args.push(status);
  }
  if (q) {
    where.push("(p.email LIKE ? OR p.clinic_name LIKE ? OR p.doctor_name LIKE ?)");
    const pattern = `%${q}%`;
    args.push(pattern, pattern, pattern);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      p.id, p.email, p.google_id, p.name, p.doctor_name, p.clinic_name,
      p.aso_account_number, p.easyrx_email, p.reason, p.ip_address,
      p.attempted_at, p.admin_notified_at,
      p.status, p.reviewed_at, p.reviewed_by_user_id,
      reviewer.email AS reviewer_email, reviewer.name AS reviewer_name,
      p.approved_clinic_id,
      clinic.name AS approved_clinic_name,
      p.rejection_reason, p.migrated_user_id, p.created_at
    FROM portal_pending_users p
    LEFT JOIN portal_users reviewer ON reviewer.id = p.reviewed_by_user_id
    LEFT JOIN portal_clinics clinic ON clinic.id = p.approved_clinic_id
    ${whereSql}
    ORDER BY
      CASE WHEN p.status = 'pending' THEN 0 ELSE 1 END,
      p.id DESC
  `;

  const rows = await ctx.env.DB.prepare(sql)
    .bind(...args)
    .all<PendingRow>();

  // Status counts (always returned so the UI can show queue badges
  // even when filtered).
  const counts = await ctx.env.DB.prepare(
    `SELECT status, COUNT(*) AS n FROM portal_pending_users GROUP BY status`,
  ).all<{ status: string; n: number }>();
  const statusCounts: Record<string, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  for (const r of counts.results ?? []) {
    statusCounts[r.status] = r.n;
  }

  return jsonResponse({
    ok: true,
    pending_users: rows.results ?? [],
    counts: statusCounts,
  });
};
