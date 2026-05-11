/**
 * Client-side helpers for the portal admin APIs (aso_staff only). Mirrors
 * server projections in functions/api/portal/admin/*; kept in sync by hand
 * since we cannot share types across the static-export / Pages-Function
 * boundary.
 */

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: unknown;
  ip_address: string | null;
  created_at: string;
}

export interface AuditListResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  /** Distinct action values, for the filter dropdown. */
  actions: string[];
}

export interface AuditListParams {
  page?: number;
  limit?: number;
  action?: string;
  /** Numeric user id, or 'system' for user_id IS NULL. */
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

function paramsToQuery(p: AuditListParams): string {
  const u = new URLSearchParams();
  if (p.page) u.set("page", String(p.page));
  if (p.limit) u.set("limit", String(p.limit));
  if (p.action) u.set("action", p.action);
  if (p.userId) u.set("userId", p.userId);
  if (p.dateFrom) u.set("dateFrom", p.dateFrom);
  if (p.dateTo) u.set("dateTo", p.dateTo);
  if (p.search) u.set("search", p.search);
  return u.toString();
}

export async function fetchAuditLog(
  params: AuditListParams,
  signal?: AbortSignal,
): Promise<ApiResult<AuditListResponse>> {
  const qs = paramsToQuery(params);
  try {
    const res = await fetch(`/api/portal/admin/audit${qs ? `?${qs}` : ""}`, {
      credentials: "include",
      cache: "no-store",
      signal,
    });
    if (!res.ok) {
      let error = "Failed to load audit log.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as AuditListResponse;
    return { ok: true, data };
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      return { ok: false, status: 0, error: "aborted" };
    }
    return { ok: false, status: 0, error: "Network error." };
  }
}

// ─── Clinics list ───────────────────────────────────────────────────────

export interface AdminClinicSummary {
  id: number;
  name: string;
  contact_email: string;
  is_active: boolean;
}

export async function fetchAdminClinics(): Promise<
  ApiResult<{ clinics: AdminClinicSummary[] }>
> {
  try {
    const res = await fetch("/api/portal/admin/clinics", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      let error = "Failed to load clinics.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as { clinics: AdminClinicSummary[] };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Network error." };
  }
}

// ─── User management ────────────────────────────────────────────────────

export interface AdminUserSummary {
  id: number;
  clinic_id: number;
  clinic_name: string | null;
  email: string;
  name: string | null;
  role: "member" | "admin" | "aso_staff";
  auth_provider: string | null;
  has_password: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminUsersParams {
  q?: string;
  role?: "member" | "admin" | "aso_staff";
  clinic?: number;
  include?: "active" | "inactive" | "all";
}

export async function fetchAdminUsers(
  params: AdminUsersParams = {},
): Promise<ApiResult<{ users: AdminUserSummary[] }>> {
  const u = new URLSearchParams();
  if (params.q) u.set("q", params.q);
  if (params.role) u.set("role", params.role);
  if (params.clinic) u.set("clinic", String(params.clinic));
  if (params.include) u.set("include", params.include);
  const qs = u.toString();
  try {
    const res = await fetch(
      `/api/portal/admin/users${qs ? `?${qs}` : ""}`,
      { credentials: "include", cache: "no-store" },
    );
    if (!res.ok) {
      let error = "Failed to load users.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as { users: AdminUserSummary[] };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Network error." };
  }
}

export interface UpdateAdminUserInput {
  role?: "member" | "admin";
  is_active?: boolean;
}

export interface UpdateAdminUserResult {
  ok: true;
  changes: number;
  revoked_sessions: number;
  user: AdminUserSummary | null;
}

export async function updateAdminUser(
  id: number,
  input: UpdateAdminUserInput,
): Promise<ApiResult<UpdateAdminUserResult>> {
  try {
    const res = await fetch(`/api/portal/admin/users/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let error = "Failed to update user.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as UpdateAdminUserResult;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Network error." };
  }
}

// ─── User invitation ────────────────────────────────────────────────────

export interface InviteUserInput {
  email: string;
  name?: string;
  clinic_id?: number;
  new_clinic_name?: string;
  role: "member" | "admin";
}

export interface InviteUserOk {
  ok: true;
  invitation_id: number | null;
  email_sent: boolean;
  expires_at: string;
}

export async function inviteUser(
  input: InviteUserInput,
): Promise<ApiResult<InviteUserOk>> {
  try {
    const res = await fetch("/api/portal/admin/users/invite", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let error = "Failed to send invitation.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as InviteUserOk;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Network error." };
  }
}

// ─── VisualDLP sync trigger ─────────────────────────────────────────────

export interface VisualDlpSyncSummary {
  ok: true;
  triggered_by: "manual" | "cron";
  fetched: number;
  upserted: number;
  skipped: number;
  errors: number;
  duration_ms: number;
  message: string;
}

export interface VisualDlpSyncFailure {
  ok: false;
  triggered_by: "manual" | "cron";
  error: string;
  duration_ms: number;
}

export type VisualDlpSyncResponse =
  | VisualDlpSyncSummary
  | VisualDlpSyncFailure;

export async function triggerVisualDlpSync(): Promise<
  ApiResult<VisualDlpSyncResponse>
> {
  try {
    const res = await fetch("/api/portal/admin/sync/visualdlp", {
      method: "POST",
      credentials: "include",
    });
    let body: VisualDlpSyncResponse | { error?: string } | null = null;
    try {
      body = (await res.json()) as VisualDlpSyncResponse | { error?: string };
    } catch {
      /* fall through */
    }
    if (!res.ok && (!body || !("ok" in body))) {
      const error =
        body && "error" in body && body.error
          ? body.error
          : "Failed to trigger sync.";
      return { ok: false, status: res.status, error };
    }
    return { ok: true, data: body as VisualDlpSyncResponse };
  } catch {
    return { ok: false, status: 0, error: "Network error." };
  }
}
