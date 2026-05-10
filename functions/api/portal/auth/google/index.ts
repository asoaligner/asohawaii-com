/**
 * POST /api/portal/auth/google
 *
 * Initiates the Google OAuth Authorization Code + PKCE flow.
 * Generates state + code_verifier, stores both in a signed 10-minute
 * HttpOnly cookie, and redirects (302) to Google's authorize URL.
 *
 * Spec uses POST so a stray <a> click or a search engine crawler can't
 * accidentally start an OAuth flow. The login page uses a small <form
 * method="POST"> that submits when the "Continue with Google" button
 * is clicked.
 */

import { jsonResponse } from "../../_lib/auth";
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

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) return configError("missing JWT_SECRET");
  if (!ctx.env.GOOGLE_CLIENT_ID) return configError("missing GOOGLE_CLIENT_ID");
  if (!ctx.env.GOOGLE_REDIRECT_URI)
    return configError("missing GOOGLE_REDIRECT_URI");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await codeChallengeS256(codeVerifier);

  const stateJwt = await signOAuthState(
    { state, cv: codeVerifier },
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
