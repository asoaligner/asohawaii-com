"use client";

/**
 * /portal/request-access/ — public access application (Phase 2.1).
 *
 * Two entry modes detected at mount:
 *
 *   1. Unauthenticated, fresh visit:
 *      • Show a blank form. Doctor types their info.
 *
 *   2. Unauthenticated, from Google OAuth callback:
 *      • A signed apply-prefill cookie exists; fetchAccessPrefill()
 *        returns the email + name. Prefill them and lock email so the
 *        eventual approval can rely on the verified google_id linkage.
 *
 *   3. Already logged in (Koji's add-on request):
 *      • Show "Apply to link your clinic" copy. Prefill email + name
 *        from the session. Submit creates a portal_pending_users row
 *        that the admin queue tags as a linking request.
 *
 * Form submission goes to /api/portal/auth/apply; the server handles
 * which "kind" this is based on the session cookie.
 */

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchAccessPrefill,
  fetchMe,
  submitAccessApplication,
} from "@/lib/portal/client";

interface FormState {
  email: string;
  name: string;
  doctor_name: string;
  clinic_name: string;
  aso_account_number: string;
  easyrx_email: string;
  reason: string;
}

const EMPTY: FormState = {
  email: "",
  name: "",
  doctor_name: "",
  clinic_name: "",
  aso_account_number: "",
  easyrx_email: "",
  reason: "",
};

function RequestAccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const fromGoogleQs = params.get("from") === "google";

  const [form, setForm] = useState<FormState>(EMPTY);
  const [mode, setMode] = useState<"new" | "google" | "linking" | "loading">(
    "loading",
  );
  const [currentClinic, setCurrentClinic] = useState<string | null>(null);
  const [emailLocked, setEmailLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function detect() {
      // Logged-in users → linking request mode
      const me = await fetchMe();
      if (cancelled) return;
      if (me && "authenticated" in me && me.authenticated && me.user) {
        const u = me.user;
        setMode("linking");
        setCurrentClinic(me.clinic?.name ?? null);
        setForm((f) => ({
          ...f,
          email: u.email,
          name: u.name ?? "",
          doctor_name: u.name ?? "",
        }));
        setEmailLocked(true);
        return;
      }
      // Unauthenticated — check Google prefill cookie
      const prefill = await fetchAccessPrefill();
      if (cancelled) return;
      if (prefill?.prefill) {
        setMode("google");
        setForm((f) => ({
          ...f,
          email: prefill.prefill!.email,
          name: prefill.prefill!.name ?? "",
          doctor_name: prefill.prefill!.name ?? "",
        }));
        setEmailLocked(true);
      } else {
        setMode("new");
      }
    }
    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  // copy variants
  const copy = useMemo(() => {
    if (mode === "linking") {
      return {
        title: "Apply to link your clinic",
        subtitle:
          currentClinic && currentClinic !== "ASO Hawaii Internal"
            ? `You're currently linked to "${currentClinic}". Use this form if you need ASO to move your account to a different clinic.`
            : "Use this form to ask ASO to associate your account with your real clinic — once approved, your dashboard will show your clinic's orders.",
        submitLabel: "Send linking request",
      };
    }
    if (mode === "google" || fromGoogleQs) {
      return {
        title: "Apply for portal access",
        subtitle:
          "Your Google sign-in didn't match any existing account. Tell us a bit about your clinic and we'll set you up — usually within one business day.",
        submitLabel: "Send application",
      };
    }
    return {
      title: "Apply for portal access",
      subtitle:
        "Tell us about your clinic and we'll get back to you within one business day. Already invited? Use the link in your invitation email instead.",
      submitLabel: "Send application",
    };
  }, [mode, currentClinic, fromGoogleQs]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);
    const emailTrim = form.email.trim().toLowerCase();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!form.doctor_name.trim()) {
      setErrorMsg("Doctor name is required.");
      return;
    }
    if (!form.clinic_name.trim()) {
      setErrorMsg("Clinic name is required.");
      return;
    }

    setSubmitting(true);
    const res = await submitAccessApplication({
      email: emailTrim,
      name: form.name.trim() || null,
      doctor_name: form.doctor_name.trim(),
      clinic_name: form.clinic_name.trim(),
      aso_account_number: form.aso_account_number.trim() || null,
      easyrx_email: form.easyrx_email.trim().toLowerCase() || null,
      reason: form.reason.trim() || null,
    });
    setSubmitting(false);
    if (res.ok) {
      router.push(
        `/portal/access-pending/?email=${encodeURIComponent(emailTrim)}${
          mode === "linking" ? "&kind=linking" : ""
        }`,
      );
      return;
    }
    setErrorMsg(res.error);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50/40">
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60">
        <div className="container-narrow flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3" aria-label="ASO Hawaii — Home">
            <img src="/images/aso/aso-logo.png" alt="ASO Hawaii" className="h-9 w-auto object-contain" />
            <span className="hidden sm:inline-block font-serif text-base text-navy leading-tight">
              Doctor Portal
            </span>
          </Link>
          <Link
            href={mode === "linking" ? "/portal/dashboard/" : "/portal/"}
            className="text-[13px] text-gray-500 hover:text-navy transition-colors"
          >
            {mode === "linking" ? "← Dashboard" : "← Sign in"}
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_24px_60px_-24px_rgba(15,41,66,0.18)] p-7 sm:p-9">
            <h1 className="font-serif text-3xl text-navy leading-snug">
              {copy.title}
            </h1>
            <p className="mt-2 text-[13.5px] text-gray-500 leading-relaxed">
              {copy.subtitle}
            </p>

            {mode === "google" && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12.5px] text-emerald-900">
                ✓ Verified via Google — your email is locked.
              </div>
            )}
            {mode === "linking" && currentClinic && (
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-[12.5px] text-blue-900">
                Currently linked to: <strong>{currentClinic}</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <Field
                label="Doctor name"
                required
                value={form.doctor_name}
                onChange={(v) => update("doctor_name", v)}
                placeholder="Dr. Jane Doe"
                autoComplete="name"
              />
              <Field
                label="Clinic name"
                required
                value={form.clinic_name}
                onChange={(v) => update("clinic_name", v)}
                placeholder="Sunrise Family Dentistry"
                autoComplete="organization"
              />
              <Field
                label="Email"
                required
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="you@clinic.com"
                autoComplete="email"
                readOnly={emailLocked}
              />
              <Field
                label="ASO account number"
                hint="If known (e.g. 411). Helps us locate your records faster."
                value={form.aso_account_number}
                onChange={(v) => update("aso_account_number", v)}
                placeholder="411"
              />
              <Field
                label="EasyRx login email"
                type="email"
                hint="If different from above — for cross-reference."
                value={form.easyrx_email}
                onChange={(v) => update("easyrx_email", v)}
                placeholder="optional@easyrx.com"
                autoComplete="off"
              />
              <div>
                <label
                  htmlFor="reason"
                  className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
                >
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={form.reason}
                  onChange={(e) => update("reason", e.target.value)}
                  placeholder={
                    mode === "linking"
                      ? "Tell ASO which clinic you should be associated with and why."
                      : "Anything we should know? Optional."
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors resize-none"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || mode === "loading"}
                className="w-full inline-flex items-center justify-center bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : copy.submitLabel}
              </button>
            </form>

            <p className="mt-5 text-center text-[11.5px] text-gray-500 leading-relaxed">
              Questions? <a href="mailto:aso-digital@outlook.com" className="text-navy hover:text-brandOrange">aso-digital@outlook.com</a> or <a href="tel:+18089570111" className="text-navy hover:text-brandOrange">808-957-0111</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  readOnly,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  readOnly?: boolean;
}) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
      >
        {label}
        {required && <span className="text-brandOrange ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors ${
          readOnly ? "bg-gray-50 cursor-not-allowed" : ""
        }`}
      />
      {hint && <p className="mt-1 text-[11.5px] text-gray-500">{hint}</p>}
    </div>
  );
}

export default function RequestAccessPage() {
  return (
    <Suspense fallback={null}>
      <RequestAccessInner />
    </Suspense>
  );
}
