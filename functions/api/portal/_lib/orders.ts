/**
 * Shared shape + projection helpers for portal_orders.
 *
 * `internal_memo` and `source_data` are strictly ASO-internal: they hold
 * staff comments and raw upstream JSON respectively. publicOrder() and
 * publicOrderDetail() guarantee they only leak when the caller is aso_staff.
 *
 * Access scoping (clinic vs cross-clinic) is enforced by the API handler
 * via SQL WHERE clauses, not here. This module only owns row->JSON.
 */

import type { PortalUserRow } from "./types";

export interface PortalOrderRow {
  id: number;
  clinic_id: number;
  source: string;
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
  product_photos: string | null;
  stl_files: string | null;
  design_notes: string | null;
  additional_memo: string | null;
  internal_memo: string | null;
  review_slug: string | null;
  synced_at: string | null;
  source_data: string | null;
  created_at: string;
  updated_at: string;
}

/** Compact projection used in the list endpoint — no notes, no files,
 *  no internal fields. */
export interface PortalOrderListItem {
  id: number;
  clinic_id: number;
  source: string;
  order_number: string | null;
  patient_name: string | null;
  appliance_type: string | null;
  order_date: string | null;
  delivery_date: string | null;
}

export function publicOrderListItem(row: PortalOrderRow): PortalOrderListItem {
  return {
    id: row.id,
    clinic_id: row.clinic_id,
    source: row.source,
    order_number: row.order_number,
    patient_name: row.patient_name,
    appliance_type: row.appliance_type,
    order_date: row.order_date,
    delivery_date: row.delivery_date,
  };
}

/** Sanitized form-state projection for Reorder. Present only on portal-
 *  sourced rows whose source_data was written by /api/portal/orders/submit.
 *  Visible to clinic users on their own orders (it's data they submitted)
 *  — not gated by aso_staff like source_data is. */
export interface PortalOrderReorderData {
  patient_reference: string | null;
  arches: "upper" | "lower" | "both" | null;
  arch_sync: boolean;
  appliances_upper: unknown[];
  appliances_lower: unknown[];
  tooth_selection:
    | { dentition: string; upper: string[]; lower: string[] }
    | null;
}

/** Per-file metadata for the order detail response. R2 keys are
 *  deliberately NOT exposed to the client — downloads go through
 *  /api/portal/orders/:id/files/:fileId which auth-gates and streams
 *  from R2 server-side. */
export interface PortalOrderFileSummary {
  id: number;
  category: string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

/** Detail projection. internal_memo + source_data appear only when the
 *  viewer is aso_staff. reorder is present for portal-sourced rows for
 *  all viewers (the submitter's own form state). */
export interface PortalOrderDetail {
  id: number;
  clinic_id: number;
  /** Name of the clinic that owns this order. Joined from
   *  portal_clinics so the order detail page can drive a clinic-aware
   *  aligner-setup-review match without a second round-trip. */
  clinic_name: string | null;
  source: string;
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
  /** aso_staff override pinning a specific /cases/{slug}/ review to
   *  this order. When set, the order detail UI uses it verbatim and
   *  skips the manifest fuzzy-match. */
  review_slug: string | null;
  /** Present only when the viewer is aso_staff. */
  internal_memo?: string | null;
  /** Present only when the viewer is aso_staff. JSON-parsed if valid. */
  source_data?: unknown;
  /** Present for source='portal' orders; reused by /portal/submit-case/?from=N. */
  reorder?: PortalOrderReorderData;
  /** Files uploaded against this order. Empty array when R2 isn't bound
   *  or the order pre-dates the file-upload migration. Always present
   *  (never undefined) so the UI can render an empty state cleanly. */
  files: PortalOrderFileSummary[];
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

function safeParseJsonArray(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : null;
  } catch {
    return null;
  }
}

function safeParseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function buildReorderData(
  row: PortalOrderRow,
): PortalOrderReorderData | undefined {
  if (row.source !== "portal" || !row.source_data) return undefined;
  let sd: {
    patient_reference?: string | null;
    arches?: "upper" | "lower" | "both" | null;
    arch_sync?: boolean | null;
    appliances?: { upper?: unknown[]; lower?: unknown[] } | null;
    tooth_selection?: {
      dentition: string;
      upper: string[];
      lower: string[];
    } | null;
  };
  try {
    sd = JSON.parse(row.source_data);
  } catch {
    return undefined;
  }
  return {
    patient_reference: sd.patient_reference ?? null,
    arches: sd.arches ?? null,
    arch_sync: sd.arch_sync ?? false,
    appliances_upper: Array.isArray(sd.appliances?.upper)
      ? sd.appliances!.upper
      : [],
    appliances_lower: Array.isArray(sd.appliances?.lower)
      ? sd.appliances!.lower
      : [],
    tooth_selection: sd.tooth_selection ?? null,
  };
}

export function publicOrderDetail(
  row: PortalOrderRow,
  viewer: Pick<PortalUserRow, "role">,
  files: PortalOrderFileSummary[] = [],
  clinicName: string | null = null,
): PortalOrderDetail {
  const base: PortalOrderDetail = {
    id: row.id,
    clinic_id: row.clinic_id,
    clinic_name: clinicName,
    source: row.source,
    source_order_id: row.source_order_id,
    order_number: row.order_number,
    patient_name: row.patient_name,
    appliance_type: row.appliance_type,
    order_date: row.order_date,
    delivery_date: row.delivery_date,
    delivery_notes: row.delivery_notes,
    tracking_number: row.tracking_number,
    tracking_carrier: row.tracking_carrier,
    instruction_pdf_url: row.instruction_pdf_url,
    product_photos: safeParseJsonArray(row.product_photos),
    stl_files: safeParseJsonArray(row.stl_files),
    design_notes: row.design_notes,
    additional_memo: row.additional_memo,
    review_slug: row.review_slug,
    files,
    synced_at: row.synced_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
  const reorder = buildReorderData(row);
  if (reorder) base.reorder = reorder;
  if (viewer.role === "aso_staff") {
    base.internal_memo = row.internal_memo;
    base.source_data = safeParseJson(row.source_data);
  }
  return base;
}

/** True when the user can see all clinics' orders. */
export function isCrossClinicViewer(user: Pick<PortalUserRow, "role">): boolean {
  return user.role === "aso_staff";
}
