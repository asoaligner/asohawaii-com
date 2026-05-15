/**
 * POST /api/portal/orders/submit
 *
 * Records a portal-originated case submission. Called by the portal
 * submit-case page AFTER the form has already POSTed to Formspree (the
 * lab's existing email workflow). This endpoint only writes the matching
 * portal_orders row so the clinic sees their submission in the dashboard
 * immediately.
 *
 * Phase 1.5a (Option A): files are NOT uploaded to R2 here — the portal
 * row carries the file names only; the actual binaries continue to flow
 * to the lab via the Formspree attachment path. Phase 1.5b will swap in
 * R2 once we want portal-side downloads.
 *
 * Body shape (JSON):
 *   {
 *     reference          string,      // ASO-xxx-xxx, becomes source_order_id + order_number
 *     patient_reference  string,
 *     arches             "upper"|"lower"|"both",
 *     arch_sync          boolean,
 *     appliances_summary string,      // human-readable lines, stored in design_notes
 *     appliances_json    {upper:[],lower:[]},
 *     tooth_selection    { dentition, upper, lower },
 *     due_date           "YYYY-MM-DD",
 *     shipping_address   string,
 *     special_instructions string,
 *     files              [{ name, size, type, category }],
 *     doctor_override?   string       // when the form's doctor field differs from session user.name
 *   }
 */

import {
  buildClearCookie,
  clientIp,
  jsonResponse,
  recordAudit,
  resolveSession,
} from "../_lib/auth";
import type { PagesFunction, PortalEnv } from "../_lib/types";

interface SubmitFile {
  name: string;
  size: number;
  type: string;
  category: "stl" | "photos" | "rxPdf";
  /** Optional R2 key, populated when the file was uploaded via
   *  POST /api/portal/uploads before this submit. Phase 1.5b. */
  r2_key?: string;
}

interface SubmitBody {
  reference: string;
  patient_reference?: string;
  arches?: string;
  arch_sync?: boolean;
  appliances_summary?: string;
  appliances_json?: {
    upper?: Array<{ applianceId?: string; itemName?: string }>;
    lower?: Array<{ applianceId?: string; itemName?: string }>;
  };
  tooth_selection?: { dentition: string; upper: string[]; lower: string[] };
  due_date?: string;
  shipping_address?: string;
  special_instructions?: string;
  files?: SubmitFile[];
  doctor_override?: string;
}

const FORM_CATEGORY_TO_DB: Record<SubmitFile["category"], string> = {
  stl: "stl",
  photos: "photo",
  rxPdf: "rx_pdf",
};

