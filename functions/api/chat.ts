/**
 * POST /api/chat — chat endpoint for the AIChatWidget on asohawaii.com.
 *
 * This is a Cloudflare Pages Function — it runs on Cloudflare's edge
 * workers alongside the static site, and gets its API key from
 * Cloudflare's Environment Variables (set in the Pages dashboard).
 *
 * Flow:
 *   1. Browser POSTs { messages: [...] } to /api/chat.
 *   2. This function prepends the system prompt and calls Claude.
 *   3. Streaming response is piped back to the browser as SSE-ish text.
 *
 * The Anthropic API key is never exposed to the browser — it lives in
 * the Cloudflare Pages environment as ANTHROPIC_API_KEY.
 */

import {
  ASO_SYSTEM_PROMPT,
  ASO_MODEL,
  MAX_OUTPUT_TOKENS,
} from "../../src/data/aso-knowledge";

type Message = { role: "user" | "assistant"; content: string };

interface Env {
  ANTHROPIC_API_KEY: string;
}

/** Cloudflare Pages Function context (minimal inline type to avoid pulling
 * in @cloudflare/workers-types just for this one file). */
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

// Simple per-IP rate limit using in-memory map (resets on worker cold-start,
// good enough for basic abuse prevention; real rate limiting should use
// Cloudflare's Rate Limiting rules on top).
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 messages per minute per IP
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

// OPTIONS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
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

  let body: { messages?: Message[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: "No messages provided." }, 400);
  }

  // Guardrails on size — cap history to the last 10 turns and truncate
  // each message to 2000 characters to keep input reasonable.
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
    // Log the real error server-side (Cloudflare logs), return generic to user.
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

  return json({ reply: text });
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}
