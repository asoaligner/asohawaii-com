/**
 * POST /api/portal/orders/:id/question
 *
 * "Ask about this case" — authenticated clinic users (or aso_staff) send
 * a free-text question tied to a specific order. The lab gets a Resend
 * email at PORTAL_EMAIL_REPLY_TO (default aso-digital@outlook.com); the
 * email's Reply-To is the asker's address so a reply lands in their
 * inbox.
 *
 * Same access model as GET /api/portal/orders/[id]: members/admins are
 * scoped to their clinic; aso_staff can ask about any order. Out-of-scope
 * collapses to 404 to avoid id enumeration across clinics.
 *
 * Body: { message: string }   — 1..4000 chars after trim
 *
 * Audit: portal_order_question_sent on success, with metadata
 * { resend_id, message_length, recipient }.
 */

import {
  buildClearCookie,
  clientIp,
  jsonResponse,
  recordAudit,
  resolveSession,
} from "../../_lib/auth";
import {
  orderQuestionEmail,
  sendEmail,
} from "../../_lib/email";
import {
  isCrossClinicViewer,
  type PortalOrderRow,
} from "../../_lib/orders";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

const MIN_LEN = 1;
const MAX_LEN = 4000;
const SITE_ORIGIN = "https://asohawaii.com";

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for portal auth." },
      { status: 500 },
    );
  }

  const session = await resolveSession(
    ctx.request,
    ctx.env.DB,
    ctx.env.JWT_SECRET,
  );
  if (!session) {
    return jsonResponse(
      { error: "Not authenticated." },
      { status: 401, headers: { "Set-Cookie": buildClearCookie() } },
    );
  }

  if (!ctx.env.RESEND_API_KEY) {
    return jsonResponse(
      { error: "Email sending is not configured." },
      { status: 500 },
    );
  }

  const idParam = ctx.params.id;
  const id = Number.parseInt(typeof idParam === "string" ? idParam : "", 10);
  if (!Number.isFinite(id) || id <= 0) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  let body: { message?: unknown };
  try {
    body = (await ctx.request.json()) as { message?: unknown };
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.message !== "string") {
    return jsonResponse(
      { error: "message is required." },
      { status: 400 },
    );
  }
  const message = body.message.trim();
  if (message.length < MIN_LEN) {
    return jsonResponse(
      { error: "message cannot be empty." },
      { status: 400 },
    );
  }
  if (message.length > MAX_LEN) {
    return jsonResponse(
      { error: `message must be ${MAX_LEN} characters or fewer.` },
      { status: 400 },
    );
  }

  // Load the order with the same access scoping as the detail endpoint.
  const row = await ctx.env.DB.prepare(
    "SELECT * FROM portal_orders WHERE id = ?",
  )
    .bind(id)
    .first<PortalOrderRow>();
  if (!row) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }
  if (
    !isCrossClinicViewer(session.user) &&
    row.clinic_id !== session.user.clinic_id
  ) {
    return jsonResponse({ error: "Order not found." }, { status: 404 });
  }

  // Compose + send.
  const fromName = session.user.name?.trim() || session.user.email;
  const fromEmail = session.user.email;
  const orderNumber = row.order_number ?? `#${row.id}`;
  const portalUrl = `${SITE_ORIGIN}/portal/orders/?id=${row.id}`;

  const tpl = orderQuestionEmail({
    fromName,
    fromEmail,
    clinicName: session.clinic.name,
    orderNumber,
    orderId: row.id,
    patientName: row.patient_name,
    applianceType: row.appliance_type,
    source: row.source,
    orderDate: row.order_date,
    deliveryDate: row.delivery_date,
    portalOrderUrl: portalUrl,
    message,
  });

  const labRecipient =
    ctx.env.PORTAL_EMAIL_REPLY_TO || "aso-digital@outlook.com";

  const result = await sendEmail(ctx.env, {
    to: labRecipient,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    replyTo: fromEmail,
  });

  if (!result.ok) {
    await recordAudit(ctx.env.DB, {
      userId: session.user.id,
      action: "portal_order_question_failed",
      resourceType: "order",
      resourceId: String(row.id),
      metadata: {
        recipient: labRecipient,
        message_length: message.length,
        error: result.error,
      },
      ipAddress: clientIp(ctx.request),
    });
    return jsonResponse(
      { error: "Failed to send your question. Please try again." },
      { status: 502 },
    );
  }

  await recordAudit(ctx.env.DB, {
    userId: session.user.id,
    action: "portal_order_question_sent",
    resourceType: "order",
    resourceId: String(row.id),
    metadata: {
      recipient: labRecipient,
      resend_id: result.id,
      message_length: message.length,
    },
    ipAddress: clientIp(ctx.request),
  });

  return jsonResponse({ ok: true });
};
