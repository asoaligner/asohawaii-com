/**
 * Client-side helper for the per-file upload endpoint
 * (POST /api/portal/uploads). Used by the portal submit-case page to
 * push each file into R2 before the final /api/portal/orders/submit
 * call carries the R2 keys along.
 *
 * Errors NEVER fail the surrounding submission flow — Formspree (the
 * lab's email) is the source of truth, R2 visibility is best-effort.
 * A common case is the bucket not being bound yet (HTTP 503 with
 * `code: 'r2_unbound'`); callers receive a clear status and continue.
 */

export type PortalUploadCategory = "stl" | "photo" | "rx_pdf" | "other";

export interface PortalUploadOk {
  ok: true;
  key: string;
  filename: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  category: PortalUploadCategory;
}

export interface PortalUploadErr {
  ok: false;
  status: number;
  error: string;
  code?: string;
}

export type PortalUploadResult = PortalUploadOk | PortalUploadErr;

export async function uploadPortalFile(
  file: File,
  category: PortalUploadCategory,
): Promise<PortalUploadResult> {
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("category", category);

  let res: Response;
  try {
    res = await fetch("/api/portal/uploads", {
      method: "POST",
      credentials: "include",
      body: form,
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : "Network error.",
    };
  }

  if (!res.ok) {
    let error = "Upload failed.";
    let code: string | undefined;
    try {
      const body = (await res.json()) as { error?: string; code?: string };
      if (body.error) error = body.error;
      if (body.code) code = body.code;
    } catch {
      /* fall through */
    }
    return { ok: false, status: res.status, error, code };
  }

  const data = (await res.json()) as PortalUploadOk;
  return data;
}
