/**
 * POST /api/admin/daily-summary — sends a Gmail digest of the last N hours of
 * chat sessions. Designed to be triggered daily by a cron service (cron-job.org,
 * EasyCron, etc.) OR manually from the admin UI.
 *
 * Auth: either
 *   - `x-api-key` header matching ADMIN_PASSWORD env var (for cron service)
 *   - `Authorization: Basic ...` header (for admin UI click)
 *
 * Env vars:
 *   ANTHROPIC_API_KEY — for Claude summarization
 *   RESEND_API_KEY    — for email delivery via Resend
 *   ADMIN_PASSWORD    — used as the api-key for cron
 *   DB                — D1 binding
 *
 * Query params:
 *   ?hours=24         — how far back to summarize (default 24)
 *   ?to=<email>       — override recipient (default asoaligner@gmail.com)
 *   ?dry=1            — return the generated email body without sending
 */

import { ASO_MODEL } from "../../../src/data/aso-knowledge";

interface Env {
  ANTHROPIC_API_KEY: string;
  RESEND_API_KEY: string;
  ADMIN_PASSWORD: string;
  DB: D1Database;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result<T>>;
}
interface D1Result<T = unknown> {
  success: boolean;
  results?: T[];
}

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (p: Promise<unknown>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

const DEFAULT_RECIPIENT = "asoaligner@gmail.com";
const RESEND_FROM = "ASO Hawaii Chat <onboarding@resend.dev>";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key",
};

