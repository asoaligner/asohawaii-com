/**
 * Google OAuth 2.0 helpers — Authorization Code flow with PKCE (S256).
 *
 * Flow at a glance:
 *
 *   /api/portal/auth/google              (POST, this server)
 *     - generate state + code_verifier
 *     - sign JWT carrying both into a 10-min HttpOnly cookie
 *     - 302 to Google's authorize URL with code_challenge
 *
 *   accounts.google.com                  (Google)
 *     - user picks account, grants
 *     - 302 to GOOGLE_REDIRECT_URI?code=...&state=...
 *
 *   /api/portal/auth/google/callback     (GET, this server)
 *     - read state cookie, verify match
 *     - POST code + code_verifier to Google's token endpoint
 *     - GET userinfo with the access_token
 *     - look up portal user by email_verified email
 *     - createSessionForUser, set session cookie, 302 to /portal/dashboard/
 *
 * We deliberately use Google's userinfo endpoint instead of verifying
 * the id_token JWT signature ourselves: the access_token came directly
 * over HTTPS from Google's token endpoint moments ago, and the userinfo
 * fetch authenticates via Bearer with the same token, so trust derives
 * from TLS + the original PKCE binding rather than from JWKS rotation
 * handling we'd otherwise need to ship in the Worker bundle.
 */

import { SignJWT, jwtVerify } from "jose";
import { sha256Hex } from "./auth";

const JWT_ISSUER = "asohawaii-portal";

export const OAUTH_STATE_COOKIE = "aso_portal_oauth_state";
const OAUTH_STATE_TTL_SECONDS = 600; // 10 min — OAuth round-trips finish in seconds

const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

// ─── Random + base64url helpers ────────────────────────────────────

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** PKCE code_verifier: 32 random bytes, base64url-no-pad. */
export function generateCodeVerifier(): string {
  return bytesToBase64Url(randomBytes(32));
}

/** PKCE S256 code_challenge: base64url(SHA-256(verifier)). */
export async function codeChallengeS256(verifier: string): Promise<string> {
  return bytesToBase64Url(hexToBytes(await sha256Hex(verifier)));
}

/** State token for CSRF protection on the redirect round-trip. */
export function generateState(): string {
  return bytesToBase64Url(randomBytes(16));
}

// ─── State cookie ──────────────────────────────────────────────────

interface OAuthStateClaims {
  state: string;
  /** PKCE code_verifier — server-side memory only, never to the client. */
  cv: string;
}

