"use client";

import { useEffect, useId, useRef, useState } from "react";

const MB = 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/** Stable per-file identity — name + size + lastModified. Two different
 *  picks of the same file produce the same key; that's intentional so
 *  the r2_key map and upload-status map stay aligned with the File[]. */
export function stlFileKey(f: File): string {
  return `${f.name}|${f.size}|${f.lastModified}`;
}

type UpState = {
  status: "uploading" | "done" | "error";
  pct: number;
  r2_key?: string;
};

type Props = {
  label: string;
  description: string;
  accept: string;
  maxSize: number;
  files: File[];
  onChange: (next: File[]) => void;
  /** r2_key map (fileKey → key) reported up so the submit hook can
   *  reuse already-uploaded files. */
  onUploadsChange: (map: Record<string, string>) => void;
  /** On-select upload only works for logged-in portal users (the
   *  /api/portal/uploads endpoint is session-gated). When false the
   *  field behaves like a plain picker — files upload at submit. */
  uploadEnabled: boolean;
};

/** POST one STL to /api/portal/uploads via XHR so we get upload
 *  progress and an abortable handle. Resolves rather than rejects on
 *  failure — the caller treats every outcome as a status, never a
 *  thrown error. */
function uploadStl(
  file: File,
  onProgress: (pct: number) => void,
): { xhr: XMLHttpRequest; done: Promise<
  { ok: true; key: string } | { ok: false; error: string }
> } {
  const xhr = new XMLHttpRequest();
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("category", "stl");
  const done = new Promise<
    { ok: true; key: string } | { ok: false; error: string }
  >((resolve) => {
    xhr.open("POST", "/api/portal/uploads");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      let body: { key?: string; error?: string } | null = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.key) {
        resolve({ ok: true, key: body.key });
      } else {
        resolve({
          ok: false,
          error: body?.error || `Upload failed (${xhr.status}).`,
        });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "Network error." });
    xhr.onabort = () => resolve({ ok: false, error: "canceled" });
    xhr.send(fd);
  });
  return { xhr, done };
}

/**
 * STL upload field — uploads each file to portal storage the moment
 * it's dropped (portal context), shows live per-file progress, and
 * lets the doctor cancel a wrong file mid-upload via the × button.
 *
 * The File[] still flows up via onChange unchanged, so the Formspree
 * attachment + review summary keep working; the r2_key map flows up
 * separately via onUploadsChange for the portal submit hook to reuse.
 */
export default function StlUploadField({
  label,
  description,
  accept,
  maxSize,
  files,
  onChange,
  onUploadsChange,
  uploadEnabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [up, setUp] = useState<Record<string, UpState>>({});
  /** Live XHR handles, keyed by fileKey, so × can abort an in-flight
   *  upload. Not state — aborting doesn't itself need a re-render. */
  const xhrs = useRef<Record<string, XMLHttpRequest>>({});
  /** Last r2_key map reported up, serialized — so progress ticks
   *  (which change `up` constantly) don't fire a parent setState on
   *  every percent. Only a real key add/remove reports up. */
  const lastReported = useRef<string>("{}");

  // `up` is the single source of truth for the r2_key map — deriving
  // it here avoids stale-closure merge bugs when several uploads
  // finish close together.
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(up)) {
      if (v.r2_key) map[k] = v.r2_key;
    }
    const serialized = JSON.stringify(map);
    if (serialized !== lastReported.current) {
      lastReported.current = serialized;
      onUploadsChange(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [up]);

  function startUpload(file: File) {
    const key = stlFileKey(file);
    setUp((p) => ({ ...p, [key]: { status: "uploading", pct: 0 } }));
    const { xhr, done } = uploadStl(file, (pct) =>
      setUp((p) =>
        p[key] && p[key].status === "uploading"
          ? { ...p, [key]: { ...p[key], pct } }
          : p,
      ),
    );
    xhrs.current[key] = xhr;
    done.then((res) => {
      delete xhrs.current[key];
      if (res.ok) {
        setUp((p) => ({ ...p, [key]: { status: "done", pct: 100, r2_key: res.key } }));
      } else if (res.error !== "canceled") {
        setUp((p) => ({ ...p, [key]: { status: "error", pct: 0 } }));
      }
      // "canceled" — the row was already removed by removeFile().
    });
  }

  function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const f of list) {
      if (f.size > maxSize) {
        rejected.push(
          `${f.name} (${formatSize(f.size)} > ${formatSize(maxSize)})`,
        );
        continue;
      }
      accepted.push(f);
    }
    setError(rejected.length > 0 ? `Too large: ${rejected.join(", ")}` : null);
    if (accepted.length === 0) return;
    onChange([...files, ...accepted]);
    if (uploadEnabled) {
      for (const f of accepted) startUpload(f);
    }
  }

  function removeFile(file: File) {
    const key = stlFileKey(file);
    // Abort an in-flight upload first so its bytes stop and the
    // promise resolves as "canceled" (no error row left behind).
    const live = xhrs.current[key];
    if (live) {
      live.abort();
      delete xhrs.current[key];
    }
    onChange(files.filter((f) => stlFileKey(f) !== key));
    setUp((p) => {
      if (!(key in p)) return p;
      const next = { ...p };
      delete next[key];
      return next;
    });
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
      >
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-brandOrange bg-brandOrange/5"
            : "border-gray-300 bg-gray-50/40 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="text-[13.5px] text-gray-700 leading-snug">
          <span className="font-medium text-navy">Drop files here</span> or
          click to browse
        </div>
        <div className="text-[12px] text-gray-500 mt-1">{description}</div>
      </div>
      {error && (
        <div className="mt-2 text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => {
            const key = stlFileKey(f);
            const u = up[key];
            return (
              <li
                key={`${key}-${i}`}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-navy">{f.name}</span>
                  <span className="shrink-0 flex items-center gap-2.5 text-[12px]">
                    {/* Upload status — portal context only */}
                    {u?.status === "uploading" && (
                      <span className="text-brandOrange font-medium">
                        Uploading… {u.pct}%
                      </span>
                    )}
                    {u?.status === "done" && (
                      <span className="text-emerald-600 font-medium">
                        ✓ Uploaded
                      </span>
                    )}
                    {u?.status === "error" && (
                      <span className="text-red-600 font-medium">
                        Upload failed
                      </span>
                    )}
                    <span className="text-gray-500">{formatSize(f.size)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f);
                      }}
                      className="text-gray-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 rounded px-1"
                      aria-label={
                        u?.status === "uploading"
                          ? `Cancel upload of ${f.name}`
                          : `Remove ${f.name}`
                      }
                      title={
                        u?.status === "uploading"
                          ? "Cancel upload"
                          : "Remove file"
                      }
                    >
                      {u?.status === "uploading" ? "Cancel" : "×"}
                    </button>
                  </span>
                </div>
                {/* Thin progress bar while uploading */}
                {u?.status === "uploading" && (
                  <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-brandOrange transition-all duration-200"
                      style={{ width: `${u.pct}%` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
