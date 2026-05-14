/**
 * POST /api/portal/admin/pending-users/[id]/reject  (aso_staff)
 *
 * Marks a portal access application as rejected with a stated reason.
 * The reason is shown verbatim in the applicant-facing email and stored
 * on the row, so it is also visible in the queue history.
 *
 * Body: { reason: string }
 *
 * The 24h re-application cooldown is enforced on the next apply (see
 * apply.ts) — this endpoint just records the rejection.
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../../../_lib/auth";
import { requireAsoStaff } from "../../../_lib/admin";
import { accessRejectedEmail, sendEmail } from "../../../_lib/email";
import type { PagesFunction, PortalEnv } from "../../../_lib/types";

interface RejectBody {
  reason?: unknown;
}

interface PendingRow {
  id: number;
  email: string;
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

  let body: RejectBody;
  try {
    body = (await ctx.request.json()) as RejectBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const reason =
    typeof body.reason === "string" ? body.reason.trim() : "";
  if (!reason) {
    return jsonResponse(
      { error: "A rejection reason is required (shown to the applicant)." },
      { status: 400 },
    );
  }
  if (reason.length > 2000) {
    return jsonResponse(
      { error: "Reason is too long (max 2000 chars)." },
      { status: 400 },
    );
  }

  const ip = clientIp(ctx.request);

  const pending = await ctx.env.DB.prepare(
    `SELECT id, email, name, doctor_name, clinic_name, status
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

  await ctx.env.DB.prepare(
    `UPDATE portal_pending_users
       SET status = 'rejected',
           reviewed_at = datetime('now'),
           reviewed_by_user_id = ?,
           rejection_reason = ?
     WHERE id = ?`,
  )
    .bind(session.user.id, reason, pendingId)
    .run();

  let emailSentOk = false;
  let emailError: string | null = null;
  let resendId: string | null = null;

  if (ctx.env.RESEND_API_KEY) {
    const tpl = accessRejectedEmail({
      applicantName: pending.doctor_name ?? pending.name,
      clinicName: pending.clinic_name,
      reason,
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
    action: "portal_access_rejected",
    resourceType: "pending_user",
    resourceId: String(pendingId),
    metadata: {
      email: pending.email,
      clinic_name: pending.clinic_name,
      reason,
      email_sent: emailSentOk,
      email_error: emailError,
      resend_id: resendId,
    },
    ipAddress: ip,
  });

  return jsonResponse({
    ok: true,
    pending_id: pendingId,
    email_sent: emailSentOk,
  });
};
