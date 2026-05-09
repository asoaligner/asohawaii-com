/**
 * POST /api/portal/auth/login
 * body: { email: string, password: string }
 *
 * Verifies password against portal_users.password_hash, creates a row in
 * portal_sessions, and returns the user + clinic with a Set-Cookie header
 * carrying the signed JWT. Failed attempts (no user / wrong password /
 * disabled user) all return the same generic 401 to avoid leaking whether
 * an email is registered, but the audit log records the specific reason.
 */

import bcrypt from "bcryptjs";
import {
  SESSION_TTL_SECONDS,
  buildSessionCookie,
  clientIp,
  jsonResponse,
  publicClinic,
  publicUser,
  recordAudit,
  signSessionJwt,
} from "../_lib/auth";
import type {
  PagesFunction,
  PortalClinicRow,
  PortalEnv,
  PortalUserRow,
} from "../_lib/types";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

function genericFail(): Response {
  return jsonResponse({ error: "Invalid email or password." }, { status: 401 });
}

/** RFC 4122 v4 UUID via crypto.randomUUID (available in Workers). */
function newSessionId(): string {
  return crypto.randomUUID();
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for portal auth." },
      { status: 500 },
    );
  }

  let body: LoginBody;
  try {
    body = (await ctx.request.json()) as LoginBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonResponse(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const ip = clientIp(ctx.request);
  const userAgent = ctx.request.headers.get("User-Agent");

  const user = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE email = ?",
  )
    .bind(email)
    .first<PortalUserRow>();

  if (!user || !user.password_hash || user.is_active !== 1) {
    await recordAudit(ctx.env.DB, {
      userId: user?.id ?? null,
      action: "login_failed",
      metadata: {
        reason: !user
          ? "no_user"
          : !user.password_hash
            ? "no_password_hash"
            : "user_disabled",
        email,
      },
      ipAddress: ip,
    });
    return genericFail();
  }

  let ok = false;
  try {
    ok = await bcrypt.compare(password, user.password_hash);
  } catch {
    ok = false;
  }
  if (!ok) {
    await recordAudit(ctx.env.DB, {
      userId: user.id,
      action: "login_failed",
      metadata: { reason: "bad_password", email },
      ipAddress: ip,
    });
    return genericFail();
  }

  const clinic = await ctx.env.DB.prepare(
    "SELECT * FROM portal_clinics WHERE id = ?",
  )
    .bind(user.clinic_id)
    .first<PortalClinicRow>();
  if (!clinic) {
    await recordAudit(ctx.env.DB, {
      userId: user.id,
      action: "login_failed",
      metadata: { reason: "missing_clinic", email },
      ipAddress: ip,
    });
    return genericFail();
  }

  const sid = newSessionId();
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const expiresAtIso = new Date(expiresAtSeconds * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  await ctx.env.DB.prepare(
    "INSERT INTO portal_sessions (id, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(sid, user.id, expiresAtIso, ip, userAgent)
    .run();

  await ctx.env.DB.prepare(
    "UPDATE portal_users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
  )
    .bind(user.id)
    .run();

  await recordAudit(ctx.env.DB, {
    userId: user.id,
    action: "login_success",
    resourceType: "session",
    resourceId: sid,
    ipAddress: ip,
  });

  const token = await signSessionJwt(
    { sid, uid: user.id },
    ctx.env.JWT_SECRET,
  );

  return jsonResponse(
    { user: publicUser(user), clinic: publicClinic(clinic) },
    { headers: { "Set-Cookie": buildSessionCookie(token) } },
  );
};
