/**
 * POST /api/portal/profile/change-password
 * body: { currentPassword: string, newPassword: string }
 *
 * Verifies the current password, updates password_hash, and revokes all
 * OTHER sessions for this user (the current cookie stays valid so the
 * caller is not logged out by their own action). For the "reset password
 * via email" flow, see /api/portal/auth/reset-password — that one
 * deliberately revokes the current session too.
 *
 * Hard 400 when the user has no password set (Google-only account); they
 * must use the password-reset flow to opt in to password auth.
 */

import bcrypt from "bcryptjs";
import {
  buildClearCookie,
  clientIp,
  jsonResponse,
  recordAudit,
  resolveSession,
} from "../_lib/auth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

const MIN_PASSWORD_LENGTH = 10;

interface Body {
  currentPassword?: unknown;
  newPassword?: unknown;
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
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

  let body: Body;
  try {
    body = (await ctx.request.json()) as Body;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword) {
    return jsonResponse(
      { error: "Current password is required." },
      { status: 400 },
    );
  }
  if (!newPassword) {
    return jsonResponse(
      { error: "New password is required." },
      { status: 400 },
    );
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return jsonResponse(
      { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }
  if (newPassword === currentPassword) {
    return jsonResponse(
      { error: "New password must differ from the current password." },
      { status: 400 },
    );
  }

  const ip = clientIp(ctx.request);

  if (!resolved.user.password_hash) {
    await recordAudit(ctx.env.DB, {
      userId: resolved.user.id,
      action: "password_change_failed",
      metadata: { reason: "no_password_on_account" },
      ipAddress: ip,
    });
    return jsonResponse(
      {
        error:
          "This account has no password set. Use 'Forgot password?' on the sign-in page to set one.",
      },
      { status: 400 },
    );
  }

  let ok = false;
  try {
    ok = await bcrypt.compare(currentPassword, resolved.user.password_hash);
  } catch {
    ok = false;
  }
  if (!ok) {
    await recordAudit(ctx.env.DB, {
      userId: resolved.user.id,
      action: "password_change_failed",
      metadata: { reason: "wrong_current_password" },
      ipAddress: ip,
    });
    return jsonResponse(
      { error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await ctx.env.DB.prepare(
    "UPDATE portal_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
  )
    .bind(newHash, resolved.user.id)
    .run();

  // Kill every other session — keep the caller logged in.
  const revokeRes = await ctx.env.DB.prepare(
    "DELETE FROM portal_sessions WHERE user_id = ? AND id != ?",
  )
    .bind(resolved.user.id, resolved.session.id)
    .run();
  const revokedCount = revokeRes.meta?.changes ?? 0;

  await recordAudit(ctx.env.DB, {
    userId: resolved.user.id,
    action: "password_changed",
    metadata: { otherSessionsRevoked: revokedCount },
    ipAddress: ip,
  });

  return jsonResponse({ success: true, otherSessionsRevoked: revokedCount });
};
