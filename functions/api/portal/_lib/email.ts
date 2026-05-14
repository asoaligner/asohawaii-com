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
export type InvitationLocale = "en" | "ja";

export function invitationEmail(args: {
  recipientName: string | null;
  inviterName: string;
  clinicName: string;
  role: "member" | "admin" | "aso_staff";
  acceptUrl: string;
  expiresHumanLabel: string;
  /** Origin of the portal (e.g. `https://asohawaii.com`) used to build
   * the guide link. Falls back to the production origin when omitted. */
  siteOrigin?: string;
  /** `"ja"` renders the Japanese-language body, otherwise English. The
   * subject line matches the body locale. */
  locale?: InvitationLocale;
}): { html: string; text: string; subject: string } {
  const { recipientName, inviterName, clinicName, role, acceptUrl } = args;
  const locale: InvitationLocale = args.locale === "ja" ? "ja" : "en";
  const origin = (args.siteOrigin || "https://asohawaii.com").replace(/\/+$/, "");
  const guideUrl = `${origin}/portal/guide/`;

  if (locale === "ja") {
    const roleLabel =
      role === "admin"
        ? "院内管理者"
        : role === "aso_staff"
          ? "ASO スタッフ"
          : "スタッフ";
    const subject = `ASO Hawaii Doctor Portal へのご招待 — ${clinicName}様`;
    const greeting = recipientName
      ? `${recipientName} 先生`
      : `${clinicName} ご担当者様`;

    const text = [
      greeting,
      "",
      `平素より大変お世話になっております、ASO International Hawaii の ${inviterName} です。`,
      "",
      `このたび、${clinicName} 様を ASO Hawaii Doctor Portal にご招待いたします。`,
      `権限: ${roleLabel}`,
      "",
      "下記リンクからパスワードを設定し、アカウントをご利用開始ください:",
      acceptUrl,
      "",
      `この招待リンクの有効期限: ${args.expiresHumanLabel}`,
      "",
      "Portal の使い方ガイド (日本語/英語):",
      guideUrl,
      "",
      "Portal を使うと:",
      "  ・新規症例の送信、納期確認、再注文がワンクリックで完結します",
      "  ・STL・Rx・写真がそのまま注文に紐付き、メールスレッドを探さずに済みます",
      "  ・個別の症例についてはチャット感覚で弊社デジタル担当へ直接ご質問いただけます",
      "",
      "ご不明な点がございましたら、お気軽にお問い合わせください:",
      "  電話: 808-957-0111",
      "  メール: aso-digital@outlook.com",
      "",
      "ASO International Hawaii, Inc.",
      "1441 Kapiolani Blvd #1112, Honolulu HI 96814",
    ].join("\n");

    const safeGreeting = escapeHtml(greeting);
    const safeUrl = escapeHtml(acceptUrl);
    const safeGuideUrl = escapeHtml(guideUrl);
    const safeInviter = escapeHtml(inviterName);
    const safeClinic = escapeHtml(clinicName);
    const safeRole = escapeHtml(roleLabel);
    const safeExpires = escapeHtml(args.expiresHumanLabel);

    const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic UI','Meiryo',-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 32px 24px">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:22px;line-height:1.4">ASO Hawaii Doctor Portal へのご招待</h1>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.7">${safeGreeting}</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.7">平素より大変お世話になっております、ASO International Hawaii の <strong>${safeInviter}</strong> です。</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.7">このたび、<strong>${safeClinic}</strong> 様を ASO Hawaii Doctor Portal にご招待いたします (権限: ${safeRole})。下記ボタンからパスワードを設定し、ご利用を開始してください。</p>
      <p style="margin:24px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:500">パスワードを設定する</a>
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:12.5px;line-height:1.6">ボタンが開かない場合は、下記 URL をブラウザに貼り付けてください:</p>
      <p style="margin:0 0 20px;color:#0F2942;font-size:12px;font-family:'SFMono-Regular',Consolas,monospace;word-break:break-all">${safeUrl}</p>

      <div style="margin:0 0 8px;padding:14px 16px;background:#F9731610;border-radius:12px">
        <p style="margin:0 0 6px;color:#0F2942;font-size:13px;font-weight:500">📘 Portal の使い方ガイド (日本語 / 英語)</p>
        <p style="margin:0;color:#374151;font-size:12.5px;line-height:1.6">サインイン方法・注文確認・新規送信・再注文・質問の流れを 1 ページにまとめています。<br><a href="${safeGuideUrl}" style="color:#F97316;text-decoration:none;font-weight:500">${safeGuideUrl}</a></p>
      </div>

      <p style="margin:18px 0 6px;color:#6b7280;font-size:12.5px;line-height:1.6">この招待リンクの有効期限: <strong>${safeExpires}</strong></p>
      <p style="margin:6px 0 0;color:#6b7280;font-size:12.5px;line-height:1.6">心当たりがない場合は、このメールは破棄してください。アカウントはパスワード設定するまで作成されません。</p>
    </td></tr>
    <tr><td style="padding:16px 32px 0;color:#9ca3af;font-size:11.5px;line-height:1.6">
      ご不明な点はお気軽に: <strong>808-957-0111</strong> · <a href="mailto:aso-digital@outlook.com" style="color:#6b7280">aso-digital@outlook.com</a><br>
      ASO International Hawaii, Inc. · 1441 Kapiolani Blvd #1112, Honolulu HI 96814
    </td></tr>
  </table>
</body></html>`;

    return { html, text, subject };
  }

  // English (default)
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const roleLabel =
    role === "admin"
      ? "clinic admin"
      : role === "aso_staff"
        ? "ASO staff"
        : "team member";
  const subject = `${inviterName} invited you to the ASO Hawaii Doctor Portal`;

  const text = [
    greeting,
    "",
    `${inviterName} has invited you to join the ASO Hawaii Doctor Portal`,
    `for ${clinicName} as a ${roleLabel}.`,
    "",
    "Set a password to claim your account:",
    acceptUrl,
    "",
    `This invitation expires ${args.expiresHumanLabel}.`,
    "",
    "New to the portal? Here's a one-page onboarding guide (EN + JA):",
    guideUrl,
    "",
    "What the portal gives you:",
    "  • Real-time order tracking — every case, every delivery date, one dashboard",
    "  • One-click reorder — same patient, same appliance, new STL",
    "  • Direct file uploads — STL and Rx attachments stay tied to the order",
    "  • Ask anytime — questions about a specific case go straight to our digital team",
    "",
    "Questions? We're happy to walk you through the first case:",
    "  Phone: 808-957-0111",
    "  Email: aso-digital@outlook.com",
    "",
    "ASO International Hawaii, Inc.",
    "1441 Kapiolani Blvd #1112, Honolulu HI 96814",
  ].join("\n");

  const safeGreeting = escapeHtml(greeting);
  const safeUrl = escapeHtml(acceptUrl);
  const safeGuideUrl = escapeHtml(guideUrl);
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
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6"><strong>${safeInviter}</strong> has invited you to join the ASO Hawaii Doctor Portal for <strong>${safeClinic}</strong> as a <strong>${safeRole}</strong>. Set a password below to start tracking cases and sending new orders.</p>
      <p style="margin:24px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:500">Set your password</a>
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:12.5px;line-height:1.6">Or copy and paste this link into your browser:</p>
      <p style="margin:0 0 20px;color:#0F2942;font-size:12px;font-family:'SFMono-Regular',Consolas,monospace;word-break:break-all">${safeUrl}</p>

      <div style="margin:0 0 8px;padding:14px 16px;background:#F9731610;border-radius:12px">
        <p style="margin:0 0 6px;color:#0F2942;font-size:13px;font-weight:500">📘 New to the portal? One-page onboarding guide (EN&nbsp;+&nbsp;JA)</p>
        <p style="margin:0;color:#374151;font-size:12.5px;line-height:1.6">Covers sign-in, submitting cases, reordering, file uploads, and asking about an order.<br><a href="${safeGuideUrl}" style="color:#F97316;text-decoration:none;font-weight:500">${safeGuideUrl}</a></p>
      </div>

      <p style="margin:18px 0 6px;color:#6b7280;font-size:12.5px;line-height:1.6">This invitation expires <strong>${safeExpires}</strong>.</p>
      <p style="margin:6px 0 0;color:#6b7280;font-size:12.5px;line-height:1.6">If you didn't expect this email, you can safely ignore it — no account is created until you choose a password.</p>
    </td></tr>
    <tr><td style="padding:16px 32px 0;color:#9ca3af;font-size:11.5px;line-height:1.5">
      Questions? <strong>808-957-0111</strong> · <a href="mailto:aso-digital@outlook.com" style="color:#6b7280">aso-digital@outlook.com</a><br>
      ASO International Hawaii, Inc. · 1441 Kapiolani Blvd #1112, Honolulu HI 96814
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

// ────────────────────────────────────────────────────────────────────────
// Phase 2.1 — Self-service portal access application emails.
//
// All applicant-facing templates are bilingual (EN block on top, JA on
// bottom) so we don't have to capture the applicant's preferred locale
// at request time. The admin-notification template is English-only.
// ────────────────────────────────────────────────────────────────────────

/** Bilingual applicant footer used across the three applicant-facing
 * access emails. */
function bilingualApplicantFooter(): string {
  return `<tr><td style="padding:16px 32px 0;color:#9ca3af;font-size:11.5px;line-height:1.6">
      Questions? <strong>808-957-0111</strong> · <a href="mailto:aso-digital@outlook.com" style="color:#6b7280">aso-digital@outlook.com</a><br>
      ご不明な点は: <strong>808-957-0111</strong> / <a href="mailto:aso-digital@outlook.com" style="color:#6b7280">aso-digital@outlook.com</a><br>
      ASO International Hawaii, Inc. · 1441 Kapiolani Blvd #1112, Honolulu HI 96814
    </td></tr>`;
}

/**
 * Sent to the applicant immediately after they submit the
 * /portal/request-access/ form. Confirms receipt and sets the
 * expectation that ASO will reply within one business day.
 */
export function accessApplicationReceivedEmail(args: {
  applicantName: string | null;
  clinicName: string;
  guideUrl: string;
}): { html: string; text: string; subject: string } {
  const { applicantName, clinicName, guideUrl } = args;
  const subject =
    "ASO Hawaii Doctor Portal — Application received / 申請を受け付けました";
  const enGreeting = applicantName ? `Hi ${applicantName},` : "Hi,";
  const jaGreeting = applicantName
    ? `${applicantName} 先生`
    : `${clinicName} ご担当者様`;

  const text = [
    enGreeting,
    "",
    `Thank you for applying for access to the ASO Hawaii Doctor Portal for ${clinicName}.`,
    "",
    "Our team will review your application and reply within one business day.",
    "Once approved, you'll receive a separate email confirming sign-in.",
    "",
    "Onboarding guide (EN + JA):",
    guideUrl,
    "",
    "Questions: 808-957-0111 · aso-digital@outlook.com",
    "",
    "— ASO Hawaii",
    "",
    "─────────────────────",
    "",
    jaGreeting,
    "",
    `このたびは ${clinicName} 様より ASO Hawaii Doctor Portal の利用申請をいただき、誠にありがとうございます。`,
    "",
    "弊社にて 1 営業日以内に内容を確認のうえ、ご返信いたします。",
    "承認されますと、サインインのご案内メールを別途お送りいたします。",
    "",
    "Portal の使い方ガイド (日本語 / 英語):",
    guideUrl,
    "",
    "ご不明な点: 808-957-0111 / aso-digital@outlook.com",
    "",
    "ASO International Hawaii",
  ].join("\n");

  const safeEnGreeting = escapeHtml(enGreeting);
  const safeJaGreeting = escapeHtml(jaGreeting);
  const safeClinic = escapeHtml(clinicName);
  const safeGuide = escapeHtml(guideUrl);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Yu Gothic UI',Meiryo,Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 32px 24px">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:22px;line-height:1.4">Application received</h1>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">${safeEnGreeting}</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">Thank you for applying for access to the ASO Hawaii Doctor Portal for <strong>${safeClinic}</strong>.</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">Our team will review your application and reply within one business day. Once approved, you'll receive a separate email with sign-in instructions.</p>
      <div style="margin:18px 0;padding:12px 14px;background:#F9731610;border-radius:10px">
        <p style="margin:0 0 4px;color:#0F2942;font-size:12.5px;font-weight:500">📘 Onboarding guide (EN + JA)</p>
        <p style="margin:0;color:#374151;font-size:12px;line-height:1.5"><a href="${safeGuide}" style="color:#F97316;text-decoration:none">${safeGuide}</a></p>
      </div>

      <div style="margin:24px 0;border-top:1px solid #e5e7eb"></div>

      <h2 style="margin:0 0 12px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:18px;line-height:1.5">申請を受け付けました</h2>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">${safeJaGreeting}</p>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">このたびは <strong>${safeClinic}</strong> 様より ASO Hawaii Doctor Portal の利用申請をいただき、誠にありがとうございます。</p>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">弊社にて 1 営業日以内に内容を確認のうえ、ご返信いたします。承認されますと、サインインのご案内メールを別途お送りいたします。</p>
    </td></tr>
    ${bilingualApplicantFooter()}
  </table>
</body></html>`;

  return { html, text, subject };
}

/**
 * Sent to the applicant when aso_staff approves their application. The
 * approval also created their portal_users row, so they can sign in
 * with the same Google account / email immediately.
 */
export function accessApprovedEmail(args: {
  applicantName: string | null;
  clinicName: string;
  signInUrl: string;
  authProvider: "google" | "password";
}): { html: string; text: string; subject: string } {
  const { applicantName, clinicName, signInUrl, authProvider } = args;
  const subject = `Portal access approved — welcome to ASO Hawaii / Portal をご利用いただけます`;
  const enGreeting = applicantName ? `Hi ${applicantName},` : "Hi,";
  const jaGreeting = applicantName
    ? `${applicantName} 先生`
    : `${clinicName} ご担当者様`;
  const enSignInHint =
    authProvider === "google"
      ? "Use “Continue with Google” on the sign-in page — your Google account is already linked."
      : "Set your password on the sign-in page using your registered email.";
  const jaSignInHint =
    authProvider === "google"
      ? "サインイン画面の「Continue with Google」をクリックしてください。Google アカウントは既に登録済です。"
      : "サインイン画面でご登録のメールアドレスを入力し、パスワードを設定してください。";

  const text = [
    enGreeting,
    "",
    `Your application for ${clinicName} has been approved. Welcome to the ASO Hawaii Doctor Portal!`,
    "",
    enSignInHint,
    signInUrl,
    "",
    "Questions: 808-957-0111 · aso-digital@outlook.com",
    "",
    "— ASO Hawaii",
    "",
    "─────────────────────",
    "",
    jaGreeting,
    "",
    `${clinicName} 様のお申込みを承認いたしました。ASO Hawaii Doctor Portal をどうぞご利用ください。`,
    "",
    jaSignInHint,
    signInUrl,
    "",
    "ご不明な点: 808-957-0111 / aso-digital@outlook.com",
  ].join("\n");

  const safeEnGreeting = escapeHtml(enGreeting);
  const safeJaGreeting = escapeHtml(jaGreeting);
  const safeClinic = escapeHtml(clinicName);
  const safeUrl = escapeHtml(signInUrl);
  const safeEnHint = escapeHtml(enSignInHint);
  const safeJaHint = escapeHtml(jaSignInHint);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Yu Gothic UI',Meiryo,Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 32px 24px">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:22px;line-height:1.4">You're in — welcome to the Portal</h1>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">${safeEnGreeting}</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">Your application for <strong>${safeClinic}</strong> has been approved. Welcome to the ASO Hawaii Doctor Portal!</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">${safeEnHint}</p>
      <p style="margin:20px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:500">Sign in to the Portal</a>
      </p>

      <div style="margin:24px 0;border-top:1px solid #e5e7eb"></div>

      <h2 style="margin:0 0 12px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:18px;line-height:1.5">Portal をご利用いただけます</h2>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">${safeJaGreeting}</p>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7"><strong>${safeClinic}</strong> 様のお申込みを承認いたしました。ASO Hawaii Doctor Portal をどうぞご利用ください。</p>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">${safeJaHint}</p>
      <p style="margin:0 0 10px;color:#0F2942;font-size:12.5px;font-family:'SFMono-Regular',Consolas,monospace;word-break:break-all">${safeUrl}</p>
    </td></tr>
    ${bilingualApplicantFooter()}
  </table>
</body></html>`;

  return { html, text, subject };
}

/**
 * Sent to the applicant when aso_staff rejects. The reason is shown in
 * the email body so the applicant knows exactly what to fix; the
 * follow-up phone number invites them to call to discuss if needed.
 */
export function accessRejectedEmail(args: {
  applicantName: string | null;
  clinicName: string;
  reason: string;
}): { html: string; text: string; subject: string } {
  const { applicantName, clinicName, reason } = args;
  const subject = `ASO Hawaii Doctor Portal — Application not approved / お申込みについて`;
  const enGreeting = applicantName ? `Hi ${applicantName},` : "Hi,";
  const jaGreeting = applicantName
    ? `${applicantName} 先生`
    : `${clinicName} ご担当者様`;

  const text = [
    enGreeting,
    "",
    `Thank you for your interest in the ASO Hawaii Doctor Portal. After reviewing your application for ${clinicName}, we are unable to approve access at this time.`,
    "",
    "Reason / 理由:",
    reason,
    "",
    "If you'd like to discuss or reapply with updated information, please call 808-957-0111 — we're happy to walk through it with you.",
    "",
    "— ASO Hawaii",
    "",
    "─────────────────────",
    "",
    jaGreeting,
    "",
    `この度は ASO Hawaii Doctor Portal にお申込みいただきありがとうございました。${clinicName} 様のお申込み内容を確認させていただきましたが、現時点では承認をお見送りさせていただきます。`,
    "",
    "ご相談・修正のうえ再申請ご希望の場合は、お電話 (808-957-0111) いただけますとお話しさせていただきます。",
    "",
    "ASO International Hawaii",
  ].join("\n");

  const safeEnGreeting = escapeHtml(enGreeting);
  const safeJaGreeting = escapeHtml(jaGreeting);
  const safeClinic = escapeHtml(clinicName);
  const safeReason = escapeHtml(reason).replace(/\n/g, "<br>");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Yu Gothic UI',Meiryo,Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 32px 24px">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:22px;line-height:1.4">About your portal application</h1>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">${safeEnGreeting}</p>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">Thank you for your interest in the ASO Hawaii Doctor Portal. After reviewing your application for <strong>${safeClinic}</strong>, we are unable to approve access at this time.</p>
      <div style="margin:14px 0;padding:12px 14px;background:#fff7ed;border-left:3px solid #F97316;border-radius:6px">
        <p style="margin:0 0 4px;color:#0F2942;font-size:11.5px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Reason / 理由</p>
        <p style="margin:0;color:#374151;font-size:13.5px;line-height:1.6">${safeReason}</p>
      </div>
      <p style="margin:14px 0 0;color:#374151;font-size:14px;line-height:1.6">If you'd like to discuss or reapply with updated information, please call <strong>808-957-0111</strong> — we're happy to walk through it with you.</p>

      <div style="margin:24px 0;border-top:1px solid #e5e7eb"></div>

      <h2 style="margin:0 0 12px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:18px;line-height:1.5">お申込みについて</h2>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">${safeJaGreeting}</p>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">この度は ASO Hawaii Doctor Portal にお申込みいただきありがとうございました。<strong>${safeClinic}</strong> 様のお申込み内容を確認させていただきましたが、現時点では承認をお見送りさせていただきます。</p>
      <p style="margin:0 0 10px;color:#374151;font-size:13.5px;line-height:1.7">ご相談・修正のうえ再申請ご希望の場合は、お電話 (<strong>808-957-0111</strong>) いただけますとお話しさせていただきます。</p>
    </td></tr>
    ${bilingualApplicantFooter()}
  </table>
</body></html>`;

  return { html, text, subject };
}

/**
 * Sent to ASO admins (PORTAL_EMAIL_REPLY_TO target) whenever a new
 * application lands. English-only because it goes to the lab's
 * digital-ops inbox. Includes the full applicant record so admins can
 * triage from the email without opening the portal.
 */
export function newApplicationNotifyEmail(args: {
  pendingId: number;
  applicantEmail: string;
  applicantName: string | null;
  doctorName: string | null;
  clinicName: string;
  asoAccountNumber: string | null;
  easyrxEmail: string | null;
  reason: string | null;
  googleLinked: boolean;
  reviewUrl: string;
  attemptedAt: string;
  ipAddress: string | null;
}): { html: string; text: string; subject: string } {
  const subject = `[Portal] New access application — ${args.clinicName}`;

  const rows: [string, string][] = [
    ["Pending #", `${args.pendingId}`],
    ["Applicant", `${args.applicantName ?? "—"} <${args.applicantEmail}>`],
    ["Doctor", args.doctorName ?? "—"],
    ["Clinic", args.clinicName],
    ["ASO account #", args.asoAccountNumber ?? "—"],
    ["EasyRx email", args.easyrxEmail ?? "—"],
    ["Google linked", args.googleLinked ? "yes" : "no"],
    ["Submitted at", args.attemptedAt],
    ["IP", args.ipAddress ?? "—"],
  ];

  const text = [
    "A new portal access application is awaiting review.",
    "",
    ...rows.map(([k, v]) => `  ${k.padEnd(15)} ${v}`),
    "",
    "Stated reason:",
    args.reason || "(none)",
    "",
    "Review:",
    args.reviewUrl,
    "",
    "— ASO Portal",
  ].join("\n");

  const safeUrl = escapeHtml(args.reviewUrl);
  const safeReason = (args.reason ? escapeHtml(args.reason) : "(none)").replace(/\n/g, "<br>");
  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#6b7280;font-size:12px;width:130px">${escapeHtml(k)}</td><td style="padding:6px 0;color:#0F2942;font-size:13px">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto">
    <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:28px 28px 22px">
      <h1 style="margin:0 0 14px;font-family:Georgia,'Source Serif 4',serif;color:#0F2942;font-size:20px;line-height:1.4">New portal access application</h1>
      <p style="margin:0 0 16px;color:#374151;font-size:13.5px;line-height:1.6">A doctor (or clinic team member) has submitted the public application form.</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;width:100%">
        ${tableRows}
      </table>
      <div style="margin:0 0 14px;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Stated reason</p>
        <p style="margin:0;color:#0F2942;font-size:13px;line-height:1.5;white-space:pre-wrap">${safeReason}</p>
      </div>
      <p style="margin:14px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#0F2942;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:9999px;font-size:13.5px;font-weight:500">Review in portal</a>
      </p>
    </td></tr>
    <tr><td style="padding:14px 28px 0;color:#9ca3af;font-size:11.5px;line-height:1.5">ASO Hawaii Doctor Portal · admin notification</td></tr>
  </table>
</body></html>`;

  return { html, text, subject };
}
