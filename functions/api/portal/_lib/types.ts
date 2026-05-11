/**
 * Shared types for portal Pages Functions.
 *
 * These mirror the minimal D1 surface we need (subset of Cloudflare's
 * @cloudflare/workers-types) so we don't have to add that dep just for
 * a handful of functions. Same shape used by the existing admin/chats.ts.
 */

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Result<T = unknown> {
  success: boolean;
  results?: T[];
  meta?: { changes?: number; last_row_id?: number };
}

/** Minimal R2Bucket surface — same modus operandi as the D1 types above:
 *  we don't pull in @cloudflare/workers-types just for these. Phase 1.5b
 *  uses put / get / head / delete; expand as new flows arrive. */
export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | Blob | string,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<{ key: string; size: number; etag: string } | null>;
  get(key: string): Promise<R2Object | null>;
  head(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpEtag: string;
  httpMetadata?: { contentType?: string; contentDisposition?: string };
  body: ReadableStream;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface PortalEnv {
  DB: D1Database;
  /** HMAC secret for signing session JWTs. Required for any auth route. */
  JWT_SECRET: string;
  /** Resend API key. Required by routes that send mail (forgot-password). */
  RESEND_API_KEY?: string;
  /** Optional override of the From address used for portal mail. Defaults
   *  to "ASO Hawaii Portal <noreply@asohawaii.com>". */
  PORTAL_EMAIL_FROM?: string;
  /** Optional override of the Reply-To address. Defaults to
   *  aso-digital@outlook.com so clinic users with low IT literacy can
   *  reply directly to a real human. */
  PORTAL_EMAIL_REPLY_TO?: string;
  /** Google OAuth Client ID — public per Google's docs, lives in
   *  wrangler.toml [vars]. */
  GOOGLE_CLIENT_ID?: string;
  /** Google OAuth Client Secret — Pages Dashboard Secret. Never put
   *  this in wrangler.toml. */
  GOOGLE_CLIENT_SECRET?: string;
  /** Authorized redirect URI registered in Google Cloud Console. Must
   *  match exactly. Lives in wrangler.toml [vars]. */
  GOOGLE_REDIRECT_URI?: string;
  /** R2 bucket for portal-submitted case files (STL / photos / Rx PDFs).
   *  Bound via wrangler.toml `[[r2_buckets]]`. Optional at the type
   *  level so endpoints can degrade gracefully when R2 isn't enabled
   *  on the account yet (Phase 1.5b ships endpoint code ahead of the
   *  bucket activation). */
  PORTAL_UPLOADS?: R2Bucket;
}

export type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (p: Promise<unknown>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

/** Row shape mirroring portal_users. */
export interface PortalUserRow {
  id: number;
  clinic_id: number;
  email: string;
  name: string | null;
  /** Added in migration 0002 (Phase 1.3). May be null on rows that pre-
   *  date the migration if a fresh seed isn't run. */
  phone: string | null;
  role: "member" | "admin" | "aso_staff";
  auth_provider: string | null;
  google_id: string | null;
  easyrx_user_id: string | null;
  password_hash: string | null;
  is_active: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalClinicRow {
  id: number;
  name: string;
  email_domain: string | null;
  aso_account_number: string | null;
  visualdlp_account_id: string | null;
  contact_email: string;
  phone: string | null;
  address: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface PortalSessionRow {
  id: string;
  user_id: number;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
