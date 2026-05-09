/**
 * GET  /api/portal/profile  — same shape as /me, returns { user, clinic }
 * PATCH /api/portal/profile — body: { name?, phone? } (each optional;
 *                              null/empty clears the field)
 *
 * Email is intentionally non-editable: changing email would orphan
 * password reset tokens and invalidate Google account links. We surface
 * it as readonly in the UI and require a manual ASO-side update for
 * email migrations.
 */

import {
  buildClearCookie,
  jsonResponse,
  publicClinic,
  publicUser,
  recordAudit,
  resolveSession,
} from "../_lib/auth";
import type {
  PagesFunction,
  PortalEnv,
  PortalUserRow,
} from "../_lib/types";

const NAME_MAX = 100;
const PHONE_MAX = 30;

interface PatchBody {
  name?: unknown;
  phone?: unknown;
}

/** Coerce raw input to either a trimmed non-empty string, null (clears
 *  the field), or undefined (caller didn't supply this key at all). */
function readNullableString(
  raw: unknown,
  fieldName: string,
  maxLen: number,
): { kind: "skip" } | { kind: "set"; value: string | null } | { kind: "error"; error: string } {
  if (raw === undefined) return { kind: "skip" };
  if (raw === null) return { kind: "set", value: null };
  if (typeof raw !== "string") {
    return { kind: "error", error: `${fieldName} must be a string or null.` };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { kind: "set", value: null };
  if (trimmed.length > maxLen) {
    return {
      kind: "error",
      error: `${fieldName} must be ${maxLen} characters or fewer.`,
    };
  }
  return { kind: "set", value: trimmed };
}

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
    return jsonResponse(
      { error: "Not authenticated." },
      { status: 401, headers: { "Set-Cookie": buildClearCookie() } },
    );
  }
  return jsonResponse({
    user: publicUser(resolved.user),
    clinic: publicClinic(resolved.clinic),
  });
};

export const onRequestPatch: PagesFunction<PortalEnv> = async (ctx) => {
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
    return jsonResponse(
      { error: "Not authenticated." },
      { status: 401, headers: { "Set-Cookie": buildClearCookie() } },
    );
  }

  let body: PatchBody;
  try {
    body = (await ctx.request.json()) as PatchBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const nameResult = readNullableString(body.name, "name", NAME_MAX);
  if (nameResult.kind === "error") {
    return jsonResponse({ error: nameResult.error }, { status: 400 });
  }
  const phoneResult = readNullableString(body.phone, "phone", PHONE_MAX);
  if (phoneResult.kind === "error") {
    return jsonResponse({ error: phoneResult.error }, { status: 400 });
  }

  const sets: string[] = [];
  const args: unknown[] = [];
  const auditChanged: Record<string, string | null> = {};

  if (nameResult.kind === "set") {
    sets.push("name = ?");
    args.push(nameResult.value);
    auditChanged.name = nameResult.value;
  }
  if (phoneResult.kind === "set") {
    sets.push("phone = ?");
    args.push(phoneResult.value);
    auditChanged.phone = phoneResult.value;
  }

  if (sets.length === 0) {
    return jsonResponse(
      { error: "Provide at least one of: name, phone." },
      { status: 400 },
    );
  }

  sets.push("updated_at = datetime('now')");
  args.push(resolved.user.id);

  await ctx.env.DB.prepare(
    `UPDATE portal_users SET ${sets.join(", ")} WHERE id = ?`,
  )
    .bind(...args)
    .run();

  const fresh = await ctx.env.DB.prepare(
    "SELECT * FROM portal_users WHERE id = ?",
  )
    .bind(resolved.user.id)
    .first<PortalUserRow>();
  if (!fresh) {
    // Should never happen — we just updated it.
    return jsonResponse(
      { error: "Profile update succeeded but row vanished." },
      { status: 500 },
    );
  }

  await recordAudit(ctx.env.DB, {
    userId: resolved.user.id,
    action: "profile_updated",
    metadata: { changed: auditChanged },
  });

  return jsonResponse({ user: publicUser(fresh) });
};
