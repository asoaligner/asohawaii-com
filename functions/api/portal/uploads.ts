/**
 * POST /api/portal/uploads
 *
 * Single-file upload from the portal submit-case page. The file is
 * stored in the PORTAL_UPLOADS R2 bucket under a key namespaced by
 * clinic and uploader; the response carries the R2 key + metadata which
 * the client then attaches to the eventual /api/portal/orders/submit
 * call. The DB row that links the R2 key to a portal_orders row is
 * inserted by the submit endpoint, NOT here — keeping this endpoint
 * stateless lets us retry uploads without orphaning DB rows.
 *
 * Body: multipart/form-data with fields:
 *   file      — the file blob
 *   category  — 'stl' | 'photo' | 'rx_pdf' | 'other'
 *
 * Limits:
 *   - 30 MB per file (Workers can theoretically take 100 MB but we keep
 *     headroom for the multipart framing + retries).
 *   - Allowed categories enumerated in ALLOWED_CATEGORIES.
 *
 * Returns 503 with a clear message when R2 isn't bound — the rest of
 * the submit flow continues to work via the Formspree email attachment
 * path, the dashboard just won't surface downloads until R2 is enabled.
 */

import {
  buildClearCookie,
  jsonResponse,
  resolveSession,
} from "./_lib/auth";
import type { PagesFunction, PortalEnv } from "./_lib/types";

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB
const ALLOWED_CATEGORIES = ["stl", "photo", "rx_pdf", "other"] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];
function isAllowedCategory(s: string): s is AllowedCategory {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(s);
}

/** base64url-encoded random bytes, used as a per-upload nonce in the R2
 *  key so two uploads of the same filename never collide. */
function randomNonce(byteLength = 8): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Sanitize a user-supplied filename so it's safe to embed in an R2
 *  object key and a Content-Disposition header on download. Keeps the
 *  extension, replaces any non [A-Za-z0-9._-] with `_`, caps at 120
 *  chars. */
function sanitizeFilename(raw: string): string {
  const trimmed = raw.trim() || "file";
  const replaced = trimmed.replace(/[^A-Za-z0-9._-]/g, "_");
  return replaced.slice(0, 120);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

export const onRequestPost: PagesFunction<PortalEnv> = async (ctx) => {
  if (!ctx.env.JWT_SECRET) {
    return jsonResponse(
      { error: "Server is not configured for portal auth." },
      { status: 500 },
    );
  }
  const session = await resolveSession(
    ctx.request,
    ctx.env.DB,
    ctx.env.JWT_SECRET,
  );
  if (!session) {
    return jsonResponse(
      { error: "Not authenticated." },
      { status: 401, headers: { "Set-Cookie": buildClearCookie() } },
    );
  }

  if (!ctx.env.PORTAL_UPLOADS) {
    return jsonResponse(
      {
        error:
          "File uploads are not configured for this deployment yet — please continue without files for now.",
        code: "r2_unbound",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await ctx.request.formData();
  } catch {
    return jsonResponse(
      { error: "Request body must be multipart/form-data." },
      { status: 400 },
    );
  }

  const fileEntry = form.get("file");
  if (!(fileEntry instanceof File)) {
    return jsonResponse({ error: "file is required." }, { status: 400 });
  }
  const categoryRaw = form.get("category");
  const category =
    typeof categoryRaw === "string" ? categoryRaw.trim() : "";
  if (!isAllowedCategory(category)) {
    return jsonResponse(
      {
        error: `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (fileEntry.size <= 0) {
    return jsonResponse({ error: "file is empty." }, { status: 400 });
  }
  if (fileEntry.size > MAX_BYTES) {
    return jsonResponse(
      {
        error: `File exceeds ${Math.round(MAX_BYTES / (1024 * 1024))} MB limit.`,
      },
      { status: 413 },
    );
  }

  const safeName = sanitizeFilename(fileEntry.name);
  const r2Key = [
    "submissions",
    String(session.user.clinic_id),
    String(session.user.id),
    todayDate(),
    `${randomNonce()}-${safeName}`,
  ].join("/");

  try {
    await ctx.env.PORTAL_UPLOADS.put(r2Key, fileEntry.stream(), {
      httpMetadata: {
        contentType: fileEntry.type || "application/octet-stream",
      },
    });
  } catch (err) {
    return jsonResponse(
      {
        error:
          err instanceof Error
            ? `R2 put failed: ${err.message}`
            : "R2 put failed.",
      },
      { status: 502 },
    );
  }

  return jsonResponse({
    ok: true,
    key: r2Key,
    filename: safeName,
    original_filename: fileEntry.name,
    content_type: fileEntry.type || "application/octet-stream",
    size_bytes: fileEntry.size,
    category,
  });
};
