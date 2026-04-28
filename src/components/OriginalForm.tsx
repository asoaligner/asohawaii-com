"use client";

import { useState } from "react";
import { FORMSPREE_ENDPOINT, FORMSPREE_READY } from "@/data/config";

type Status = "idle" | "submitting" | "success" | "error";

export function OriginalForm({
  formType,
  submitLabel,
  successTitle = "Thanks — we'll be in touch.",
  successBody = "Our team will review your request and reply within one business day.",
  extraFiles,
  onResetExtras,
  children,
}: {
  formType: string;
  submitLabel: string;
  successTitle?: string;
  successBody?: string;
  /** State-managed files (e.g. from FileUploadField) appended to the
   *  outgoing FormData under the given fieldName. Lets pages use the
   *  drag-and-drop uploader instead of the OS-localized native input. */
  extraFiles?: { fieldName: string; files: File[] };
  /** Called after a successful submit so the parent can clear any
   *  state-managed extras (e.g. the files list). */
  onResetExtras?: () => void;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_formType", formType);
    data.append("_subject", `[ASO Hawaii] ${formType}`);
    if (extraFiles) {
      for (const f of extraFiles.files) {
        data.append(extraFiles.fieldName, f, f.name);
      }
    }
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        onResetExtras?.();
      } else {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error ?? `Request failed (${res.status}).`);
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-brandOrange/20 text-brandOrange flex items-center justify-center mb-5">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-navy">{successTitle}</h3>
        <p className="mt-3 text-gray-600 text-[15px] max-w-sm mx-auto">
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!FORMSPREE_READY && (
        <div className="text-[11px] text-brandOrange bg-brandOrange/5 border border-brandOrange/20 rounded-md px-3 py-2 tracking-wide">
          <span className="font-serif italic">dev notice</span> — set{" "}
          <code className="font-mono">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> to
          enable delivery to asohawaii@hotmail.com
        </div>
      )}
      {children}
      {status === "error" && errorMsg && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center gap-2 bg-navy text-white font-medium px-6 py-3.5 rounded-full hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Submitting…" : submitLabel}
        {status !== "submitting" && (
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        )}
      </button>
    </form>
  );
}

export function OrigField({
  id,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  as = "input",
  min,
  max,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  as?: "input" | "textarea";
  /** Forwarded to the underlying <input> — useful for date min/max. */
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
      >
        {label}
        {required && <span className="text-brandOrange ml-1">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors resize-y"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors"
        />
      )}
    </div>
  );
}
