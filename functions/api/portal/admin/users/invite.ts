/**
 * POST /api/portal/admin/users/invite
 *
 * aso_staff issues an invitation for a new portal user. Phase 1.4
 * decisions:
 *   - 7-day TTL
 *   - clinic can be selected by id OR created on the fly via new_clinic_name
 *   - invitation email carries clinic name + inviter name
 *   - role limited to 'member' / 'admin' (aso_staff cannot be invited
 *     through this flow — internal hires get the seed-script path)
 *
 * Pre-conditions:
 *   - email must not match any existing portal_users row
 *   - clinic_id (if provided) must exist
 *   - new_clinic_name (if provided) must be non-empty; clinic is created
 *     with contact_email = the invitee's email so a sane default exists
 *
 * Side effects:
 *   - any pending (un-used, un-revoked, un-expired) invitations for the
 *     same email are revoked first so only one "live" link exists
 *   - the new invitation row is inserted
 *   - the email is dispatched via Resend
 *   - audit `portal_user_invited` (success) or `portal_user_invite_failed`
 */

import bcrypt from "bcryptjs"; // unused — kept for parity with reset/forgot
import {
  clientIp,
  generateOpaqueToken,
  jsonResponse,
  recordAudit,
  sha256Hex,
} from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import { invitationEmail, sendEmail } from "../../_lib/email";
import type {
  PagesFunction,
  PortalClinicRow,
  PortalEnv,
} from "../../_lib/types";

// bcrypt is imported only so TypeScript and future password-pre-hash
// support stays consistent across these admin files; the issue flow
// itself never hashes a password.
void bcrypt;

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SITE_ORIGIN = "https://asohawaii.com";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isoSqlDatetime(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function humanExpiresLabel(d: Date): string {
  // "on Mon May 18, 2026" — friendly enough for the invitation email body.
  return `on ${d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

interface InviteBody {
  email?: unknown;
  name?: unknown;
  clinic_id?: unknown;
  new_clinic_name?: unknown;
  role?: unknown;
  locale?: unknown;
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;
  const session = guard.session;

  if (!ctx.env.RESEND_API_KEY) {
    return jsonResponse(
      { error: "Email sending is not configured." },
      { status: 500 },
    );
  }

  let body: InviteBody;
  try {
    body = (await ctx.request.json()) as InviteBody;
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

  const name = typeof body.name === "string" ? body.name.trim() || null : null;

  const role: "member" | "admin" =
    body.role === "admin" ? "admin" : "member";

  const locale: "en" | "ja" = body.locale === "ja" ? "ja" : "en";

  const ip = clientIp(ctx.request);

  // Refuse if a portal_users row with this email already exists.
  const existing = await ctx.env.DB.prepare(
    "SELECT id FROM portal_users WHERE email = ?",
  )
    .bind(email)
    .first<{ id: number }>();
  if (existing) {
    return jsonResponse(
      { error: "A user with this email already exists." },
      { status: 409 },
    );
  }

  // Resolve clinic — either pick an existing one or create a new one.
  let clinicId: number | null = null;
  let clinicName: string | null = null;

  const rawClinicId =
    typeof body.clinic_id === "number"
      ? body.clinic_id
      : typeof body.clinic_id === "string" && body.clinic_id.trim() !== ""
        ? Number.parseInt(body.clinic_id, 10)
        : null;
  const newClinicName =
    typeof body.new_clinic_name === "string"
      ? body.new_clinic_name.trim()
      : "";

  if (rawClinicId != null && Number.isFinite(rawClinicId)) {
    const row = await ctx.env.DB.prepare(
      "SELECT id, name FROM portal_clinics WHERE id = ?",
    )
      .bind(rawClinicId)
      .first<Pick<PortalClinicRow, "id" | "name">>();
    if (!row) {
      return jsonResponse(
        { error: "Clinic not found." },
        { status: 404 },
      );
    }
    clinicId = row.id;
    clinicName = row.name;
  } else if (newClinicName) {
    const result = await ctx.env.DB.prepare(
      "INSERT INTO portal_clinics (name, contact_email) VALUES (?, ?)",
    )
      .bind(newClinicName, email)
      .run();
    clinicId =
      result.meta?.last_row_id != null
        ? Number(result.meta.last_row_id)
        : null;
    clinicName = newClinicName;
    if (clinicId == null) {
      return jsonResponse(
        { error: "Failed to create clinic." },
        { status: 500 },
      );
    }
  } else {
    return jsonResponse(
      { error: "Either clinic_id or new_clinic_name is required." },
      { status: 400 },
    );
  }

  // Revoke any prior pending invitation for the same email so only one
  // live link exists at a time. Includes invitations to OTHER clinics
  // since the email is unique across portal_users on accept.
  await ctx.env.DB.prepare(
    `UPDATE portal_invitations
     SET revoked_at = datetime('now')
     WHERE email = ? AND used_at IS NULL AND revoked_at IS NULL`,
  )
    .bind(email)
    .run();

  const rawToken = generateOpaqueToken();
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const expiresAtSql = isoSqlDatetime(expiresAt);

  const insertResult = await ctx.env.DB.prepare(
    `INSERT INTO portal_invitations
       (email, name, clinic_id, role, inviter_user_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      email,
      name,
      clinicId,
      role,
      session.user.id,
      tokenHash,
      expiresAtSql,
    )
    .run();
  const invitationId =
    insertResult.meta?.last_row_id != null
      ? Number(insertResult.meta.last_row_id)
      : null;

  const requestUrl = new URL(ctx.request.url);
  const origin = `${requestUrl.protocol}//${requestUrl.host}`;
  const acceptUrl = `${origin}/portal/accept-invite/?token=${encodeURIComponent(rawToken)}`;
  // Production-facing email link should still use the canonical origin
  // for non-preview deploys.
  const linkForEmail = requestUrl.host.endsWith(".pages.dev")
    ? acceptUrl
    : `${SITE_ORIGIN}/portal/accept-invite/?token=${encodeURIComponent(rawToken)}`;

  const emailOrigin = requestUrl.host.endsWith(".pages.dev")
    ? origin
    : SITE_ORIGIN;
  const tpl = invitationEmail({
    recipientName: name,
    inviterName: session.user.name?.trim() || session.user.email,
    clinicName: clinicName ?? "your clinic",
    role,
    acceptUrl: linkForEmail,
    expiresHumanLabel: humanExpiresLabel(expiresAt),
    siteOrigin: emailOrigin,
    locale,
  });

  const sent = await sendEmail(ctx.env, {
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  if (!sent.ok) {
    await recordAudit(ctx.env.DB, {
      userId: session.user.id,
      action: "portal_user_invite_failed",
      resourceType: "invitation",
      resourceId: invitationId != null ? String(invitationId) : null,
      metadata: {
        email,
        clinic_id: clinicId,
        clinic_name: clinicName,
        role,
        locale,
        error: sent.error,
      },
      ipAddress: ip,
    });
    return jsonResponse(
      { error: "Failed to send invitation email. Please try again." },
      { status: 502 },
    );
  }

  await recordAudit(ctx.env.DB, {
    userId: session.user.id,
    action: "portal_user_invited",
    resourceType: "invitation",
    resourceId: invitationId != null ? String(invitationId) : null,
    metadata: {
      email,
      clinic_id: clinicId,
      clinic_name: clinicName,
      role,
      locale,
      resend_id: sent.id,
      expires_at: expiresAtSql,
    },
    ipAddress: ip,
  });

  return jsonResponse({
    ok: true,
    invitation_id: invitationId,
    email_sent: true,
    expires_at: expiresAtSql,
  });
};
