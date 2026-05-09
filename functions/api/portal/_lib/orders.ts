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

/** Detail projection. internal_memo + source_data appear only when the
 *  viewer is aso_staff. */
export interface PortalOrderDetail {
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
  product_photos: string[] | null;
  stl_files: string[] | null;
  design_notes: string | null;
  additional_memo: string | null;
  /** Present only when the viewer is aso_staff. */
  internal_memo?: string | null;
  /** Present only when the viewer is aso_staff. JSON-parsed if valid. */
  source_data?: unknown;
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

export function publicOrderDetail(
  row: PortalOrderRow,
  viewer: Pick<PortalUserRow, "role">,
): PortalOrderDetail {
  const base: PortalOrderDetail = {
    id: row.id,
    clinic_id: row.clinic_id,
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
    synced_at: row.synced_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
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
