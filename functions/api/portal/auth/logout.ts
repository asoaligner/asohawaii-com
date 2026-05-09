/**
 * POST /api/portal/auth/logout
 *
 * Deletes the current session row (revoking outstanding JWTs that point
 * at it) and returns a Set-Cookie that clears the cookie. Idempotent —
 * succeeds with 200 even if no session exists.
 */

import {
  COOKIE_NAME,
  buildClearCookie,
  clientIp,
  jsonResponse,
  readCookie,
  recordAudit,
  verifySessionJwt,
} from "../_lib/auth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  const token = readCookie(ctx.request, COOKIE_NAME);

  if (token && ctx.env.JWT_SECRET) {
    const claims = await verifySessionJwt(token, ctx.env.JWT_SECRET);
    if (claims) {
      await ctx.env.DB.prepare(
        "DELETE FROM portal_sessions WHERE id = ?",
      )
        .bind(claims.sid)
        .run();

      await recordAudit(ctx.env.DB, {
        userId: claims.uid,
        action: "logout",
        resourceType: "session",
        resourceId: claims.sid,
        ipAddress: clientIp(ctx.request),
      });
    }
  }

  return jsonResponse(
    { success: true },
    { headers: { "Set-Cookie": buildClearCookie() } },
  );
};