function deriveApplianceType(j: SubmitBody["appliances_json"]): string | null {
  if (!j) return null;
  const upper = j.upper ?? [];
  const lower = j.lower ?? [];
  const total = upper.length + lower.length;
  if (total === 0) return null;
  const first = upper[0] ?? lower[0];
  const label = first?.itemName || first?.applianceId || null;
  if (total > 1) return label ? `${label} (+${total - 1})` : null;
  return label;
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

  let body: SubmitBody;
  try {
    body = (await ctx.request.json()) as SubmitBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !body.reference ||
    typeof body.reference !== "string" ||
    body.reference.length > 64
  ) {
    return jsonResponse(
      { error: "reference is required (≤64 chars)." },
      { status: 400 },
    );
  }
  if (body.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(body.due_date)) {
    return jsonResponse(
      { error: "due_date must be YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const files = Array.isArray(body.files) ? body.files : [];
  const stlFiles = files
    .filter((f) => f.category === "stl")
    .map((f) => f.name);
  const photoFiles = files
    .filter((f) => f.category === "photos")
    .map((f) => f.name);
  const rxPdfNames = files
    .filter((f) => f.category === "rxPdf")
    .map((f) => f.name);

  const applianceType = deriveApplianceType(body.appliances_json);
  const today = new Date().toISOString().slice(0, 10);

  // Compose delivery_notes from the form fields. ship-to lives separately
  // from special_instructions; combine for the dashboard's single column.
  const deliveryLines: string[] = [];
  if (body.shipping_address?.trim()) {
    deliveryLines.push(`Ship to: ${body.shipping_address.trim()}`);
  }
  if (rxPdfNames.length > 0) {
    deliveryLines.push(`Rx PDF: ${rxPdfNames.join(", ")}`);
  }
  const deliveryNotes = deliveryLines.length
    ? deliveryLines.join("\n")
    : null;

  const sourceData = {
    reference: body.reference,
    patient_reference: body.patient_reference ?? null,
    arches: body.arches ?? null,
    arch_sync: body.arch_sync ?? null,
    appliances: body.appliances_json ?? null,
    tooth_selection: body.tooth_selection ?? null,
    files,
    submitted_by_user_id: session.user.id,
    submitted_by_email: session.user.email,
    doctor_name: body.doctor_override || session.user.name,
  };

  let newId: number | null = null;
  try {
    const result = await ctx.env.DB.prepare(
      `INSERT INTO portal_orders (
         clinic_id, source, source_order_id, order_number, patient_name,
         appliance_type, order_date, delivery_date, delivery_notes,
         product_photos, stl_files, design_notes, additional_memo,
         synced_at, source_data
       ) VALUES (?, 'portal', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
    )
      .bind(
        session.user.clinic_id,
        body.reference,
        body.reference,
        body.patient_reference?.trim() || null,
        applianceType,
        today,
        body.due_date || null,
        deliveryNotes,
        photoFiles.length ? JSON.stringify(photoFiles) : null,
        stlFiles.length ? JSON.stringify(stlFiles) : null,
        body.appliances_summary?.trim() || null,
        body.special_instructions?.trim() || null,
        JSON.stringify(sourceData),
      )
      .run();
    newId =
      result.meta?.last_row_id != null ? Number(result.meta.last_row_id) : null;
  } catch (err) {
    // UNIQUE(source, source_order_id) collision is the realistic case.
    // Surface a 409 so the client can retry with a fresh reference.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique")) {
      return jsonResponse(
        { error: "Duplicate submission reference. Please retry." },
        { status: 409 },
      );
    }
    return jsonResponse(
      { error: "Failed to record submission." },
      { status: 500 },
    );
  }

  // Phase 1.5b: link R2-uploaded files to the new order. Files that
  // arrived without an r2_key are kept as metadata in source_data (above)
  // — they're already in the Formspree email so the lab isn't blind, the
  // dashboard just won't surface them for download.
  //
  // SECURITY: the r2_key arrives from the client, but POST
  // /api/portal/uploads always namespaces keys as
  // `submissions/{clinic_id}/{user_id}/...`. We refuse to link any key
  // whose clinic segment isn't the caller's own clinic — otherwise a
  // user could claim another clinic's uploaded object and read it back
  // through the (clinic-scoped) file-download endpoint.
  const clinicKeyPrefix = `submissions/${session.user.clinic_id}/`;
  let linkedFileCount = 0;
  let rejectedKeyCount = 0;
  if (newId != null) {
    for (const f of files) {
      if (!f.r2_key) continue;
      if (
        typeof f.r2_key !== "string" ||
        !f.r2_key.startsWith(clinicKeyPrefix)
      ) {
        // Foreign or malformed key — never link it.
        rejectedKeyCount += 1;
        continue;
      }
      try {
        await ctx.env.DB.prepare(
          `INSERT INTO portal_order_files
             (order_id, category, filename, r2_key, content_type,
              size_bytes, uploaded_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            newId,
            FORM_CATEGORY_TO_DB[f.category] ?? "other",
            f.name,
            f.r2_key,
            f.type || null,
            Number.isFinite(f.size) ? f.size : null,
            session.user.id,
          )
          .run();
        linkedFileCount += 1;
      } catch {
        // Duplicate r2_key or some other DB issue — keep going, the
        // file is still in R2 and the email path. We log via the audit
        // metadata below rather than blocking submission.
      }
    }
  }

  await recordAudit(ctx.env.DB, {
    userId: session.user.id,
    action: "portal_order_submitted",
    resourceType: "order",
    resourceId: newId != null ? String(newId) : body.reference,
    metadata: {
      reference: body.reference,
      arches: body.arches ?? null,
      appliance_type: applianceType,
      due_date: body.due_date ?? null,
      file_count: files.length,
      r2_linked_count: linkedFileCount,
      r2_rejected_count: rejectedKeyCount,
    },
    ipAddress: clientIp(ctx.request),
  });

  return jsonResponse({ id: newId, reference: body.reference });
};
