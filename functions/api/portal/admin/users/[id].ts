/**
 * PATCH /api/portal/admin/users/:id
 *
 * Single-call admin update for a portal_users row. Body may carry any
 * subset of: { role, is_active }. Each transition records its own audit
 * action so a "promote to admin then deactivate" is two log entries.
 *
 * Guards:
 *   - aso_staff only (via requireAsoStaff)
 *   - cannot change own role (no self-demote / lockout)
 *   - cannot deactivate own account (same reason)
 *   - cannot grant aso_staff via this flow — internal hires go through
 *     the seed script with explicit intent. Demoting an existing
 *     aso_staff to member/admin IS allowed (for stepping back access).
 *
 * Deactivation drops all active sessions for the target so they're
 * signed out of every device immediately.
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import type {
  PagesFunction,
  PortalEnv,
  PortalUserRow,
} from "../../_lib/types";

interface PatchBody {
  role?: unknown;
  is_active?: unknown;
}

const ASSIGNABLE_ROLES = new Set(["member", "admin"]); // see header comment

export const onRequestPatch: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;
  const me = guard.session.user;

  const idParam = ctx.params.id;
  const id = Number.parseInt(typeof idParam === "string" ? idParam : "", 10);
  if (!Number.isFinite(id) || id <= 0) {
    return jsonResponse({ error: "User not found." }, { status: 404 });
  }

  let body: PatchBody;
  try {
    body = (await ctx.request.json()) as PatchBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const target = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE id = ?",
  )
    .bind(id)
    .first<PortalUserRow>();
  if (!target) {
    return jsonResponse({ error: "User not found." }, { status: 404 });
  }

  const updates: string[] = [];
  const sqlArgs: unknown[] = [];
  const auditChanges: Record<string, { from: unknown; to: unknown }> = {};

  // ── role ──
  if (body.role !== undefined) {
    if (typeof body.role !== "string") {
      return jsonResponse(
        { error: "role must be a string." },
        { status: 400 },
      );
    }
    const newRole = body.role.trim();
    if (!ASSIGNABLE_ROLES.has(newRole)) {
      return jsonResponse(
        {
          error:
            "role must be 'member' or 'admin'. (aso_staff can't be assigned here.)",
        },
        { status: 400 },
      );
    }
    if (target.id === me.id && target.role !== newRole) {
      return jsonResponse(
        { error: "You can't change your own role." },
        { status: 403 },
      );
    }
    if (target.role !== newRole) {
      updates.push("role = ?");
      sqlArgs.push(newRole);
      auditChanges.role = { from: target.role, to: newRole };
    }
  }

  // ── is_active ──
  if (body.is_active !== undefined) {
    if (typeof body.is_active !== "boolean") {
      return jsonResponse(
        { error: "is_active must be a boolean." },
        { status: 400 },
      );
    }
    const desired = body.is_active ? 1 : 0;
    if (target.id === me.id && desired === 0) {
      return jsonResponse(
        { error: "You can't deactivate your own account." },
        { status: 403 },
      );
    }
    if (target.is_active !== desired) {
      updates.push("is_active = ?");
      sqlArgs.push(desired);
      auditChanges.is_active = {
        from: target.is_active === 1,
        to: desired === 1,
      };
    }
  }

  if (updates.length === 0) {
    return jsonResponse({ ok: true, changes: 0 });
  }

  updates.push("updated_at = datetime('now')");
  await ctx.env.DB.prepare(
    `UPDATE portal_users SET ${updates.join(", ")} WHERE id = ?`,
  )
    .bind(...sqlArgs, id)
    .run();

  // If we just deactivated, kill every active session for this user.
  let revokedSessions = 0;
  if (auditChanges.is_active && auditChanges.is_active.to === false) {
    const r = await ctx.env.DB.prepare(
      "DELETE FROM portal_sessions WHERE user_id = ?",
    )
      .bind(id)
      .run();
    revokedSessions = r.meta?.changes ?? 0;
  }

  await recordAudit(ctx.env.DB, {
    userId: me.id,
    action: "portal_user_updated",
    resourceType: "user",
    resourceId: String(id),
    metadata: {
      target_email: target.email,
      target_clinic_id: target.clinic_id,
      changes: auditChanges,
      revoked_sessions: revokedSessions,
    },
    ipAddress: clientIp(ctx.request),
  });

  // Re-read for the response so the UI shows the canonical post-update
  // state without a follow-up GET.
  const fresh = await ctx.env.DB.prepare(
    `SELECT u.id, u.clinic_id, c.name AS clinic_name, u.email, u.name,
            u.role, u.auth_provider,
            CASE WHEN u.password_hash IS NULL OR u.password_hash = ''
                 THEN 0 ELSE 1 END AS has_password,
            u.is_active, u.last_login_at, u.created_at
     FROM portal_users u
     LEFT JOIN portal_clinics c ON c.id = u.clinic_id
     WHERE u.id = ?`,
  )
    .bind(id)
    .first<{
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
    }>();

  return jsonResponse({
    ok: true,
    changes: updates.length - 1, // exclude updated_at sentinel
    revoked_sessions: revokedSessions,
    user: fresh && {
      id: fresh.id,
      clinic_id: fresh.clinic_id,
      clinic_name: fresh.clinic_name,
      email: fresh.email,
      name: fresh.name,
      role: fresh.role,
      auth_provider: fresh.auth_provider,
      has_password: fresh.has_password === 1,
      is_active: fresh.is_active === 1,
      last_login_at: fresh.last_login_at,
      created_at: fresh.created_at,
    },
  });
};
