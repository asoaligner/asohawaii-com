/**
 * Resend wrapper for portal transactional mail.
 *
 * One generic `sendEmail()` plus per-purpose helpers (currently just
 * password reset). Intentionally HTTP-direct rather than via the
 * @resend/node SDK so the function bundle stays tiny and we don't drag
 * a Node-leaning dep into the Workers runtime.
 *
 * Defaults: From = "ASO Hawaii Portal <noreply@asohawaii.com>",
 *           Reply-To = aso-digital@outlook.com.
 * Both can be overridden per-environment via PORTAL_EMAIL_FROM /
 * PORTAL_EMAIL_REPLY_TO if a Preview deploy needs different sending
 * identity (e.g. a staging address).
 */

const FROM_DEFAULT = "ASO Hawaii Portal <noreply@asohawaii.com>";
const REPLY_TO_DEFAULT = "aso-digital@outlook.com";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface EmailEnv {
  RESEND_API_KEY?: string;
  PORTAL_EMAIL_FROM?: string;
  PORTAL_EMAIL_REPLY_TO?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Per-call Reply-To override. Used by the order-question flow so the
   *  lab can reply directly to the asking user. Falls back to
   *  env.PORTAL_EMAIL_REPLY_TO / REPLY_TO_DEFAULT when omitted. */
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

export async function sendEmail(
  env: EmailEnv,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const from = env.PORTAL_EMAIL_FROM || FROM_DEFAULT;
  const replyTo =
    input.replyTo || env.PORTAL_EMAIL_REPLY_TO || REPLY_TO_DEFAULT;

  let res: Response;
  try {
    res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: replyTo,
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error contacting Resend.",
    };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Resend ${res.status}: ${body.slice(0, 300)}`,
    };
  }
  let id: string | null = null;
  try {
    const parsed = (await res.json()) as { id?: string };
    if (typeof parsed.id === "string") id = parsed.id;
  } catch {
    /* ignore — Resend sometimes returns empty body on 200 */
  }
  return { ok: true, id };
}

/**
 * Render the password reset email. Inline styles only — many mail
 * clients (Outlook desktop in particular) strip <style> blocks.
 */
export function passwordResetEmail(args: {
  recipientName: string | null;
  resetUrl: string;
}): { html: string; text: string } {
  const { recipientName, resetUrl } = args;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";

  const text = [
    greeting,
    "",
    "Someone requested a password reset for your ASO Hawaii Portal account.",
    "Click the link below to choose a new password:",
    "",
    resetUrl,
    "",
    "This link expires in 1 hour and can only be used once.",
    "",
    "If you didn't request this, you can safely ignore this email — your",
    "password won't change.",
    "",
    "— ASO Hawaii",
    "808-957-0111 · aso-digital@outlook.com",
  ].join("\n");

  // Pre-escape values that flow into HTML.
  const safeGreeting = escapeHtml(greeting);
  const safeUrl = escapeHtml(resetUrl);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Reset your ASO Hawaii Portal password</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 32px 24px">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:24px;line-height:1.3">Reset your password</h1>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">${safeGreeting}</p>
      <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6">Someone requested a password reset for your ASO Hawaii Portal account.</p>
      <p style="margin:24px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:500">Choose a new password</a>
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:12.5px;line-height:1.6">Or copy and paste this link into your browser:</p>
      <p style="margin:0 0 24px;color:#0F2942;font-size:12px;font-family:'SFMono-Regular',Consolas,monospace;word-break:break-all">${safeUrl}</p>
      <p style="margin:24px 0 0;color:#6b7280;font-size:12.5px;line-height:1.6">This link expires in <strong>1 hour</strong> and can only be used once.</p>
      <p style="margin:8px 0 0;color:#6b7280;font-size:12.5px;line-height:1.6">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </td></tr>
    <tr><td style="padding:16px 32px 0;color:#9ca3af;font-size:11.5px;line-height:1.5">
      ASO International Hawaii, Inc. · 1441 Kapiolani Blvd #1112, Honolulu HI 96814<br>
      808-957-0111 · aso-digital@outlook.com
    </td></tr>
  </table>
</body></html>`;

  return { html, text };
}

/**
 * Render an invitation email. The recipient clicks the link, lands on
 * /portal/accept-invite/?token=X, chooses a password, and a portal_users
 * row is created + signed in.
 */
export function invitationEmail(args: {
  recipientName: string | null;
  inviterName: string;
  clinicName: string;
  role: "member" | "admin" | "aso_staff";
  acceptUrl: string;
  expiresHumanLabel: string;
}): { html: string; text: string; subject: string } {
  const { recipientName, inviterName, clinicName, role, acceptUrl } = args;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const roleLabel =
    role === "admin"
      ? "clinic admin"
      : role === "aso_staff"
        ? "ASO staff"
        : "team member";
  const subject = `${inviterName} invited you to ASO Hawaii Doctor Portal`;

  const text = [
    greeting,
    "",
    `${inviterName} has invited you to join the ASO Hawaii Doctor Portal`,
    `for ${clinicName} as a ${roleLabel}.`,
    "",
    "Set a password to claim your account:",
    "",
    acceptUrl,
    "",
    `This invitation expires ${args.expiresHumanLabel}.`,
    "",
    "If you didn't expect this email, you can ignore it — no account",
    "will be created without you choosing a password.",
    "",
    "— ASO Hawaii",
    "808-957-0111 · aso-digital@outlook.com",
  ].join("\n");

  const safeGreeting = escapeHtml(greeting);
  const safeUrl = escapeHtml(acceptUrl);
  const safeInviter = escapeHtml(inviterName);
  const safeClinic = escapeHtml(clinicName);
  const safeRole = escapeHtml(roleLabel);
  const safeExpires = escapeHtml(args.expiresHumanLabel);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 32px 24px">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:24px;line-height:1.3">You're invited to the Doctor Portal</h1>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">${safeGreeting}</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6"><strong>${safeInviter}</strong> has invited you to join the ASO Hawaii Doctor Portal for <strong>${safeClinic}</strong> as a <strong>${safeRole}</strong>.</p>
      <p style="margin:24px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:500">Set your password</a>
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:12.5px;line-height:1.6">Or copy and paste this link into your browser:</p>
      <p style="margin:0 0 24px;color:#0F2942;font-size:12px;font-family:'SFMono-Regular',Consolas,monospace;word-break:break-all">${safeUrl}</p>
      <p style="margin:24px 0 0;color:#6b7280;font-size:12.5px;line-height:1.6">This invitation expires <strong>${safeExpires}</strong>.</p>
      <p style="margin:8px 0 0;color:#6b7280;font-size:12.5px;line-height:1.6">If you didn't expect this email, you can safely ignore it — no account is created until you choose a password.</p>
    </td></tr>
    <tr><td style="padding:16px 32px 0;color:#9ca3af;font-size:11.5px;line-height:1.5">
      ASO International Hawaii, Inc. · 1441 Kapiolani Blvd #1112, Honolulu HI 96814<br>
      808-957-0111 · aso-digital@outlook.com
    </td></tr>
  </table>
</body></html>`;

  return { html, text, subject };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render an "Ask about this case" email — clinic user asking the lab a
 * question about a specific order. The Reply-To is set to the asker's
 * email by the caller so the lab can hit Reply and land directly in the
 * user's inbox.
 */
export function orderQuestionEmail(args: {
  fromName: string;
  fromEmail: string;
  clinicName: string;
  orderNumber: string;
  orderId: number;
  patientName: string | null;
  applianceType: string | null;
  source: string;
  orderDate: string | null;
  deliveryDate: string | null;
  portalOrderUrl: string;
  message: string;
}): { html: string; text: string; subject: string } {
  const subject = `[Portal Question] ${args.orderNumber} — ${
    args.patientName ?? "no patient"
  }`;

  const text = [
    `New question from ${args.fromName} <${args.fromEmail}> (${args.clinicName})`,
    "",
    "ORDER",
    `  #${args.orderNumber}  (portal id ${args.orderId})`,
    `  Patient:   ${args.patientName ?? "—"}`,
    `  Appliance: ${args.applianceType ?? "—"}`,
    `  Source:    ${args.source}`,
    `  Order:     ${args.orderDate ?? "—"}`,
    `  Delivery:  ${args.deliveryDate ?? "—"}`,
    `  Portal:    ${args.portalOrderUrl}`,
    "",
    "QUESTION",
    args.message,
    "",
    "— Reply to this email to respond to the asker directly.",
  ].join("\n");

  const safeFromName = escapeHtml(args.fromName);
  const safeFromEmail = escapeHtml(args.fromEmail);
  const safeClinic = escapeHtml(args.clinicName);
  const safeOrderNum = escapeHtml(args.orderNumber);
  const safePatient = escapeHtml(args.patientName ?? "—");
  const safeAppliance = escapeHtml(args.applianceType ?? "—");
  const safeSource = escapeHtml(args.source);
  const safeOrderDate = escapeHtml(args.orderDate ?? "—");
  const safeDeliveryDate = escapeHtml(args.deliveryDate ?? "—");
  const safeUrl = escapeHtml(args.portalOrderUrl);
  const safeMessage = escapeHtml(args.message).replace(/\n/g, "<br>");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:24px 28px">
      <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.12em">Portal Question</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:22px;line-height:1.3">${safeOrderNum} · ${safePatient}</h1>
      <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.55">From <strong>${safeFromName}</strong> &lt;<a href="mailto:${safeFromEmail}" style="color:#0F2942">${safeFromEmail}</a>&gt; · ${safeClinic}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:0 0 18px">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px;width:90px">Appliance</td><td style="padding:6px 0;color:#0F2942;font-size:13px">${safeAppliance}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">Source</td><td style="padding:6px 0;color:#0F2942;font-size:13px">${safeSource}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">Order date</td><td style="padding:6px 0;color:#0F2942;font-size:13px">${safeOrderDate}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">Delivery</td><td style="padding:6px 0;color:#0F2942;font-size:13px">${safeDeliveryDate}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">Portal</td><td style="padding:6px 0;color:#0F2942;font-size:13px"><a href="${safeUrl}" style="color:#0F2942">${safeUrl}</a></td></tr>
      </table>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;color:#0F2942;font-size:14px;line-height:1.6;white-space:pre-wrap">${safeMessage}</div>
      <p style="margin:18px 0 0;color:#6b7280;font-size:11.5px;line-height:1.55">Reply to this email to respond to the asker directly — the Reply-To is set to their portal address.</p>
    </td></tr>
    <tr><td style="padding:16px 32px 0;color:#9ca3af;font-size:11.5px;line-height:1.5">ASO Hawaii Doctor Portal · ${safeUrl}</td></tr>
  </table>
</body></html>`;

  return { html, text, subject };
}
