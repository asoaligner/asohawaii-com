/**
 * POST /api/portal/auth/accept-invite
 * body: { token: string, password: string, name?: string }
 *
 * Consumes an invitation token issued by /api/portal/admin/users/invite.
 * On success:
 *   - bcrypt-hashes the chosen password
 *   - INSERTs portal_users with auth_provider='password' and is_active=1
 *   - marks the invitation used_at + used_by_user_id
 *   - creates a session and returns the Set-Cookie so the recipient
 *     lands signed-in at /portal/dashboard/
 *
 * All failure paths (bad / used / expired / revoked token, email
 * conflict appearing between issue and accept) collapse to a generic
 * error message to avoid leaking which tokens were valid. The audit
 * log keeps the actual reason for post-hoc investigation.
 */

import bcrypt from "bcryptjs";
import {
  clientIp,
  createSessionForUser,
  jsonResponse,
  recordAudit,
  sha256Hex,
} from "../_lib/auth";
import type {
  PagesFunction,
  PortalEnv,
  PortalUserRow,
} from "../_lib/types";

const MIN_PASSWORD_LENGTH = 10;

interface Body {
  token?: unknown;
  password?: unknown;
  name?: unknown;
}

interface InvitationRow {
  id: number;
  email: string;
  name: string | null;
  clinic_id: number;
  role: "member" | "admin" | "aso_staff";
  inviter_user_id: number | null;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
}

function invitationFailed(
  message = "This invitation is invalid or has expired.",
): Response {
  return jsonResponse({ error: message }, { status: 400 });
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for portal auth." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await ctx.request.json()) as Body;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const displayName =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : null;

  if (!token) return invitationFailed();
  if (!password) {
    return jsonResponse(
      { error: "Password is required." },
      { status: 400 },
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonResponse(
      {
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  const ip = clientIp(ctx.request);
  const tokenHash = await sha256Hex(token);

  const row = await ctx.env.DB.prepare(
    `SELECT id, email, name, clinic_id, role, inviter_user_id,
            expires_at, used_at, revoked_at
     FROM portal_invitations WHERE token_hash = ?`,
  )
    .bind(tokenHash)
    .first<InvitationRow>();

  if (!row) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "portal_invite_accept_failed",
      metadata: { reason: "invalid_token" },
      ipAddress: ip,
    });
    return invitationFailed();
  }
  if (row.used_at || row.revoked_at) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "portal_invite_accept_failed",
      metadata: {
        reason: row.used_at ? "already_used" : "revoked",
        invitation_id: row.id,
      },
      ipAddress: ip,
    });
    return invitationFailed();
  }
  const expiresMs = Date.parse(row.expires_at.replace(" ", "T") + "Z");
  if (Number.isNaN(expiresMs) || expiresMs < Date.now()) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "portal_invite_accept_failed",
      metadata: { reason: "expired", invitation_id: row.id },
      ipAddress: ip,
    });
    return invitationFailed();
  }

  // Defensive: refuse if a user with this email has been created since
  // the invitation was issued. (Should be rare — admin couldn't issue an
  // invite when a row existed, but a parallel password-reset signup or
  // OAuth-only account could race in.)
  const conflict = await ctx.env.DB.prepare(
    "SELECT id FROM portal_users WHERE email = ?",
  )
    .bind(row.email)
    .first<{ id: number }>();
  if (conflict) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "portal_invite_accept_failed",
      metadata: {
        reason: "email_conflict",
        invitation_id: row.id,
        email: row.email,
      },
      ipAddress: ip,
    });
    return invitationFailed(
      "An account with this email already exists. Please sign in.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const finalName = displayName ?? row.name ?? null;

  const insertResult = await ctx.env.DB.prepare(
    `INSERT INTO portal_users
       (clinic_id, email, name, role, auth_provider, password_hash, is_active)
     VALUES (?, ?, ?, ?, 'password', ?, 1)`,
  )
    .bind(row.clinic_id, row.email, finalName, row.role, passwordHash)
    .run();
  const newUserId =
    insertResult.meta?.last_row_id != null
      ? Number(insertResult.meta.last_row_id)
      : null;
  if (!newUserId) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "portal_invite_accept_failed",
      metadata: { reason: "user_insert_failed", invitation_id: row.id },
      ipAddress: ip,
    });
    return jsonResponse(
      { error: "Failed to create account. Please try again." },
      { status: 500 },
    );
  }

  await ctx.env.DB.prepare(
    "UPDATE portal_invitations SET used_at = datetime('now'), used_by_user_id = ? WHERE id = ?",
  )
    .bind(newUserId, row.id)
    .run();

  // Hydrate the freshly-inserted row to feed createSessionForUser.
  const newUser = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE id = ?",
  )
    .bind(newUserId)
    .first<PortalUserRow>();
  if (!newUser) {
    return jsonResponse(
      { error: "Failed to create session. Please sign in manually." },
      { status: 500 },
    );
  }

  const session = await createSessionForUser(
    ctx.env.DB,
    newUser,
    ctx.env.JWT_SECRET,
    ctx.request,
  );

  await recordAudit(ctx.env.DB, {
    userId: newUserId,
    action: "portal_invite_accepted",
    resourceType: "invitation",
    resourceId: String(row.id),
    metadata: {
      clinic_id: row.clinic_id,
      role: row.role,
      session_id: session.sessionId,
    },
    ipAddress: ip,
  });

  return jsonResponse(
    { ok: true, redirect: "/portal/dashboard/" },
    { headers: { "Set-Cookie": session.cookie } },
  );
};
