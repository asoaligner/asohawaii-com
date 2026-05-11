/**
 * VisualDLP sync helper — shared between the manual admin trigger and the
 * future Cron scheduled handler.
 *
 * Phase 1.4b-1 (current): this is a stub. It records an audit row so we
 * can validate the trigger plumbing end-to-end, returns an empty summary,
 * and does not touch the VisualDLP API yet. Real fetch + UPSERT lands in
 * Phase 1.4b-2 once the VisualDLP orders endpoint is confirmed and the
 * portal_clinics.visualdlp_account_id column is populated.
 *
 * The trigger field on each audit row is the differentiator we'll use
 * later when separating "manual reruns by an admin" from "background
 * cron firings" in the Audit Log UI.
 */

import { recordAudit } from "./auth";
import type { D1Database } from "./types";

export type SyncTrigger = "manual" | "cron";

export interface SyncSummary {
  ok: true;
  triggered_by: SyncTrigger;
  fetched: number;
  upserted: number;
  skipped: number;
  errors: number;
  duration_ms: number;
  message: string;
}

export interface SyncFailure {
  ok: false;
  triggered_by: SyncTrigger;
  error: string;
  duration_ms: number;
}

export type SyncResult = SyncSummary | SyncFailure;

export async function runVisualDlpSync(args: {
  db: D1Database;
  triggeredBy: SyncTrigger;
  /** User id of the admin who triggered it (manual only). */
  userId?: number | null;
  /** Optional IP for the audit row. */
  ipAddress?: string | null;
}): Promise<SyncResult> {
  const started = Date.now();

  try {
    // ── Phase 1.4b-1 stub ──────────────────────────────────────────────
    // Real implementation will:
    //   1. SELECT id, visualdlp_account_id FROM portal_clinics WHERE
    //      visualdlp_account_id IS NOT NULL
    //   2. For each clinic, GET <VisualDLP>/api/orders?account=...&from=<since>
    //      with Bearer auth from VISUALDLP_API_KEY env
    //   3. UPSERT each order into portal_orders (source='visualdlp',
    //      source_order_id=<vdlp id>)
    //   4. Aggregate counts; cap retries on transient errors
    //
    // Until then we just return an empty summary so the manual trigger
    // is testable and the audit pipeline is validated.
    const summary: SyncSummary = {
      ok: true,
      triggered_by: args.triggeredBy,
      fetched: 0,
      upserted: 0,
      skipped: 0,
      errors: 0,
      duration_ms: Date.now() - started,
      message:
        "VisualDLP sync stub — API not connected yet (Phase 1.4b-2 will wire the real fetch).",
    };

    await recordAudit(args.db, {
      userId: args.userId ?? null,
      action: "sync_visualdlp_completed",
      resourceType: "sync",
      resourceId: null,
      metadata: {
        triggered_by: summary.triggered_by,
        fetched: summary.fetched,
        upserted: summary.upserted,
        skipped: summary.skipped,
        errors: summary.errors,
        duration_ms: summary.duration_ms,
        stub: true,
      },
      ipAddress: args.ipAddress ?? null,
    });

    return summary;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const failure: SyncFailure = {
      ok: false,
      triggered_by: args.triggeredBy,
      error: message,
      duration_ms: Date.now() - started,
    };
    await recordAudit(args.db, {
      userId: args.userId ?? null,
      action: "sync_visualdlp_failed",
      resourceType: "sync",
      resourceId: null,
      metadata: {
        triggered_by: failure.triggered_by,
        error: message,
        duration_ms: failure.duration_ms,
        stub: true,
      },
      ipAddress: args.ipAddress ?? null,
    });
    return failure;
  }
}
