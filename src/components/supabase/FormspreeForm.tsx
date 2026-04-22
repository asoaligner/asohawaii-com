"use client";

import { useState } from "react";
import { FORMSPREE_ENDPOINT, FORMSPREE_READY } from "@/data/config";

type FormspreeFormProps = {
  formType: string;
  submitLabel: string;
  successTitle?: string;
  successBody?: string;
  children: React.ReactNode;
};

type Status = "idle" | "submitting" | "success" | "error";

export default function FormspreeForm({
  formType,
  submitLabel,
  successTitle = "submission_received",
  successBody = "Our team will review your request and reply within one business day.",
  children,
}: FormspreeFormProps) {
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

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
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
      <div style={{ textAlign: "center", padding: "32px 8px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 18px",
            borderRadius: 9999,
            background: "var(--sb-green)",
            color: "var(--sb-near-black)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          ✓
        </div>
        <h3
          style={{
            fontFamily: "'Source Code Pro', ui-monospace, monospace",
            fontSize: 18,
            color: "var(--sb-green)",
            marginBottom: 8,
          }}
        >
          {successTitle}
        </h3>
        <p
          style={{
            color: "var(--sb-light-gray)",
            fontSize: 15,
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {!FORMSPREE_READY && (
        <div
          style={{
            fontFamily: "'Source Code Pro', ui-monospace, monospace",
            fontSize: 11,
            color: "var(--sb-green)",
            background: "rgba(62,207,142,0.08)",
            border: "1px solid rgba(62,207,142,0.25)",
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 20,
            letterSpacing: 0.5,
          }}
        >
          ▸ dev_notice: set NEXT_PUBLIC_FORMSPREE_ENDPOINT in .env.local to
          enable delivery to {" "}
          <span style={{ color: "var(--sb-off-white)" }}>
            aso-digital@outlook.com
          </span>
        </div>
      )}
      {children}
      {status === "error" && errorMsg && (
        <div
          style={{
            fontFamily: "'Source Code Pro', ui-monospace, monospace",
            fontSize: 12,
            color: "#ff6b6b",
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          ✗ error: {errorMsg}
        </div>
      )}
      <button
        type="submit"
        className="supabase-btn-green"
        style={{ width: "100%", marginTop: 4 }}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "$ submitting..." : `$ ${submitLabel} →`}
      </button>
    </form>
  );
}

export function SbField({
  id,
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  as = "input",
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  as?: "input" | "textarea";
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="supabase-form-label" htmlFor={id}>
        {label}
        {required && <span style={{ color: "var(--sb-green)" }}> *</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          className="supabase-form-input"
          rows={4}
          style={{ resize: "vertical" }}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="supabase-form-input"
        />
      )}
    </div>
  );
}
