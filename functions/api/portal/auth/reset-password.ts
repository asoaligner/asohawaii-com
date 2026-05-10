/**
 * POST /api/portal/auth/reset-password
 * body: { token: string, newPassword: string }
 *
 * Consumes a token issued by /forgot-password. On success:
 *   - bcrypt-hashes the new password and stores it
 *   - marks the token used_at so it cannot be replayed
 *   - revokes EVERY session for the user (defensive — assumes password
 *     reset means the previous credentials may be compromised)
 *
 * Refuses tokens that are: missing, malformed, hash-mismatched, already
 * used, or expired. Each path records a distinct audit reason so we can
 * tell brute-force probing from a normal flow in the logs.
 */

import bcrypt from "bcryptjs";
import {
  clientIp,
  jsonResponse,
  recordAudit,
  sha256Hex,
} from "../_lib/auth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

const MIN_PASSWORD_LENGTH = 10;

interface Body {
  token?: unknown;
  newPassword?: unknown;
}

interface TokenRow {
  id: number;
  user_id: number;
  expires_at: string;
  used_at: string | null;
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  let body: Body;
  try {
    body = (await ctx.request.json()) as Body;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!token) {
    return jsonResponse(
      { error: "Reset token is required." },
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
      {
        error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  const ip = clientIp(ctx.request);
  const tokenHash = await sha256Hex(token);

  const row = await ctx.env.DB.prepare(
    "SELECT id, user_id, expires_at, used_at FROM portal_password_reset_tokens WHERE token_hash = ?",
  )
    .bind(tokenHash)
    .first<TokenRow>();

  if (!row) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "password_reset_failed",
      metadata: { reason: "invalid_token" },
      ipAddress: ip,
    });
    return jsonResponse(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }
  if (row.used_at) {
    await recordAudit(ctx.env.DB, {
      userId: row.user_id,
      action: "password_reset_failed",
      metadata: { reason: "token_already_used" },
      ipAddress: ip,
    });
    return jsonResponse(
      { error: "This reset link has already been used." },
      { status: 400 },
    );
  }

  const expiresMs = Date.parse(row.expires_at.replace(" ", "T") + "Z");
  if (Number.isNaN(expiresMs) || expiresMs < Date.now()) {
    await recordAudit(ctx.env.DB, {
      userId: row.user_id,
      action: "password_reset_failed",
      metadata: { reason: "expired" },
      ipAddress: ip,
    });
    return jsonResponse(
      { error: "This reset link has expired. Request a new one." },
      { status: 400 },
    );
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await ctx.env.DB.prepare(
    "UPDATE portal_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
  )
    .bind(newHash, row.user_id)
    .run();

  await ctx.env.DB.prepare(
    "UPDATE portal_password_reset_tokens SET used_at = datetime('now') WHERE id = ?",
  )
    .bind(row.id)
    .run();

  // Defensive: drop ALL sessions for this user — the previous password
  // may have been the one that leaked.
  const revokeRes = await ctx.env.DB.prepare(
    "DELETE FROM portal_sessions WHERE user_id = ?",
  )
    .bind(row.user_id)
    .run();
  const revokedCount = revokeRes.meta?.changes ?? 0;

  await recordAudit(ctx.env.DB, {
    userId: row.user_id,
    action: "password_reset_succeeded",
    metadata: { sessionsRevoked: revokedCount },
    ipAddress: ip,
  });

  return jsonResponse({ success: true });
};
