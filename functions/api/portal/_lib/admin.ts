/**
 * Shared admin auth helper. Wraps resolveSession + role check so every
 * /api/portal/admin/* route returns identical 401 / 403 / 500 shapes.
 *
 * Usage:
 *   const guard = await requireAsoStaff({ request, db, jwtSecret });
 *   if (guard.kind === "response") return guard.response;
 *   const session = guard.session;
 *
 * Decision: only `aso_staff` may reach admin routes. Clinic-side `admin`
 * is reserved for a future Phase 2 delegation feature; until then it
 * behaves the same as `member` here.
 */

import {
  buildClearCookie,
  jsonResponse,
  resolveSession,
  type ResolvedSession,
} from "./auth";
import type { D1Database } from "./types";

export type AdminGuard =
  | { kind: "session"; session: ResolvedSession }
  | { kind: "response"; response: Response };

export async function requireAsoStaff(args: {
  request: Request;
  db: D1Database;
  jwtSecret: string | undefined;
}): Promise<AdminGuard> {
  if (!args.jwtSecret) {
    return {
      kind: "response",
      response: jsonResponse(
        { error: "Server is not configured for portal auth." },
        { status: 500 },
      ),
    };
  }
  const session = await resolveSession(args.request, args.db, args.jwtSecret);
  if (!session) {
    return {
      kind: "response",
      response: jsonResponse(
        { error: "Not authenticated." },
        { status: 401, headers: { "Set-Cookie": buildClearCookie() } },
      ),
    };
  }
  if (session.user.role !== "aso_staff") {
    return {
      kind: "response",
      response: jsonResponse(
        { error: "Admin access required." },
        { status: 403 },
      ),
    };
  }
  return { kind: "session", session };
}
