/**
 * GET /api/portal/auth/me
 *
 * Returns the current user + clinic if the session cookie is valid.
 * Used by the client-side auth guard on /portal/* to decide whether to
 * render the requested screen or bounce to the login page.
 */

import {
  buildClearCookie,
  jsonResponse,
  publicClinic,
  publicUser,
  resolveSession,
} from "../_lib/auth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for portal auth." },
      { status: 500 },
    );
  }

  const resolved = await resolveSession(
    ctx.request,
    ctx.env.DB,
    ctx.env.JWT_SECRET,
  );
  if (!resolved) {
    // Clear stale cookies (expired JWT, deleted session row, etc.) so the
    // client doesn't keep replaying a dead token.
    return jsonResponse(
      { authenticated: false },
      {
        status: 401,
        headers: { "Set-Cookie": buildClearCookie() },
      },
    );
  }

  return jsonResponse({
    authenticated: true,
    user: publicUser(resolved.user),
    clinic: publicClinic(resolved.clinic),
  });
};
