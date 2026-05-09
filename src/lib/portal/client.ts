/**
 * Client-side helpers for the portal auth flow. Lives outside `app/` so
 * non-page modules can import without dragging the App Router runtime.
 */

export interface PortalUser {
  id: number;
  clinic_id: number;
  email: string;
  name: string | null;
  /** Added in Phase 1.3. May be null. */
  phone: string | null;
  role: "member" | "admin" | "aso_staff";
  auth_provider: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface PortalClinic {
  id: number;
  name: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
}

export interface PortalSessionPayload {
  user: PortalUser;
  clinic: PortalClinic;
}

export interface MeOk {
  authenticated: true;
  user: PortalUser;
  clinic: PortalClinic;
}

export interface MeUnauth {
  authenticated: false;
}

export type MeResponse = MeOk | MeUnauth;

/** GET /api/portal/auth/me. Returns null on network failure (treat as
 *  unauth so the guard can bounce to the login page). */
export async function fetchMe(): Promise<MeResponse | null> {
  try {
    const res = await fetch("/api/portal/auth/me", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) {
      return { authenticated: false };
    }
    if (!res.ok) return null;
    const data = (await res.json()) as MeResponse;
    return data;
  } catch {
    return null;
  }
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOk {
  ok: true;
  payload: PortalSessionPayload;
}

export interface LoginErr {
  ok: false;
  error: string;
}

export async function login(input: LoginInput): Promise<LoginOk | LoginErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }

  if (res.ok) {
    const payload = (await res.json()) as PortalSessionPayload;
    return { ok: true, payload };
  }

  let message = "Sign-in failed. Please try again.";
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) message = body.error;
  } catch {
    /* fall through with default */
  }
  return { ok: false, error: message };
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/portal/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* server-side row may stay; cookie still cleared on next /me 401 */
  }
}
