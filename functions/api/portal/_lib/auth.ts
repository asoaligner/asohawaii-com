/**
 * Portal auth primitives — JWT signing, cookie helpers, session resolution.
 *
 * Session model: server-side row in `portal_sessions` is the source of
 * truth. The cookie carries a signed JWT whose `sid` claim points at the
 * session row. Logout deletes the row, which immediately invalidates
 * outstanding JWTs without rotating JWT_SECRET.
 */

import { SignJWT, jwtVerify } from "jose";
import type {
  D1Database,
  PortalClinicRow,
  PortalSessionRow,
  PortalUserRow,
} from "./types";

export const COOKIE_NAME = "aso_portal_session";
/** 14 days. Long enough to avoid daily re-login but short enough that
 *  a stolen device loses access in two weeks. Sessions can be revoked
 *  earlier via DB delete. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

const JWT_ALG = "HS256";
const JWT_ISSUER = "asohawaii-portal";

interface SessionClaims {
  /** Session row id (UUID). */
  sid: string;
  /** User id, for short-circuit checks before DB hit. */
  uid: number;
}

function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSessionJwt(
  claims: SessionClaims,
  jwtSecret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  return await new SignJWT({ sid: claims.sid, uid: claims.uid })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuer(JWT_ISSUER)
    .setSubject(String(claims.uid))
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(encodeSecret(jwtSecret));
}

export async function verifySessionJwt(
  token: string,
  jwtSecret: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, encodeSecret(jwtSecret), {
      issuer: JWT_ISSUER,
    });
    if (
      typeof payload.sid !== "string" ||
      typeof payload.uid !== "number"
    ) {
      return null;
    }
    return { sid: payload.sid, uid: payload.uid };
  } catch {
    return null;
  }
}

/** Build the Set-Cookie value for a freshly-issued session. */
export function buildSessionCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join("; ");
}

/** Build the Set-Cookie value that clears the session cookie. */
export function buildClearCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

/** Read the named cookie out of a Request's `Cookie` header. */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export interface ResolvedSession {
  user: PortalUserRow;
  clinic: PortalClinicRow;
  session: PortalSessionRow;
}

/**
 * Resolve the caller's session from the request cookie. Returns null for
 * any of: missing cookie, invalid signature, expired JWT, deleted/expired
 * DB row, deactivated user. Callers should treat null as 401.
 */
export async function resolveSession(
  request: Request,
  db: D1Database,
  jwtSecret: string,
): Promise<ResolvedSession | null> {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;

  const claims = await verifySessionJwt(token, jwtSecret);
  if (!claims) return null;

  const session = await db
    .prepare("SELECT * FROM portal_sessions WHERE id = ?")
    .bind(claims.sid)
    .first<PortalSessionRow>();
  if (!session) return null;

  const expiresAt = Date.parse(session.expires_at.replace(" ", "T") + "Z");
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  const user = await db
    .prepare("SELECT * FROM portal_users WHERE id = ?")
    .bind(session.user_id)
    .first<PortalUserRow>();
  if (!user || user.is_active !== 1) return null;

  const clinic = await db
    .prepare("SELECT * FROM portal_clinics WHERE id = ?")
    .bind(user.clinic_id)
    .first<PortalClinicRow>();
  if (!clinic) return null;

  return { user, clinic, session };
}

/** Strip server-only fields (password_hash) before returning to the client.
 *  has_password mirrors `password_hash IS NOT NULL` so the UI can decide
 *  whether to render the change-password form (Google-only accounts hide
 *  it; users who signed up with a password and later linked Google still
 *  see it). */
export function publicUser(user: PortalUserRow) {
  return {
    id: user.id,
    clinic_id: user.clinic_id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    auth_provider: user.auth_provider,
    is_active: user.is_active === 1,
    has_password: user.password_hash !== null && user.password_hash !== "",
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  };
}

export function publicClinic(clinic: PortalClinicRow) {
  return {
    id: clinic.id,
    name: clinic.name,
    contact_email: clinic.contact_email,
    phone: clinic.phone,
    address: clinic.address,
    is_active: clinic.is_active === 1,
  };
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

/** Append a row to portal_audit_logs. Best-effort — never throws. */
export async function recordAudit(
  db: D1Database,
  args: {
    userId: number | null;
    action: string;
    resourceType?: string | null;
    resourceId?: string | null;
    metadata?: unknown;
    ipAddress?: string | null;
  },
): Promise<void> {
  try {
    await db
      .prepare(
        "INSERT INTO portal_audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(
        args.userId,
        args.action,
        args.resourceType ?? null,
        args.resourceId ?? null,
        args.metadata == null ? null : JSON.stringify(args.metadata),
        args.ipAddress ?? null,
      )
      .run();
  } catch {
    /* swallow — audit must never block the response */
  }
}

/** Best-effort client IP from CF headers; falls back to null. */
export function clientIp(request: Request): string | null {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    null
  );
}

/** Generate a random URL-safe token. 32 bytes ≈ 256 bits of entropy. */
export function generateOpaqueToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** SHA-256(input) as lowercase hex. Used for storing reset-token hashes
 *  so the raw token only ever lives in the email link. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const view = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < view.length; i++) {
    hex += view[i].toString(16).padStart(2, "0");
  }
  return hex;
}
