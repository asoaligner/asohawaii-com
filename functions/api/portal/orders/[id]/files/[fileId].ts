/**
 * GET /api/portal/orders/:id/files/:fileId
 *
 * Auth-gated download for a file uploaded against a portal_orders row.
 * Same access scoping as GET /api/portal/orders/:id — clinic users see
 * their own clinic's files, aso_staff can fetch any. Out-of-scope and
 * "no such file" collapse to a single 404 to prevent id enumeration.
 *
 * Streams the R2 object through with Content-Type taken from the stored
 * metadata and a Content-Disposition that prompts a download with the
 * original filename. Cache-Control is "private, no-store" — these files
 * are clinic-private and the URL itself is the only auth (session
 * cookie + access check happen on every request).
 *
 * Phase 1.5b deploys this endpoint ahead of R2 activation; when
 * env.PORTAL_UPLOADS is unbound we return 503 with `code: 'r2_unbound'`
 * so the UI can show a graceful "uploads not enabled yet" state.
 */

import {
  buildClearCookie,
  jsonResponse,
  resolveSession,
} from "../../../_lib/auth";
import {
  isCrossClinicViewer,
  type PortalOrderRow,
} from "../../../_lib/orders";
import type { PagesFunction, PortalEnv } from "../../../_lib/types";

interface OrderFileRow {
  id: number;
  order_id: number;
  filename: string;
  r2_key: string;
  content_type: string | null;
}

function safeAttachmentName(name: string): string {
  // Strip CR/LF that could split the header; quote inner quotes.
  return name.replace(/[\r\n]/g, " ").replace(/"/g, "\\\"");
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

  const idParam = ctx.params.id;
  const fileIdParam = ctx.params.fileId;
  const orderId = Number.parseInt(
    typeof idParam === "string" ? idParam : "",
    10,
  );
  const fileId = Number.parseInt(
    typeof fileIdParam === "string" ? fileIdParam : "",
    10,
  );
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return jsonResponse({ error: "File not found." }, { status: 404 });
  }
  if (!Number.isFinite(fileId) || fileId <= 0) {
    return jsonResponse({ error: "File not found." }, { status: 404 });
  }

  // Load the order row first to gate access — same 404 collapse as the
  // detail endpoint.
  const order = await ctx.env.DB.prepare(
    "SELECT clinic_id FROM portal_orders WHERE id = ?",
  )
    .bind(orderId)
    .first<Pick<PortalOrderRow, "clinic_id">>();
  if (!order) {
    return jsonResponse({ error: "File not found." }, { status: 404 });
  }
  if (
    !isCrossClinicViewer(resolved.user) &&
    order.clinic_id !== resolved.user.clinic_id
  ) {
    return jsonResponse({ error: "File not found." }, { status: 404 });
  }

  const file = await ctx.env.DB.prepare(
    `SELECT id, order_id, filename, r2_key, content_type
     FROM portal_order_files
     WHERE id = ? AND order_id = ?`,
  )
    .bind(fileId, orderId)
    .first<OrderFileRow>();
  if (!file) {
    return jsonResponse({ error: "File not found." }, { status: 404 });
  }

  if (!ctx.env.PORTAL_UPLOADS) {
    return jsonResponse(
      {
        error:
          "File storage is not configured for this deployment yet.",
        code: "r2_unbound",
      },
      { status: 503 },
    );
  }

  const object = await ctx.env.PORTAL_UPLOADS.get(file.r2_key);
  if (!object) {
    return jsonResponse(
      { error: "File data is missing from storage." },
      { status: 410 },
    );
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    file.content_type || object.httpMetadata?.contentType || "application/octet-stream",
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename="${safeAttachmentName(file.filename)}"`,
  );
  headers.set("Cache-Control", "private, no-store");
  headers.set("Content-Length", String(object.size));

  return new Response(object.body, { status: 200, headers });
};
