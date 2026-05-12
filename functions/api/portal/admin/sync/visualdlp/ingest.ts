/**
 * POST /api/portal/admin/sync/visualdlp/ingest
 *
 * The PC-side `sync_visualdlp_to_portal.py` runs on Koji's machine,
 * logs into VisualDLP, fetches the date-ranged
 * GetShippingTodayOrderListingForAllBUnitsAsync report, and POSTs the
 * shaped result here. We:
 *   1. validate the X-Sync-Secret header against env in constant time
 *   2. resolve each incoming order to a portal_clinics.id using either
 *      visualdlp_account_id (preferred) or aso_account_number (fallback)
 *   3. UPSERT into portal_orders by (source='visualdlp', source_order_id)
 *      preserving aso_staff edits (internal_memo) and portal-submission
 *      file links (product_photos / stl_files) across re-syncs
 *   4. record one `sync_visualdlp_ingested` audit entry with summary
 *      counts; per-row failures are folded into the counters, not into
 *      individual audit rows
 *
 * Auth model: shared-secret only (NOT session). This endpoint is meant
 * to be reachable from the PC pipeline without a user session, so it
 * cannot use the aso_staff guard. The 1.4b-1 manual trigger at
 * /api/portal/admin/sync/visualdlp stays around for the admin UI but is
 * functionally a stub until — or unless — we point its handler at the
 * same shared sync helper.
 *
 * Body shape:
 *   {
 *     range:        { from: "YYYY-MM-DD", to: "YYYY-MM-DD" },
 *     triggered_by?: "manual" | "cron",
 *     orders: [
 *       {
 *         source_order_id:       string,   // REQUIRED — VisualDLP unique key
 *         visualdlp_account_id?: string,   // preferred clinic mapping
 *         ar_account_number?:    string,   // fallback clinic mapping
 *         order_number?:         string,
 *         patient_name?:         string,
 *         appliance_type?:       string,
 *         order_date?:           "YYYY-MM-DD",
 *         delivery_date?:        "YYYY-MM-DD",
 *         delivery_notes?:       string,
 *         tracking_number?:      string,
 *         tracking_carrier?:     string,
 *         design_notes?:         string,
 *         additional_memo?:      string,
 *         raw?:                  unknown   // original VisualDLP record
 *       },
 *       ...
 *     ]
 *   }
 *
 * Response:
 *   200 { ok: true, summary: { fetched, upserted, skipped_no_clinic, errors, duration_ms } }
 *   401 { error: "Bad sync secret." }
 *   503 { error: "Server is not configured for VisualDLP ingest." }
 */

import {
  clientIp,
  jsonResponse,
  recordAudit,
} from "../../../_lib/auth";
import type { PagesFunction, PortalEnv } from "../../../_lib/types";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function normalizeYmd(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return isYmd(t) ? t : null;
}

