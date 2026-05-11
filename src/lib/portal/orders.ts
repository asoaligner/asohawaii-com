/**
 * Client-side helpers for the portal orders API. Mirrors the server-side
 * projection types in functions/api/portal/_lib/orders.ts, kept in sync
 * by hand (this is a static-export site so we cannot share the types
 * directly from the Pages Function module).
 */

export type OrderSource = "visualdlp" | "shop";

export interface OrderListItem {
  id: number;
  clinic_id: number;
  source: OrderSource | string;
  order_number: string | null;
  patient_name: string | null;
  appliance_type: string | null;
  order_date: string | null;
  delivery_date: string | null;
}

export interface OrdersListResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderDetail {
  id: number;
  clinic_id: number;
  source: OrderSource | string;
  source_order_id: string;
  order_number: string | null;
  patient_name: string | null;
  appliance_type: string | null;
  order_date: string | null;
  delivery_date: string | null;
  delivery_notes: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  instruction_pdf_url: string | null;
  product_photos: string[] | null;
  stl_files: string[] | null;
  design_notes: string | null;
  additional_memo: string | null;
  /** aso_staff only. */
  internal_memo?: string | null;
  /** aso_staff only — JSON-parsed if it parsed cleanly server-side. */
  source_data?: unknown;
  /** Present for source='portal' orders. Sanitized form state usable to
   *  pre-fill /portal/submit-case/?from=N. */
  reorder?: {
    patient_reference: string | null;
    arches: "upper" | "lower" | "both" | null;
    arch_sync: boolean;
    appliances_upper: unknown[];
    appliances_lower: unknown[];
    tooth_selection:
      | { dentition: string; upper: string[]; lower: string[] }
      | null;
  };
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: OrderSource;
  dateFrom?: string;
  dateTo?: string;
  applianceType?: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

function paramsToQuery(p: OrdersListParams): string {
  const u = new URLSearchParams();
  if (p.page) u.set("page", String(p.page));
  if (p.limit) u.set("limit", String(p.limit));
  if (p.search) u.set("search", p.search);
  if (p.source) u.set("source", p.source);
  if (p.dateFrom) u.set("dateFrom", p.dateFrom);
  if (p.dateTo) u.set("dateTo", p.dateTo);
  if (p.applianceType) u.set("applianceType", p.applianceType);
  return u.toString();
}

export async function fetchOrders(
  params: OrdersListParams,
  signal?: AbortSignal,
): Promise<ApiResult<OrdersListResponse>> {
  const qs = paramsToQuery(params);
  try {
    const res = await fetch(`/api/portal/orders${qs ? `?${qs}` : ""}`, {
      credentials: "include",
      cache: "no-store",
      signal,
    });
    if (!res.ok) {
      let error = "Failed to load orders.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as OrdersListResponse;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, status: 0, error: "aborted" };
    }
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
}

export interface UpdateOrderInput {
  order_number?: string | null;
  patient_name?: string | null;
  appliance_type?: string | null;
  order_date?: string | null;
  delivery_date?: string | null;
  delivery_notes?: string | null;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  additional_memo?: string | null;
  internal_memo?: string | null;
}

export async function updateOrder(
  id: number,
  input: UpdateOrderInput,
): Promise<ApiResult<{ ok: true; changes: number; order: OrderDetail }>> {
  try {
    const res = await fetch(`/api/portal/orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let error = "Failed to update order.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as {
      ok: true;
      changes: number;
      order: OrderDetail;
    };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
}

export async function askOrderQuestion(
  id: number,
  message: string,
): Promise<ApiResult<{ ok: true }>> {
  try {
    const res = await fetch(`/api/portal/orders/${id}/question`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      let error = "Failed to send question.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    return { ok: true, data: { ok: true } };
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
}

export async function fetchOrder(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<OrderDetail>> {
  try {
    const res = await fetch(`/api/portal/orders/${id}`, {
      credentials: "include",
      cache: "no-store",
      signal,
    });
    if (!res.ok) {
      let error = "Failed to load order.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) error = body.error;
      } catch {
        /* fall through */
      }
      return { ok: false, status: res.status, error };
    }
    const body = (await res.json()) as { order: OrderDetail };
    return { ok: true, data: body.order };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, status: 0, error: "aborted" };
    }
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
}
