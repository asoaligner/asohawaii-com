/**
 * POST /api/portal/admin/sync/visualdlp
 *
 * Manual VisualDLP sync trigger. aso_staff only. Phase 1.4b-1 returns a
 * stub summary so we can validate the audit trail and admin UI before
 * the real fetch lands in 1.4b-2.
 *
 * Response on success: { ok: true, ... } from runVisualDlpSync.
 * Response on stub-internal failure: { ok: false, error, duration_ms } with
 * a 500. (The Cron path will surface the same shape via its scheduled
 * handler when that wiring lands.)
 */

import { clientIp, jsonResponse } from "../../_lib/auth";
import { requireAsoStaff } from "../../_lib/admin";
import { runVisualDlpSync } from "../../_lib/visualdlp_sync";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  const guard = await requireAsoStaff({
    request: ctx.request,
    db: ctx.env.DB,
    jwtSecret: ctx.env.JWT_SECRET,
  });
  if (guard.kind === "response") return guard.response;

  const result = await runVisualDlpSync({
    db: ctx.env.DB,
    triggeredBy: "manual",
    userId: guard.session.user.id,
    ipAddress: clientIp(ctx.request),
  });

  if (result.ok) {
    return jsonResponse(result);
  }
  return jsonResponse(result, { status: 500 });
};
