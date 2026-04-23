/**
 * GET  /api/admin/chats                       — list sessions (paginated)
 * GET  /api/admin/chats?session=<id>          — get messages for one session
 * GET  /api/admin/chats?q=<search>            — search sessions by message content
 *
 * Protected by a Basic Auth header. The password is the `ADMIN_PASSWORD`
 * env var in Cloudflare Pages; username is ignored (can be anything).
 */

interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

function requireAuth(
  request: Request,
  expectedPassword: string
): Response | null {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) {
    return unauthorized();
  }
  try {
    const decoded = atob(auth.slice(6));
    // Basic auth format: "user:password" — we ignore user, check password.
    const colonIdx = decoded.indexOf(":");
    const pw = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
    if (pw !== expectedPassword) return unauthorized();
    return null;
  } catch {
    return unauthorized();
  }
}

function unauthorized(): Response {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ASO Hawaii Admin"',
      ...CORS_HEADERS,
    },
  });
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD) {
    return json({ error: "Admin is not configured." }, 503);
  }
  const authFail = requireAuth(request, env.ADMIN_PASSWORD);
  if (authFail) return authFail;

  if (!env.DB) {
    return json({ error: "Database not bound." }, 503);
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session");
  const query = url.searchParams.get("q");

  if (sessionId) {
    return getSessionMessages(env.DB, sessionId);
  }

  if (query) {
    return searchSessions(env.DB, query);
  }

  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  return listSessions(env.DB, limit, offset);
};

async function listSessions(db: D1Database, limit: number, offset: number): Promise<Response> {
  const res = await db
    .prepare(
      `SELECT s.id, s.created_at, s.user_name, s.user_clinic, s.user_country,
              (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id) AS message_count,
              (SELECT content FROM messages m
                 WHERE m.session_id = s.id AND m.role = 'user'
                 ORDER BY m.id ASC LIMIT 1) AS first_question,
              (SELECT MAX(created_at) FROM messages m WHERE m.session_id = s.id) AS last_message_at
       FROM sessions s
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(limit, offset)
    .all();

  return json({ sessions: res.results || [] });
}

async function getSessionMessages(db: D1Database, sessionId: string): Promise<Response> {
  const session = await db
    .prepare(
      `SELECT id, created_at, user_name, user_clinic, user_country, user_agent_short
       FROM sessions WHERE id = ?`
    )
    .bind(sessionId)
    .first();

  if (!session) {
    return json({ error: "Session not found." }, 404);
  }

  const messages = await db
    .prepare(
      `SELECT id, created_at, role, content
       FROM messages
       WHERE session_id = ?
       ORDER BY id ASC`
    )
    .bind(sessionId)
    .all();

  return json({ session, messages: messages.results || [] });
}

async function searchSessions(db: D1Database, query: string): Promise<Response> {
  const like = `%${query.replace(/[%_]/g, "")}%`;
  const res = await db
    .prepare(
      `SELECT DISTINCT s.id, s.created_at, s.user_name, s.user_clinic, s.user_country,
              (SELECT COUNT(*) FROM messages m2 WHERE m2.session_id = s.id) AS message_count,
              (SELECT content FROM messages m3
                 WHERE m3.session_id = s.id AND m3.role = 'user'
                 ORDER BY m3.id ASC LIMIT 1) AS first_question
       FROM sessions s
       JOIN messages m ON m.session_id = s.id
       WHERE m.content LIKE ?
          OR s.user_name LIKE ?
          OR s.user_clinic LIKE ?
       ORDER BY s.created_at DESC
       LIMIT 200`
    )
    .bind(like, like, like)
    .all();

  return json({ sessions: res.results || [] });
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
