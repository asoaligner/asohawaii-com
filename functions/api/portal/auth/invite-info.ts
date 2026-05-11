/**
 * GET /api/portal/auth/invite-info?token=<token>
 *
 * Public endpoint used by /portal/accept-invite/ to render the
 * invitation context (clinic name, inviter name, role, expiry) before
 * the recipient enters their password. Token is looked up by SHA-256
 * hash; bad / expired / used / revoked tokens all collapse to a single
 * generic 404 so an attacker can't probe which tokens were ever issued.
 */

import { jsonResponse, sha256Hex } from "../_lib/auth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

interface InvitationRow {
  id: number;
  email: string;
  name: string | null;
  clinic_id: number;
  role: string;
  inviter_user_id: number | null;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
}

interface ClinicNameRow {
  name: string;
}

interface InviterNameRow {
  name: string | null;
  email: string;
}

function notFound(): Response {
  return jsonResponse(
    { error: "This invitation is invalid or has expired." },
    { status: 404 },
  );
}

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  if (!token) {
    return notFound();
  }

  const tokenHash = await sha256Hex(token);
  const row = await ctx.env.DB.prepare(
    `SELECT id, email, name, clinic_id, role, inviter_user_id,
            expires_at, used_at, revoked_at
     FROM portal_invitations WHERE token_hash = ?`,
  )
    .bind(tokenHash)
    .first<InvitationRow>();
  if (!row) return notFound();
  if (row.used_at || row.revoked_at) return notFound();

  const expiresMs = Date.parse(row.expires_at.replace(" ", "T") + "Z");
  if (Number.isNaN(expiresMs) || expiresMs < Date.now()) return notFound();

  const clinic = await ctx.env.DB.prepare(
    "SELECT name FROM portal_clinics WHERE id = ?",
  )
    .bind(row.clinic_id)
    .first<ClinicNameRow>();

  let inviterName: string | null = null;
  if (row.inviter_user_id) {
    const inviter = await ctx.env.DB.prepare(
      "SELECT name, email FROM portal_users WHERE id = ?",
    )
      .bind(row.inviter_user_id)
      .first<InviterNameRow>();
    inviterName = inviter ? inviter.name || inviter.email : null;
  }

  return jsonResponse({
    email: row.email,
    name: row.name,
    clinic_name: clinic?.name ?? null,
    role: row.role,
    inviter_name: inviterName,
    expires_at: row.expires_at,
  });
};
