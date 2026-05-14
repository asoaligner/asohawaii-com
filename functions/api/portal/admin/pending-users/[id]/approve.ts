/**
 * POST /api/portal/admin/pending-users/[id]/approve  (aso_staff)
 *
 * Approves a portal access application. Creates a portal_users row
 * (auth_provider='google' if google_id is present on the pending row,
 * otherwise 'password' so the user goes through forgot-password to set
 * their initial password — same flow as a passwordless invite accept).
 *
 * Body: { clinic_id: number, role?: 'member' | 'admin' }
 *
 * The clinic_id MUST be picked by the admin (memory spec) — there is
 * no fuzzy-match auto-resolution. The applicant's self-reported
 * clinic_name is just a hint; the admin's selection wins.
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../../../_lib/auth";
import { requireAsoStaff } from "../../../_lib/admin";
import { accessApprovedEmail, sendEmail } from "../../../_lib/email";
import type { PagesFunction, PortalEnv } from "../../../_lib/types";

const SITE_ORIGIN = "https://asohawaii.com";

interface ApproveBody {
  clinic_id?: unknown;
  role?: unknown;
}

interface PendingRow {
  id: number;
  email: string;
  google_id: string | null;
  name: string | null;
  doctor_name: string | null;
  clinic_name: string;
  status: "pending" | "approved" | "rejected";
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;
  const session = guard.session;

  const idParam = ctx.params.id;
  const pendingId = Number.parseInt(
    typeof idParam === "string" ? idParam : "",
    10,
  );
  if (!Number.isFinite(pendingId) || pendingId <= 0) {
    return jsonResponse({ error: "Invalid pending id." }, { status: 400 });
  }

  let body: ApproveBody;
  try {
    body = (await ctx.request.json()) as ApproveBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const clinicId =
    typeof body.clinic_id === "number"
      ? body.clinic_id
      : typeof body.clinic_id === "string"
        ? Number.parseInt(body.clinic_id, 10)
        : Number.NaN;
  if (!Number.isFinite(clinicId) || clinicId <= 0) {
    return jsonResponse(
      { error: "A valid clinic_id is required." },
      { status: 400 },
    );
  }

  const role: "member" | "admin" = body.role === "admin" ? "admin" : "member";

  const ip = clientIp(ctx.request);

  const pending = await ctx.env.DB.prepare(
    `SELECT id, email, google_id, name, doctor_name, clinic_name, status
     FROM portal_pending_users WHERE id = ?`,
  )
    .bind(pendingId)
    .first<PendingRow>();
  if (!pending) {
    return jsonResponse(
      { error: "Pending application not found." },
      { status: 404 },
    );
  }
  if (pending.status !== "pending") {
    return jsonResponse(
      {
        error: `This application is already ${pending.status}. Refresh the queue.`,
      },
      { status: 409 },
    );
  }

  const clinic = await ctx.env.DB.prepare(
    "SELECT id, name FROM portal_clinics WHERE id = ?",
  )
    .bind(clinicId)
    .first<{ id: number; name: string }>();
  if (!clinic) {
    return jsonResponse({ error: "Clinic not found." }, { status: 404 });
  }

  // If a user already exists for this email, treat this as a
  // clinic-linking request (the applicant is currently logged in and
  // asking to be moved to a different clinic). Approving updates their
  // clinic_id + role rather than inserting a new portal_users row.
  const existingUser = await ctx.env.DB.prepare(
    "SELECT id, clinic_id, role, auth_provider, google_id FROM portal_users WHERE email = ?",
  )
    .bind(pending.email)
    .first<{
      id: number;
      clinic_id: number;
      role: "member" | "admin" | "aso_staff";
      auth_provider: string | null;
      google_id: string | null;
    }>();

  let newUserId: number;
  let authProvider: "google" | "password";
  const isLinkingRequest = !!existingUser;

  if (existingUser) {
    // Linking request — refuse to touch aso_staff rows (they should
    // never be re-clinic-ed through this flow) and otherwise UPDATE.
    if (existingUser.role === "aso_staff") {
      return jsonResponse(
        {
          error:
            "Cannot move an ASO staff user via this flow. Edit clinic_id directly in /portal/admin/users/.",
        },
        { status: 409 },
      );
    }
    await ctx.env.DB.prepare(
      `UPDATE portal_users
         SET clinic_id = ?, role = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(clinic.id, role, existingUser.id)
      .run();
    // If the pending row carries a google_id and the existing row
    // doesn't, link them now.
    if (pending.google_id && !existingUser.google_id) {
      await ctx.env.DB.prepare(
        "UPDATE portal_users SET google_id = ?, updated_at = datetime('now') WHERE id = ?",
      )
        .bind(pending.google_id, existingUser.id)
        .run();
    }
    newUserId = existingUser.id;
    authProvider =
      existingUser.auth_provider === "google" || pending.google_id
        ? "google"
        : "password";
  } else {
    authProvider = pending.google_id ? "google" : "password";
    const finalName = pending.name ?? pending.doctor_name ?? null;
    const insertUser = await ctx.env.DB.prepare(
      `INSERT INTO portal_users
         (clinic_id, email, name, role, auth_provider, google_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
    )
      .bind(
        clinic.id,
        pending.email,
        finalName,
        role,
        authProvider,
        pending.google_id,
      )
      .run();
    const id =
      insertUser.meta?.last_row_id != null
        ? Number(insertUser.meta.last_row_id)
        : null;
    if (!id) {
      return jsonResponse(
        { error: "Failed to create the portal user. Please retry." },
        { status: 500 },
      );
    }
    newUserId = id;
  }

  await ctx.env.DB.prepare(
    `UPDATE portal_pending_users
       SET status = 'approved',
           reviewed_at = datetime('now'),
           reviewed_by_user_id = ?,
           approved_clinic_id = ?,
           migrated_user_id = ?
     WHERE id = ?`,
  )
    .bind(session.user.id, clinic.id, newUserId, pendingId)
    .run();

  let emailSentOk = false;
  let emailError: string | null = null;
  let resendId: string | null = null;

  if (ctx.env.RESEND_API_KEY) {
    const tpl = accessApprovedEmail({
      applicantName: pending.doctor_name ?? pending.name,
      clinicName: clinic.name,
      signInUrl: `${SITE_ORIGIN}/portal/`,
      authProvider,
    });
    const sent = await sendEmail(ctx.env, {
      to: pending.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    emailSentOk = sent.ok;
    if (sent.ok) resendId = sent.id;
    else emailError = sent.error;
  }

  await recordAudit(ctx.env.DB, {
    userId: session.user.id,
    action: "portal_access_approved",
    resourceType: "pending_user",
    resourceId: String(pendingId),
    metadata: {
      email: pending.email,
      clinic_id: clinic.id,
      clinic_name: clinic.name,
      role,
      auth_provider: authProvider,
      new_user_id: newUserId,
      is_linking_request: isLinkingRequest,
      email_sent: emailSentOk,
      email_error: emailError,
      resend_id: resendId,
    },
    ipAddress: ip,
  });

  return jsonResponse({
    ok: true,
    pending_id: pendingId,
    new_user_id: newUserId,
    clinic_id: clinic.id,
    is_linking_request: isLinkingRequest,
    email_sent: emailSentOk,
  });
};
