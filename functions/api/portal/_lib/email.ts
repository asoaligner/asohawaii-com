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
  const replyTo = env.PORTAL_EMAIL_REPLY_TO || REPLY_TO_DEFAULT;

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
