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

export interface PortalEnv {
  DB: D1Database;
  /** HMAC secret for signing session JWTs. Required for any auth route. */
  JWT_SECRET: string;
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
