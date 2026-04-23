/**
 * POST /api/chat — chat endpoint for the AIChatWidget on asohawaii.com.
 *
 * Runs as a Cloudflare Pages Function. Each request:
 *   1. Rate-limits per IP (20 msg/min).
 *   2. Upserts a session row keyed by the client-provided `sessionId`,
 *      storing optional name/clinic and request metadata.
 *   3. Logs the user message + assistant reply into the `messages` table.
 *   4. Proxies the conversation to Claude Haiku 4.5 and returns the reply.
 *
 * ANTHROPIC_API_KEY env var: Anthropic API key (Secret)
 * DB binding:               Cloudflare D1 database "aso-chat-logs"
 */

import {
  ASO_SYSTEM_PROMPT,
  ASO_MODEL,
  MAX_OUTPUT_TOKENS,
} from "../../src/data/aso-knowledge";

type Message = { role: "user" | "assistant"; content: string };

interface Env {
  ANTHROPIC_API_KEY: string;
  DB: D1Database;
}

// Minimal D1 types (Cloudflare Workers runtime types).
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
}
interface D1Result<T = unknown> {
  success: boolean;
  results?: T[];
  meta?: { duration: number; rows_read: number; rows_written: number };
}

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (p: Promise<unknown>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "unknown";

  if (!rateLimitOk(ip)) {
    return json(
      { error: "Rate limit exceeded. Try again in a minute." },
      429
    );
  }

  if (!env.ANTHROPIC_API_KEY) {
    return json(
      {
        error:
          "Chat is temporarily unavailable. Please email aso-digital@outlook.com or call 808-957-0111.",
      },
      503
    );
  }

  let body: {
    messages?: Message[];
    sessionId?: string;
    userName?: string;
    userClinic?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: "No messages provided." }, 400);
  }

  // Trim history: last 10 turns, each message capped at 2000 chars.
  const trimmed = messages.slice(-10).map((m) => ({
    role: m.role,
    content: String(m.content || "").slice(0, 2000),
  }));

  // Call Claude
  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ASO_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: ASO_SYSTEM_PROMPT,
      messages: trimmed,
    }),
  });

  if (!anthropicResp.ok) {
    const errText = await anthropicResp.text().catch(() => "");
    console.error(
      `Anthropic API error: ${anthropicResp.status} ${errText.slice(0, 300)}`
    );
    return json(
      {
        error:
          "I'm having trouble reaching the assistant right now. Please try again, or email aso-digital@outlook.com / call 808-957-0111.",
      },
      502
    );
  }

  const data = await anthropicResp.json();
  const text =
    (data as { content?: Array<{ type: string; text?: string }> })?.content
      ?.filter((c) => c.type === "text")
      ?.map((c) => c.text || "")
      ?.join("\n") ?? "";

  // Log to D1 asynchronously so a DB slow/failure doesn't block the reply.
  if (env.DB && body.sessionId) {
    waitUntil(
      logConversation(env.DB, {
        sessionId: body.sessionId,
        userName: body.userName,
        userClinic: body.userClinic,
        userCountry: request.headers.get("CF-IPCountry") || null,
        userAgent: request.headers.get("User-Agent") || null,
        userMessage: trimmed[trimmed.length - 1]?.content || "",
        assistantReply: text,
      }).catch((err) => {
        console.error("D1 log error:", err instanceof Error ? err.message : err);
      })
    );
  }

  return json({ reply: text });
};

async function logConversation(
  db: D1Database,
  params: {
    sessionId: string;
    userName?: string;
    userClinic?: string;
    userCountry: string | null;
    userAgent: string | null;
    userMessage: string;
    assistantReply: string;
  }
) {
  const now = Math.floor(Date.now() / 1000);
  const shortUA = params.userAgent?.slice(0, 200) || null;

  // INSERT OR IGNORE on sessions — first message creates the row, later
  // messages are no-ops on the sessions table.
  const upsertSession = db
    .prepare(
      `INSERT OR IGNORE INTO sessions
         (id, created_at, user_name, user_clinic, user_country, user_agent_short)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      params.sessionId,
      now,
      params.userName || null,
      params.userClinic || null,
      params.userCountry,
      shortUA
    );

  // If name/clinic arrived on a later message (user filled in after first
  // turn), update the session row to capture it.
  const updateSessionIdentity = db
    .prepare(
      `UPDATE sessions
         SET user_name   = COALESCE(?, user_name),
             user_clinic = COALESCE(?, user_clinic)
       WHERE id = ?`
    )
    .bind(params.userName || null, params.userClinic || null, params.sessionId);

  const insertUserMsg = db
    .prepare(
      `INSERT INTO messages (session_id, created_at, role, content)
       VALUES (?, ?, 'user', ?)`
    )
    .bind(params.sessionId, now, params.userMessage.slice(0, 8000));

  const insertAsstMsg = db
    .prepare(
      `INSERT INTO messages (session_id, created_at, role, content)
       VALUES (?, ?, 'assistant', ?)`
    )
    .bind(params.sessionId, now + 1, params.assistantReply.slice(0, 8000));

  await db.batch([
    upsertSession,
    updateSessionIdentity,
    insertUserMsg,
    insertAsstMsg,
  ]);
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}