function isAuthorized(request: Request, expected: string): boolean {
  if (!expected) return false;
  const apiKey = request.headers.get("x-api-key");
  if (apiKey && apiKey === expected) return true;
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const colonIdx = decoded.indexOf(":");
      const pw = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
      if (pw === expected) return true;
    } catch {
      /* fall through */
    }
  }
  return false;
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: CORS });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isAuthorized(request, env.ADMIN_PASSWORD)) {
    return json({ error: "Unauthorized" }, 401);
  }
  if (!env.DB) return json({ error: "DB not bound" }, 503);
  if (!env.ANTHROPIC_API_KEY)
    return json({ error: "ANTHROPIC_API_KEY missing" }, 503);
  if (!env.RESEND_API_KEY)
    return json({ error: "RESEND_API_KEY missing" }, 503);

  const url = new URL(request.url);
  const hours = Math.min(
    Math.max(parseInt(url.searchParams.get("hours") || "24", 10), 1),
    168
  );
  const recipient = url.searchParams.get("to") || DEFAULT_RECIPIENT;
  const dry = url.searchParams.get("dry") === "1";

  const sinceUnix = Math.floor(Date.now() / 1000) - hours * 3600;

  // Pull all sessions active in the window, with their messages.
  const sessionsRes = await env.DB.prepare(
    `SELECT s.id, s.created_at, s.user_name, s.user_clinic, s.user_country
     FROM sessions s
     WHERE s.id IN (
       SELECT DISTINCT session_id FROM messages WHERE created_at >= ?
     )
     ORDER BY s.created_at DESC`
  )
    .bind(sinceUnix)
    .all<SessionRow>();

  const sessions = sessionsRes.results || [];

  if (sessions.length === 0) {
    if (dry) {
      return json({
        dry: true,
        subject: `[ASO Hawaii] No chats in the last ${hours}h`,
        body: "No activity to report.",
      });
    }
    // Still send a short email so Koji knows the job is running (catch silent failures)
    const emailRes = await sendEmail(
      env,
      recipient,
      `[ASO Hawaii] No chat activity — last ${hours}h`,
      `<p>No chat sessions in the last ${hours} hours.</p><p>Chatbot dashboard: <a href="https://asohawaii.com/admin/chats">asohawaii.com/admin/chats</a></p>`
    );
    return json({ sent: emailRes.ok, sessions: 0 });
  }

  // Collect messages per session (batch query by session ids)
  const sessionIds = sessions.map((s) => s.id);
  const placeholders = sessionIds.map(() => "?").join(",");
  const msgsRes = await env.DB.prepare(
    `SELECT session_id, created_at, role, content
     FROM messages
     WHERE session_id IN (${placeholders})
     ORDER BY id ASC`
  )
    .bind(...sessionIds)
    .all<MessageRow>();

  const messagesBySession = new Map<string, MessageRow[]>();
  for (const m of msgsRes.results || []) {
    const arr = messagesBySession.get(m.session_id) || [];
    arr.push(m);
    messagesBySession.set(m.session_id, arr);
  }

  // Build a compact transcript block for the summarizer.
  const transcriptBlocks = sessions.map((s) => {
    const header = [
      s.user_name && `Name: ${s.user_name}`,
      s.user_clinic && `Clinic: ${s.user_clinic}`,
      s.user_country && `Country: ${s.user_country}`,
      `Started: ${new Date(s.created_at * 1000).toISOString()}`,
    ]
      .filter(Boolean)
      .join(" · ");
    const body = (messagesBySession.get(s.id) || [])
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");
    return `--- Session ${s.id.slice(0, 8)} ---\n${header}\n${body}`;
  });

  const summarizerPrompt = `You are summarizing ASO Hawaii orthodontic lab chatbot conversations for the lab manager (Koji). Produce a concise daily digest email.

For each distinct conversation, produce ONE bullet line in this format:
- **<Name (Clinic), Country> or Anonymous** — <one-sentence summary of what they asked + how the bot handled it>. <flag if follow-up needed>

Then add a "Trends" section noting recurring topics (e.g. "3 users asked about iTero setup").
Then add "Needs follow-up" — conversations where the bot said "please email" or "please call" or escalated to a human. If none, say "none."

Keep the whole output under 400 words. Use markdown. Do NOT include raw chat content — summarize only.`;

  // Call Claude
  const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ASO_MODEL,
      max_tokens: 1500,
      system: summarizerPrompt,
      messages: [
        {
          role: "user",
          content: `Summarize the following ${sessions.length} chat session(s) from the last ${hours} hours:\n\n${transcriptBlocks.join("\n\n")}`,
        },
      ],
    }),
  });

  if (!claudeResp.ok) {
    const errText = await claudeResp.text().catch(() => "");
    return json(
      { error: `Claude error ${claudeResp.status}: ${errText.slice(0, 300)}` },
      502
    );
  }
  const claudeData = await claudeResp.json();
  const summary =
    (claudeData as { content?: Array<{ type: string; text?: string }> })?.content
      ?.filter((c) => c.type === "text")
      ?.map((c) => c.text || "")
      ?.join("\n") ?? "";

  // Assemble email
  const subject = `[ASO Hawaii] Chat digest — ${sessions.length} session${
    sessions.length === 1 ? "" : "s"
  }, last ${hours}h`;

  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; line-height: 1.6; color: #0F2942;">
    <h2 style="color: #0F2942; border-bottom: 2px solid #F97316; padding-bottom: 8px;">Chat digest · last ${hours}h</h2>
    <p style="color: #6B7280; font-size: 13px;">
      <strong>${sessions.length}</strong> session${sessions.length === 1 ? "" : "s"} ·
      <strong>${msgsRes.results?.length || 0}</strong> message${msgsRes.results?.length === 1 ? "" : "s"}
    </p>
    <div style="font-size: 14px; color: #0F2942;">
      ${markdownToHtml(summary)}
    </div>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
    <p style="font-size: 12px; color: #6B7280;">
      Full transcripts: <a href="https://asohawaii.com/admin/chats" style="color: #F97316;">asohawaii.com/admin/chats</a>
    </p>
  </div>`;

  if (dry) {
    return json({ dry: true, subject, html, sessionCount: sessions.length });
  }

  const emailRes = await sendEmail(env, recipient, subject, html);
  if (!emailRes.ok) {
    return json(
      { error: `Email send failed: ${emailRes.error}` },
      502
    );
  }

  return json({
    sent: true,
    recipient,
    subject,
    sessionCount: sessions.length,
  });
};

async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${t.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

// Very light markdown → HTML (bold, bullet list, paragraph, link).
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      const item = line.replace(/^\s*[-*]\s+/, "");
      out.push("<li>" + inlineMd(item) + "</li>");
      continue;
    }
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    if (/^#{1,3}\s+/.test(line)) {
      const level = (line.match(/^#+/) || [""])[0].length;
      const text = line.replace(/^#+\s+/, "");
      out.push(`<h${level + 2}>${inlineMd(text)}</h${level + 2}>`);
      continue;
    }
    if (line === "") {
      out.push("");
      continue;
    }
    out.push("<p>" + inlineMd(line) + "</p>");
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function inlineMd(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS,
    },
  });
}

type SessionRow = {
  id: string;
  created_at: number;
  user_name: string | null;
  user_clinic: string | null;
  user_country: string | null;
};
type MessageRow = {
  session_id: string;
  created_at: number;
  role: "user" | "assistant";
  content: string;
};
