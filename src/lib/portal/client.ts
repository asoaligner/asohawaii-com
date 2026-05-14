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
  /** True when password_hash is set on the row — used by /portal/profile/
   *  to decide whether to render the change-password form. Google-only
   *  accounts get false. */
  has_password: boolean;
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

// ─── Profile ───────────────────────────────────────────────────────────

export interface ProfileFetchOk {
  ok: true;
  user: PortalUser;
  clinic: PortalClinic;
}

export interface ApiErr {
  ok: false;
  status: number;
  error: string;
}

export async function fetchProfile(): Promise<ProfileFetchOk | ApiErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/profile", {
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  const body = (await res.json()) as { user: PortalUser; clinic: PortalClinic };
  return { ok: true, user: body.user, clinic: body.clinic };
}

export interface UpdateProfileInput {
  name?: string | null;
  phone?: string | null;
}

export interface UpdateProfileOk {
  ok: true;
  user: PortalUser;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileOk | ApiErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  const body = (await res.json()) as { user: PortalUser };
  return { ok: true, user: body.user };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordOk {
  ok: true;
  otherSessionsRevoked: number;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordOk | ApiErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/profile/change-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  const body = (await res.json()) as {
    success: boolean;
    otherSessionsRevoked: number;
  };
  return { ok: true, otherSessionsRevoked: body.otherSessionsRevoked };
}

// ─── Invitation accept (no auth required) ─────────────────────────────

export interface InvitationInfo {
  email: string;
  name: string | null;
  clinic_name: string | null;
  role: "member" | "admin" | "aso_staff";
  inviter_name: string | null;
  expires_at: string;
}

export type InvitationInfoResult =
  | { ok: true; info: InvitationInfo }
  | ApiErr;

export async function fetchInvitationInfo(
  token: string,
): Promise<InvitationInfoResult> {
  let res: Response;
  try {
    res = await fetch(
      `/api/portal/auth/invite-info?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  const info = (await res.json()) as InvitationInfo;
  return { ok: true, info };
}

export async function acceptInvitation(input: {
  token: string;
  password: string;
  name?: string;
}): Promise<{ ok: true; redirect: string } | ApiErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/auth/accept-invite", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  const body = (await res.json()) as { ok: true; redirect?: string };
  return { ok: true, redirect: body.redirect ?? "/portal/dashboard/" };
}

async function parseError(res: Response): Promise<ApiErr> {
  let error = "Request failed.";
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) error = body.error;
  } catch {
    /* keep default */
  }
  return { ok: false, status: res.status, error };
}

// ─── Password reset (no auth required) ────────────────────────────────

export async function forgotPassword(email: string): Promise<
  { ok: true } | ApiErr
> {
  let res: Response;
  try {
    res = await fetch("/api/portal/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  return { ok: true };
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<{ ok: true } | ApiErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) {
    return parseError(res);
  }
  return { ok: true };
}

// ─── Phase 2.1 — self-service access application ─────────────────────

export interface ApplyAccessInput {
  email: string;
  name?: string | null;
  doctor_name: string;
  clinic_name: string;
  aso_account_number?: string | null;
  easyrx_email?: string | null;
  reason?: string | null;
}

export interface ApplyAccessOk {
  ok: true;
  pending_id: number;
}

export interface AccessPrefillOk {
  ok: true;
  prefill: { email: string; name: string | null; from_google: boolean } | null;
}

export async function fetchAccessPrefill(): Promise<AccessPrefillOk | null> {
  try {
    const res = await fetch("/api/portal/auth/apply-prefill", {
      credentials: "include",
    });
    if (!res.ok) return null;
    return (await res.json()) as AccessPrefillOk;
  } catch {
    return null;
  }
}

export async function submitAccessApplication(
  input: ApplyAccessInput,
): Promise<ApplyAccessOk | ApiErr> {
  let res: Response;
  try {
    res = await fetch("/api/portal/auth/apply", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
  if (!res.ok) return parseError(res);
  return (await res.json()) as ApplyAccessOk;
}
