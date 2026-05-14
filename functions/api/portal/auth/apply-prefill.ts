/**
 * GET /api/portal/auth/apply-prefill  (public)
 *
 * /portal/request-access/ fetches this on mount to detect a verified
 * Google identity hint dropped by the OAuth callback. Returns 200 with
 * the email + name when a valid signed cookie is present, 200 with
 * { ok: true, prefill: null } otherwise.
 *
 * `google_id` is NOT echoed back — it's a server-side claim that only
 * gets consumed by /api/portal/auth/apply (where the cookie is re-read
 * + re-verified), so we never expose it to JS that could leak it via
 * XSS or third-party scripts.
 */

import { jsonResponse, readCookie } from "../_lib/auth";
import { APPLY_PREFILL_COOKIE, verifyApplyPrefill } from "../_lib/oauth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  const token = readCookie(ctx.request, APPLY_PREFILL_COOKIE);
  if (!token) {
    return jsonResponse({ ok: true, prefill: null });
  }
  const claims = await verifyApplyPrefill(token, ctx.env.JWT_SECRET);
  if (!claims) {
    return jsonResponse({ ok: true, prefill: null });
  }
  return jsonResponse({
    ok: true,
    prefill: {
      email: claims.email,
      name: claims.name,
      // Boolean so the UI can show "from your Google sign-in" without
      // exposing the actual sub claim.
      from_google: true,
    },
  });
};