export async function signOAuthState(
  claims: OAuthStateClaims,
  jwtSecret: string,
): Promise<string> {
  return await new SignJWT({ state: claims.state, cv: claims.cv })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_STATE_TTL_SECONDS}s`)
    .sign(encodeSecret(jwtSecret));
}

export async function verifyOAuthState(
  jwt: string,
  jwtSecret: string,
): Promise<OAuthStateClaims | null> {
  try {
    const { payload } = await jwtVerify(jwt, encodeSecret(jwtSecret), {
      issuer: JWT_ISSUER,
    });
    if (typeof payload.state !== "string" || typeof payload.cv !== "string") {
      return null;
    }
    return { state: payload.state, cv: payload.cv };
  } catch {
    return null;
  }
}

export function buildOAuthStateCookie(token: string): string {
  return [
    `${OAUTH_STATE_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${OAUTH_STATE_TTL_SECONDS}`,
  ].join("; ");
}

export function buildClearOAuthStateCookie(): string {
  return [
    `${OAUTH_STATE_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

// ─── Apply-prefill cookie (Phase 2.1) ───────────────────────────────
//
// When an unrecognised Google sign-in lands in the callback, we drop a
// short-lived signed cookie carrying the Google identity hints so
// /portal/request-access/ can prefill the form and /api/portal/auth/apply
// can attach the verified google_id to the new pending row.
//
// Signed (not plaintext base64) because /api/portal/auth/apply trusts the
// `google_id` claim to link the eventual approved portal_users row —
// forging it would let an attacker grab access linked to someone else's
// Google account.

export const APPLY_PREFILL_COOKIE = "aso_portal_apply_prefill";
const APPLY_PREFILL_TTL_SECONDS = 600; // 10 min, matches state cookie

export interface ApplyPrefillClaims {
  email: string;
  google_id: string;
  name: string | null;
}

export async function signApplyPrefill(
  claims: ApplyPrefillClaims,
  jwtSecret: string,
): Promise<string> {
  return await new SignJWT({
    email: claims.email,
    google_id: claims.google_id,
    name: claims.name ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${APPLY_PREFILL_TTL_SECONDS}s`)
    .sign(encodeSecret(jwtSecret));
}

export async function verifyApplyPrefill(
  jwt: string,
  jwtSecret: string,
): Promise<ApplyPrefillClaims | null> {
  try {
    const { payload } = await jwtVerify(jwt, encodeSecret(jwtSecret), {
      issuer: JWT_ISSUER,
    });
    if (
      typeof payload.email !== "string" ||
      typeof payload.google_id !== "string"
    ) {
      return null;
    }
    const name =
      typeof payload.name === "string" && payload.name.length > 0
        ? payload.name
        : null;
    return {
      email: payload.email,
      google_id: payload.google_id,
      name,
    };
  } catch {
    return null;
  }
}

export function buildApplyPrefillCookie(token: string): string {
  return [
    `${APPLY_PREFILL_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${APPLY_PREFILL_TTL_SECONDS}`,
  ].join("; ");
}

export function buildClearApplyPrefillCookie(): string {
  return [
    `${APPLY_PREFILL_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

// ─── Google endpoints ──────────────────────────────────────────────

export interface BuildAuthorizeUrlInput {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}

export function buildGoogleAuthorizeUrl(input: BuildAuthorizeUrlInput): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    scope: "openid email profile",
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
    // online: don't ask for offline_access / refresh tokens — we don't
    // store them and don't need long-lived Google access.
    access_type: "online",
    // Always show the account picker so a user signed into multiple
    // Google accounts can pick the right one.
    prompt: "select_account",
  });
  return `${GOOGLE_AUTHORIZE}?${params.toString()}`;
}

export interface ExchangeCodeInput {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

export type ExchangeResult =
  | { ok: true; tokens: GoogleTokenResponse }
  | { ok: false; error: string };

export async function exchangeCodeForTokens(
  input: ExchangeCodeInput,
): Promise<ExchangeResult> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    client_secret: input.clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
  });
  let res: Response;
  try {
    res = await fetch(GOOGLE_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Google token exchange ${res.status}: ${text.slice(0, 200)}`,
    };
  }
  const tokens = (await res.json()) as GoogleTokenResponse;
  if (!tokens.access_token) {
    return { ok: false, error: "Google token response missing access_token." };
  }
  return { ok: true, tokens };
}

export interface GoogleUserinfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
}

export type UserinfoResult =
  | { ok: true; user: GoogleUserinfo }
  | { ok: false; error: string };

export async function fetchGoogleUserinfo(
  accessToken: string,
): Promise<UserinfoResult> {
  let res: Response;
  try {
    res = await fetch(GOOGLE_USERINFO, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Google userinfo ${res.status}: ${text.slice(0, 200)}`,
    };
  }
  const u = (await res.json()) as Partial<GoogleUserinfo>;
  if (typeof u.sub !== "string" || typeof u.email !== "string") {
    return { ok: false, error: "Google userinfo response missing sub or email." };
  }
  return {
    ok: true,
    user: {
      sub: u.sub,
      email: u.email,
      email_verified: u.email_verified === true,
      name: typeof u.name === "string" ? u.name : undefined,
      given_name: typeof u.given_name === "string" ? u.given_name : undefined,
      family_name: typeof u.family_name === "string" ? u.family_name : undefined,
    },
  };
}
