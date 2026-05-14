/**
 * GET /api/portal/auth/google/callback
 *
 * Handles Google's redirect after the user grants. Validates the state
 * cookie, exchanges the code for tokens, fetches userinfo, matches a
 * portal_users row, and creates a session.
 *
 * Outcomes:
 *   - Successful match → 302 to /portal/dashboard/ with session cookie
 *   - Failed match (no user / disabled / unverified email / etc.) →
 *     302 to /portal/?error=<code> with the OAuth state cookie cleared
 *
 * Account linking: a Google login matched by email auto-links the
 * google_id onto the row if it isn't set yet, so subsequent Google
 * logins are O(1) instead of always going through email.
 *
 * The OAuth state cookie is always cleared on exit so a refresh of the
 * callback URL (with stale code) cannot re-trigger the exchange.
 */

import {
  buildClearCookie,
  clientIp,
  createSessionForUser,
  readCookie,
  recordAudit,
} from "../../_lib/auth";
import {
  OAUTH_STATE_COOKIE,
  buildApplyPrefillCookie,
  buildClearOAuthStateCookie,
  exchangeCodeForTokens,
  fetchGoogleUserinfo,
  signApplyPrefill,
  verifyOAuthState,
} from "../../_lib/oauth";
import type {
  PagesFunction,
  PortalEnv,
  PortalUserRow,
} from "../../_lib/types";

type ErrorCode =
  | "missing_state"
  | "invalid_state"
  | "state_mismatch"
  | "missing_code"
  | "google_denied"
  | "token_exchange_failed"
  | "userinfo_failed"
  | "email_unverified"
  | "not_registered"
  | "account_disabled"
  | "google_id_conflict"
  | "unknown";

function errorRedirect(
  code: ErrorCode,
  extraSetCookie?: string,
): Response {
  const headers = new Headers();
  headers.set("Location", `/portal/?error=${encodeURIComponent(code)}`);
  headers.set("Cache-Control", "no-store");
  headers.append("Set-Cookie", buildClearOAuthStateCookie());
  if (extraSetCookie) headers.append("Set-Cookie", extraSetCookie);
  return new Response(null, { status: 302, headers });
}