function normalizeText(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

interface IngestOrder {
  source_order_id?: unknown;
  visualdlp_account_id?: unknown;
  ar_account_number?: unknown;
  order_number?: unknown;
  patient_name?: unknown;
  appliance_type?: unknown;
  order_date?: unknown;
  delivery_date?: unknown;
  delivery_notes?: unknown;
  tracking_number?: unknown;
  tracking_carrier?: unknown;
  design_notes?: unknown;
  additional_memo?: unknown;
  raw?: unknown;
}

interface IngestBody {
  range?: { from?: unknown; to?: unknown };
  triggered_by?: unknown;
  orders?: IngestOrder[];
}

interface ClinicLookupRow {
  id: number;
  visualdlp_account_id: string | null;
  aso_account_number: string | null;
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.VISUALDLP_INGEST_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for VisualDLP ingest." },
      { status: 503 },
    );
  }

  const provided = ctx.request.headers.get("X-Sync-Secret") ?? "";
  if (!provided || !safeEqual(provided, ctx.env.VISUALDLP_INGEST_SECRET)) {
    return jsonResponse({ error: "Bad sync secret." }, { status: 401 });
  }

  let body: IngestBody;
  try {
    body = (await ctx.request.json()) as IngestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orders = Array.isArray(body.orders) ? body.orders : [];
  const triggeredBy =
    body.triggered_by === "manual" || body.triggered_by === "cron"
      ? body.triggered_by
      : "cron";
  const rangeFrom = normalizeYmd(body.range?.from);
  const rangeTo = normalizeYmd(body.range?.to);

  const started = Date.now();

  // Load the clinic master once. <500 rows; cheaper than per-order
  // lookups against the same table.
  const clinicRes = await ctx.env.DB.prepare(
    "SELECT id, visualdlp_account_id, aso_account_number FROM portal_clinics WHERE is_active = 1",
  ).all<ClinicLookupRow>();
  const clinics = clinicRes.results ?? [];
  const byVdlp = new Map<string, number>();
  const byAr = new Map<string, number>();
  for (const c of clinics) {
    if (c.visualdlp_account_id) {
      byVdlp.set(c.visualdlp_account_id, c.id);
    }
    if (c.aso_account_number) {
      byAr.set(c.aso_account_number, c.id);
    }
  }

  let upserted = 0;
  let skippedNoClinic = 0;
  let errors = 0;
  const skipSamples: string[] = []; // first few skipped IDs for the audit row

  for (const o of orders) {
    const sourceOrderId = normalizeText(o.source_order_id);
    if (!sourceOrderId) {
      errors += 1;
      continue;
    }

    const vdlpAcc = normalizeText(o.visualdlp_account_id);
    const arAcc = normalizeText(o.ar_account_number);
    let clinicId: number | undefined;
    if (vdlpAcc && byVdlp.has(vdlpAcc)) clinicId = byVdlp.get(vdlpAcc);
    else if (arAcc && byAr.has(arAcc)) clinicId = byAr.get(arAcc);

    if (clinicId === undefined) {
      skippedNoClinic += 1;
      if (skipSamples.length < 5) {
        skipSamples.push(
          `${sourceOrderId}${vdlpAcc ? ` (vdlp=${vdlpAcc})` : arAcc ? ` (ar=${arAcc})` : " (no acc)"}`,
        );
      }
      continue;
    }

    const orderNumber = normalizeText(o.order_number);
    const patientName = normalizeText(o.patient_name);
    const applianceType = normalizeText(o.appliance_type);
    const orderDate = normalizeYmd(o.order_date);
    const deliveryDate = normalizeYmd(o.delivery_date);
    const deliveryNotes = normalizeText(o.delivery_notes);
    const trackingNumber = normalizeText(o.tracking_number);
    const trackingCarrier = normalizeText(o.tracking_carrier);
    const designNotes = normalizeText(o.design_notes);
    const additionalMemo = normalizeText(o.additional_memo);
    const sourceDataJson = JSON.stringify({
      raw: o.raw ?? null,
      visualdlp_account_id: vdlpAcc,
      ar_account_number: arAcc,
      ingested_at: new Date().toISOString(),
    });

    try {
      // SQLite UPSERT: INSERT … ON CONFLICT(source, source_order_id) DO UPDATE.
      // Preserve aso_staff fields (internal_memo) and portal-submission
      // file references (product_photos / stl_files / instruction_pdf_url)
      // across re-syncs by NOT writing them in the UPDATE branch.
      await ctx.env.DB.prepare(
        `INSERT INTO portal_orders (
           clinic_id, source, source_order_id, order_number, patient_name,
           appliance_type, order_date, delivery_date, delivery_notes,
           tracking_number, tracking_carrier, design_notes, additional_memo,
           synced_at, source_data
         ) VALUES (?, 'visualdlp', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
         ON CONFLICT(source, source_order_id) DO UPDATE SET
           clinic_id        = excluded.clinic_id,
           order_number     = excluded.order_number,
           patient_name     = excluded.patient_name,
           appliance_type   = excluded.appliance_type,
           order_date       = excluded.order_date,
           delivery_date    = excluded.delivery_date,
           delivery_notes   = excluded.delivery_notes,
           tracking_number  = excluded.tracking_number,
           tracking_carrier = excluded.tracking_carrier,
           design_notes     = excluded.design_notes,
           additional_memo  = excluded.additional_memo,
           synced_at        = excluded.synced_at,
           source_data      = excluded.source_data,
           updated_at       = datetime('now')`,
      )
        .bind(
          clinicId,
          sourceOrderId,
          orderNumber,
          patientName,
          applianceType,
          orderDate,
          deliveryDate,
          deliveryNotes,
          trackingNumber,
          trackingCarrier,
          designNotes,
          additionalMemo,
          sourceDataJson,
        )
        .run();
      upserted += 1;
    } catch {
      errors += 1;
    }
  }

  const duration_ms = Date.now() - started;
  const summary = {
    fetched: orders.length,
    upserted,
    skipped_no_clinic: skippedNoClinic,
    errors,
    duration_ms,
  };

  await recordAudit(ctx.env.DB, {
    userId: null,
    action: "sync_visualdlp_ingested",
    resourceType: "sync",
    resourceId: null,
    metadata: {
      triggered_by: triggeredBy,
      range_from: rangeFrom,
      range_to: rangeTo,
      ...summary,
      skip_samples: skipSamples,
    },
    ipAddress: clientIp(ctx.request),
  });

  return jsonResponse({ ok: true, summary });
};
