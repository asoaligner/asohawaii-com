/**
 * POST /api/portal/auth/apply  (public, no session)
 *
 * Phase 2.1 — self-service access application. Anyone can submit this
 * form; aso_staff approves/rejects later. The form lives at
 * /portal/request-access/ and is reachable either directly or via the
 * Google OAuth callback when an unrecognised email tries to sign in.
 *
 * Spam / abuse controls:
 *   • Same email with a pending row → 409 "already in queue"
 *   • Same email rejected within 24h → 429 "please call us"
 *   • Google-OAuth prefill is honoured if a short-lived `apply_prefill`
 *     cookie is present (set by the Google callback). The cookie is a
 *     plain JSON blob; we trust the email it contains only because the
 *     applicant could just type that same email themselves — there's
 *     no privilege escalation from forging it.
 *
 * Side effects:
 *   • portal_pending_users row inserted (status='pending')
 *   • Two Resend emails dispatched (best-effort):
 *       1. Receipt confirmation to the applicant
 *       2. New-application notification to PORTAL_EMAIL_REPLY_TO
 *   • Audit `portal_access_applied` (no user_id since applicant is
 *     anonymous at this point)
 */

import {
  clientIp,
  jsonResponse,
  readCookie,
  recordAudit,
  resolveSession,
} from "../_lib/auth";
import {
  accessApplicationReceivedEmail,
  newApplicationNotifyEmail,
  sendEmail,
} from "../_lib/email";
import {
  APPLY_PREFILL_COOKIE,
  buildClearApplyPrefillCookie,
  verifyApplyPrefill,
} from "../_lib/oauth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

