/**
 * POST /api/portal/auth/google
 *
 * Initiates the Google OAuth Authorization Code + PKCE flow.
 * Generates state + code_verifier, stores both in a signed 10-minute
 * HttpOnly cookie, and redirects (302) to Google's authorize URL.
 *
 * Spec uses POST so a stray <a> click or a search engine crawler can't
 * accidentally start an OAuth flow. Both the sign-in page and the
 * accept-invite page submit a small <form method="POST"> when the
 * "Continue with Google" button is clicked.
 *
 * Two intents:
 *   • Default ("login")        — existing /portal/ sign-in path
 *   • "accept_invite"          — accept-invite page sends the invitation
 *                                token in the form body. We validate
 *                                the token here so an obviously dead
 *                                token short-circuits before we round-
 *                                trip to Google. The token is embedded
 *                                in the state JWT (never on the URL).
 */

import { jsonResponse, sha256Hex } from "../../_lib/auth";
import {
  buildGoogleAuthorizeUrl,
  buildOAuthStateCookie,
  codeChallengeS256,
  generateCodeVerifier,
  generateState,
  signOAuthState,
} from "../../_lib/oauth";
import type { PagesFunction, PortalEnv } from "../../_lib/types";

function configError(reason: string): Response {
  return jsonResponse(
    { error: `Google sign-in is not configured (${reason}).` },
    { status: 500 },
  );
}

function inviteErrorRedirect(code: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/portal/?error=${encodeURIComponent(code)}`,
      "Cache-Control": "no-store",
    },
  });
}

/** Pull a single string field from either form-urlencoded or JSON body
 *  without throwing — returns null when missing or the wrong shape. */
async function readBodyField(
  request: Request,
  name: string,
): Promise<string | null> {
  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      const v = json[name];
      return typeof v === "string" ? v : null;
    }
    // application/x-www-form-urlencoded or multipart/form-data
    const form = await request.formData();
    const v = form.get(name);
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) return configError("missing JWT_SECRET");
  if (!ctx.env.GOOGLE_CLIENT_ID) return configError("missing GOOGLE_CLIENT_ID");
  if (!ctx.env.GOOGLE_REDIRECT_URI)
    return configError("missing GOOGLE_REDIRECT_URI");

  // Optional invite token. We *clone* the request so reading the body
  // here doesn't block the rest of the handler — though in practice
  // nothing else needs the body, so the clone is defensive.
  const inviteToken = await readBodyField(ctx.request.clone(), "invite_token");

  let intent: "login" | "accept_invite" = "login";
  if (inviteToken) {
    // Short-circuit obviously dead tokens BEFORE we send the user
    // round-tripping to Google. We only do a soft validation here; the
    // callback re-validates atomically once Google identifies the user.
    const tokenHash = await sha256Hex(inviteToken);
    const row = await ctx.env.DB.prepare(
      `SELECT id, used_at, revoked_at, expires_at
         FROM portal_invitations WHERE token_hash = ?`,
    )
      .bind(tokenHash)
      .first<{
        id: number;
        used_at: string | null;
        revoked_at: string | null;
        expires_at: string;
      }>();
    if (!row) return inviteErrorRedirect("invite_invalid");
    if (row.used_at) return inviteErrorRedirect("invite_used");
    if (row.revoked_at) return inviteErrorRedirect("invite_revoked");
    const expiresMs = Date.parse(row.expires_at.replace(" ", "T") + "Z");
    if (Number.isFinite(expiresMs) && expiresMs < Date.now()) {
      return inviteErrorRedirect("invite_expired");
    }
    intent = "accept_invite";
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await codeChallengeS256(codeVerifier);

  const stateJwt = await signOAuthState(
    {
      state,
      cv: codeVerifier,
      intent,
      invite_token: inviteToken ?? undefined,
    },
    ctx.env.JWT_SECRET,
  );

  const url = buildGoogleAuthorizeUrl({
    clientId: ctx.env.GOOGLE_CLIENT_ID,
    redirectUri: ctx.env.GOOGLE_REDIRECT_URI,
    state,
    codeChallenge,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Set-Cookie": buildOAuthStateCookie(stateJwt),
      "Cache-Control": "no-store",
    },
  });
};