export const onRequestGet: PagesFunction<PortalEnv> = async (ctx) => {
  if (
    !ctx.env.JWT_SECRET ||
    !ctx.env.GOOGLE_CLIENT_ID ||
    !ctx.env.GOOGLE_CLIENT_SECRET ||
    !ctx.env.GOOGLE_REDIRECT_URI
  ) {
    return errorRedirect("unknown");
  }

  const url = new URL(ctx.request.url);
  const ip = clientIp(ctx.request);

  // Google passes ?error=access_denied (etc.) when the user cancels.
  const googleError = url.searchParams.get("error");
  if (googleError) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "google_login_failed",
      metadata: { stage: "google_redirect", googleError },
      ipAddress: ip,
    });
    return errorRedirect("google_denied");
  }

  const code = url.searchParams.get("code");
  const stateFromUrl = url.searchParams.get("state");
  if (!code) return errorRedirect("missing_code");
  if (!stateFromUrl) return errorRedirect("missing_state");

  const stateJwt = readCookie(ctx.request, OAUTH_STATE_COOKIE);
  if (!stateJwt) return errorRedirect("missing_state");

  const stateClaims = await verifyOAuthState(stateJwt, ctx.env.JWT_SECRET);
  if (!stateClaims) return errorRedirect("invalid_state");
  if (stateClaims.state !== stateFromUrl) return errorRedirect("state_mismatch");

  const exchange = await exchangeCodeForTokens({
    clientId: ctx.env.GOOGLE_CLIENT_ID,
    clientSecret: ctx.env.GOOGLE_CLIENT_SECRET,
    redirectUri: ctx.env.GOOGLE_REDIRECT_URI,
    code,
    codeVerifier: stateClaims.cv,
  });
  if (!exchange.ok) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "google_login_failed",
      metadata: { stage: "token_exchange", error: exchange.error },
      ipAddress: ip,
    });
    return errorRedirect("token_exchange_failed");
  }

  const userinfo = await fetchGoogleUserinfo(exchange.tokens.access_token);
  if (!userinfo.ok) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "google_login_failed",
      metadata: { stage: "userinfo", error: userinfo.error },
      ipAddress: ip,
    });
    return errorRedirect("userinfo_failed");
  }

  if (!userinfo.user.email_verified) {
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "google_login_failed",
      metadata: {
        stage: "userinfo_verified_check",
        email: userinfo.user.email,
        sub: userinfo.user.sub,
      },
      ipAddress: ip,
    });
    return errorRedirect("email_unverified");
  }

  const email = userinfo.user.email.trim().toLowerCase();
  const sub = userinfo.user.sub;

  // 1) Try the cached link first — fastest path for repeat logins.
  let user = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE google_id = ?",
  )
    .bind(sub)
    .first<PortalUserRow>();

  // 2) Fall back to email lookup. Auto-link google_id on the row if
  //    not yet set; reject if the row already has a different sub.
  if (!user) {
    user = await ctx.env.DB.prepare(
      "SELECT * FROM portal_users WHERE email = ?",
    )
      .bind(email)
      .first<PortalUserRow>();
    if (user) {
      if (user.google_id && user.google_id !== sub) {
        await recordAudit(ctx.env.DB, {
          userId: user.id,
          action: "google_login_failed",
          metadata: {
            stage: "google_id_conflict",
            email,
            existingSub: user.google_id,
            attemptedSub: sub,
          },
          ipAddress: ip,
        });
        return errorRedirect("google_id_conflict");
      }
      if (!user.google_id) {
        await ctx.env.DB.prepare(
          "UPDATE portal_users SET google_id = ?, updated_at = datetime('now') WHERE id = ?",
        )
          .bind(sub, user.id)
          .run();
        await recordAudit(ctx.env.DB, {
          userId: user.id,
          action: "google_account_linked",
          metadata: { sub },
          ipAddress: ip,
        });
        user.google_id = sub;
      }
    }
  }

  if (!user) {
    // Phase 2.1 — divert unrecognised Google sign-ins to the
    // self-service application form rather than dropping them at the
    // sign-in page with an unhelpful error code. The signed prefill
    // cookie carries the Google identity hints so the form can preload
    // them and the eventual approval links the new portal_users row to
    // this google_id.
    await recordAudit(ctx.env.DB, {
      userId: null,
      action: "google_login_redirected_to_apply",
      metadata: { email, sub, has_name: !!userinfo.user.name },
      ipAddress: ip,
    });
    const prefillJwt = await signApplyPrefill(
      {
        email,
        google_id: sub,
        name: userinfo.user.name ?? null,
      },
      ctx.env.JWT_SECRET,
    );
    const headers = new Headers();
    headers.set("Location", "/portal/request-access/?from=google");
    headers.set("Cache-Control", "no-store");
    headers.append("Set-Cookie", buildClearOAuthStateCookie());
    headers.append("Set-Cookie", buildApplyPrefillCookie(prefillJwt));
    return new Response(null, { status: 302, headers });
  }

  if (user.is_active !== 1) {
    await recordAudit(ctx.env.DB, {
      userId: user.id,
      action: "google_login_failed",
      metadata: { stage: "account_disabled", email, sub },
      ipAddress: ip,
    });
    return errorRedirect("account_disabled");
  }

  // Backfill the user's name from Google's display name if our row
  // doesn't have one yet — pleasant UX win for first-time logins.
  if (!user.name && userinfo.user.name) {
    await ctx.env.DB.prepare(
      "UPDATE portal_users SET name = ?, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(userinfo.user.name, user.id)
      .run();
  }

  const session = await createSessionForUser(
    ctx.env.DB,
    user,
    ctx.env.JWT_SECRET,
    ctx.request,
  );

  await recordAudit(ctx.env.DB, {
    userId: user.id,
    action: "login_success",
    resourceType: "session",
    resourceId: session.sessionId,
    metadata: { provider: "google" },
    ipAddress: ip,
  });

  // Success: clear the OAuth state cookie + set the session cookie + go
  // to the dashboard.
  const headers = new Headers();
  headers.set("Location", "/portal/dashboard/");
  headers.set("Cache-Control", "no-store");
  headers.append("Set-Cookie", buildClearOAuthStateCookie());
  headers.append("Set-Cookie", session.cookie);
  return new Response(null, { status: 302, headers });
};