const SITE_ORIGIN = "https://asohawaii.com";
const REJECTION_COOLDOWN_HOURS = 24;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function trimOrNull(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

interface ApplyBody {
  email?: unknown;
  name?: unknown;
  doctor_name?: unknown;
  clinic_name?: unknown;
  aso_account_number?: unknown;
  easyrx_email?: unknown;
  reason?: unknown;
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  let body: ApplyBody;
  try {
    body = (await ctx.request.json()) as ApplyBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = trimOrNull(body.email, 200)?.toLowerCase() ?? "";
  if (!email || !isValidEmail(email)) {
    return jsonResponse(
      { error: "A valid email address is required." },
      { status: 400 },
    );
  }

  const clinicName = trimOrNull(body.clinic_name, 200);
  if (!clinicName) {
    return jsonResponse(
      { error: "Clinic name is required." },
      { status: 400 },
    );
  }

  const doctorName = trimOrNull(body.doctor_name, 200);
  if (!doctorName) {
    return jsonResponse(
      { error: "Doctor name is required." },
      { status: 400 },
    );
  }

  const name = trimOrNull(body.name, 200);
  const asoAccountNumber = trimOrNull(body.aso_account_number, 50);
  const easyrxEmail = trimOrNull(body.easyrx_email, 200);
  if (easyrxEmail && !isValidEmail(easyrxEmail)) {
    return jsonResponse(
      { error: "EasyRx email is not a valid email address." },
      { status: 400 },
    );
  }
  const reason = trimOrNull(body.reason, 2000);

  const ip = clientIp(ctx.request);
  const userAgent = ctx.request.headers.get("user-agent")?.slice(0, 400) ?? null;

  // Detect a logged-in caller. If they're applying for their *own*
  // email, treat this as a "clinic linking" request: the existing user
  // already has access, but their portal_users.clinic_id points at the
  // wrong (or placeholder) clinic, and they want ASO to move them.
  const session = await resolveSession(
    ctx.request,
    ctx.env.DB,
    ctx.env.JWT_SECRET,
  );
  const sessionUserId = session?.user.id ?? null;
  const sessionUserEmail = session?.user.email.toLowerCase() ?? null;
  const sessionClinicId = session?.user.clinic_id ?? null;
  const sessionClinicName = session?.clinic.name ?? null;

  const existingUser = await ctx.env.DB.prepare(
    "SELECT id FROM portal_users WHERE email = ? AND is_active = 1",
  )
    .bind(email)
    .first<{ id: number }>();

  const isLinkingRequest =
    !!existingUser &&
    sessionUserId != null &&
    existingUser.id === sessionUserId &&
    sessionUserEmail === email;

  if (existingUser && !isLinkingRequest) {
    return jsonResponse(
      {
        error:
          "An account with this email already exists. Please sign in instead.",
      },
      { status: 409 },
    );
  }

  // Refuse if there's already a pending application for this email.
  const existingPending = await ctx.env.DB.prepare(
    "SELECT id FROM portal_pending_users WHERE email = ? AND status = 'pending' ORDER BY id DESC LIMIT 1",
  )
    .bind(email)
    .first<{ id: number }>();
  if (existingPending) {
    return jsonResponse(
      {
        error:
          "An application from this email is already in review. We'll be in touch within one business day.",
      },
      { status: 409 },
    );
  }

  // 24h cooldown after most recent rejection (per memory spec).
  const recentRejection = await ctx.env.DB.prepare(
    `SELECT id, reviewed_at FROM portal_pending_users
       WHERE email = ? AND status = 'rejected'
       ORDER BY id DESC LIMIT 1`,
  )
    .bind(email)
    .first<{ id: number; reviewed_at: string | null }>();
  if (recentRejection?.reviewed_at) {
    const rejectedAtMs = Date.parse(
      recentRejection.reviewed_at.replace(" ", "T") + "Z",
    );
    if (Number.isFinite(rejectedAtMs)) {
      const cooldownMs = REJECTION_COOLDOWN_HOURS * 60 * 60 * 1000;
      const elapsedMs = Date.now() - rejectedAtMs;
      if (elapsedMs < cooldownMs) {
        return jsonResponse(
          {
            error:
              "We recently reviewed an application from this email. Please call 808-957-0111 to discuss before reapplying.",
          },
          { status: 429 },
        );
      }
    }
  }

  // Optional signed Google prefill cookie — if the email in the form
  // matches the one we signed during the OAuth callback, attach the
  // verified google_id so approval can link the new portal_users row to
  // that Google account. JWT signature means a forged cookie can't claim
  // someone else's google_id.
  const prefillJwt = readCookie(ctx.request, APPLY_PREFILL_COOKIE);
  const prefill = prefillJwt
    ? await verifyApplyPrefill(prefillJwt, ctx.env.JWT_SECRET)
    : null;
  const googleId =
    prefill?.email.toLowerCase() === email ? prefill.google_id : null;
  const prefillName =
    prefill?.email.toLowerCase() === email ? prefill.name : null;

  const insert = await ctx.env.DB.prepare(
    `INSERT INTO portal_pending_users
       (email, google_id, name, doctor_name, clinic_name,
        aso_account_number, easyrx_email, reason,
        ip_address, user_agent, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
  )
    .bind(
      email,
      googleId,
      name ?? prefillName,
      doctorName,
      clinicName,
      asoAccountNumber,
      easyrxEmail,
      reason,
      ip,
      userAgent,
    )
    .run();
  const pendingId =
    insert.meta?.last_row_id != null ? Number(insert.meta.last_row_id) : null;
  if (!pendingId) {
    return jsonResponse(
      { error: "Failed to save your application. Please try again." },
      { status: 500 },
    );
  }

  // Best-effort notifications. Failure does NOT roll back the insert —
  // the row is the source of truth; admins can still see it via the
  // pending-users dashboard.
  const adminTo =
    ctx.env.PORTAL_EMAIL_REPLY_TO?.trim() || "aso-digital@outlook.com";
  const reviewUrl = `${SITE_ORIGIN}/portal/admin/pending-users/?id=${pendingId}`;
  const guideUrl = `${SITE_ORIGIN}/portal/guide/`;

  let applicantSendOk = false;
  let adminSendOk = false;
  let applicantSendError: string | null = null;
  let adminSendError: string | null = null;

  if (ctx.env.RESEND_API_KEY) {
    const applicantTpl = accessApplicationReceivedEmail({
      applicantName: doctorName,
      clinicName,
      guideUrl,
    });
    const sentToApplicant = await sendEmail(ctx.env, {
      to: email,
      subject: applicantTpl.subject,
      html: applicantTpl.html,
      text: applicantTpl.text,
    });
    applicantSendOk = sentToApplicant.ok;
    if (!sentToApplicant.ok) applicantSendError = sentToApplicant.error;

    const adminTpl = newApplicationNotifyEmail({
      pendingId,
      applicantEmail: email,
      applicantName: name ?? prefillName,
      doctorName,
      clinicName,
      asoAccountNumber,
      easyrxEmail,
      reason,
      googleLinked: !!googleId,
      reviewUrl,
      attemptedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      ipAddress: ip,
    });
    const sentToAdmin = await sendEmail(ctx.env, {
      to: adminTo,
      subject: adminTpl.subject,
      html: adminTpl.html,
      text: adminTpl.text,
    });
    adminSendOk = sentToAdmin.ok;
    if (!sentToAdmin.ok) adminSendError = sentToAdmin.error;

    if (adminSendOk) {
      await ctx.env.DB.prepare(
        "UPDATE portal_pending_users SET admin_notified_at = datetime('now') WHERE id = ?",
      )
        .bind(pendingId)
        .run();
    }
  }

  await recordAudit(ctx.env.DB, {
    userId: sessionUserId,
    action: isLinkingRequest
      ? "portal_clinic_linking_requested"
      : "portal_access_applied",
    resourceType: "pending_user",
    resourceId: String(pendingId),
    metadata: {
      email,
      clinic_name: clinicName,
      doctor_name: doctorName,
      aso_account_number: asoAccountNumber,
      easyrx_email: easyrxEmail,
      google_linked: !!googleId,
      is_linking_request: isLinkingRequest,
      current_user_id: sessionUserId,
      current_clinic_id: sessionClinicId,
      current_clinic_name: sessionClinicName,
      applicant_email_sent: applicantSendOk,
      applicant_email_error: applicantSendError,
      admin_email_sent: adminSendOk,
      admin_email_error: adminSendError,
    },
    ipAddress: ip,
  });

  const headers = new Headers();
  headers.append("Set-Cookie", buildClearApplyPrefillCookie());
  headers.set("Content-Type", "application/json");
  return new Response(
    JSON.stringify({
      ok: true,
      pending_id: pendingId,
    }),
    { status: 200, headers },
  );
};
