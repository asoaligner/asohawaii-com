/**
 * POST /api/portal/auth/forgot-password
 * body: { email: string }
 *
 * Always responds 200 regardless of whether the email matches a row,
 * is disabled, or sending failed — so an attacker can't probe for
 * registered emails. The audit log keeps the actual reason.
 *
 * Token model: 32-byte random base64url token in the email link;
 * SHA-256 hash of that token is what we store. Even if the
 * portal_password_reset_tokens table leaks, the raw tokens needed to
 * mint reset URLs cannot be recovered.
 *
 * TTL: 1 hour. Single-use (used_at gate enforced by the reset endpoint).
 */

import {
  clientIp,
  generateOpaqueToken,
  jsonResponse,
  recordAudit,
  sha256Hex,
} from "../_lib/auth";
import { passwordResetEmail, sendEmail } from "../_lib/email";
import type {
  PagesFunction,
  PortalEnv,
  PortalUserRow,
} from "../_lib/types";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

interface Body {
  email?: unknown;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Build YYYY-MM-DD HH:MM:SS in UTC, matching the convention used by
 *  the rest of the schema (datetime('now')). */
function isoSqlDatetime(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  let body: Body;
  try {
    body = (await ctx.request.json()) as Body;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !isValidEmail(email)) {
    return jsonResponse(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  const ip = clientIp(ctx.request);
  // Always return 200 — never branch on result so the timing/response
  // does not reveal account existence.
  const successResponse = jsonResponse({ success: true });

  const user = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE email = ?",
  )
    .bind(email)
    .first<PortalUserRow>();

  if (!user || user.is_active !== 1) {
    await recordAudit(ctx.env.DB, {
      userId: user?.id ?? null,
      action: "password_reset_requested",
      metadata: {
        outcome: !user ? "no_user" : "user_disabled",
        email,
      },
      ipAddress: ip,
    });
    return successResponse;
  }

  const rawToken = generateOpaqueToken();
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = isoSqlDatetime(new Date(Date.now() + RESET_TOKEN_TTL_MS));

  await ctx.env.DB.prepare(
    "INSERT INTO portal_password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
  )
    .bind(user.id, tokenHash, expiresAt)
    .run();

  // Build the reset URL from the request's own origin so Preview deploys
  // produce links pointing at the same Preview host (don't accidentally
  // send a Production URL to a Preview-test user).
  const requestUrl = new URL(ctx.request.url);
  const resetUrl = `${requestUrl.protocol}//${requestUrl.host}/portal/reset-password/?token=${encodeURIComponent(rawToken)}`;

  const { html, text } = passwordResetEmail({
    recipientName: user.name,
    resetUrl,
  });

  const sent = await sendEmail(ctx.env, {
    to: email,
    subject: "Reset your ASO Hawaii Portal password",
    html,
    text,
  });

  await recordAudit(ctx.env.DB, {
    userId: user.id,
    action: "password_reset_requested",
    metadata: {
      outcome: sent.ok ? "email_sent" : "email_failed",
      resendId: sent.ok ? sent.id : undefined,
      error: sent.ok ? undefined : sent.error,
    },
    ipAddress: ip,
  });

  return successResponse;
};
