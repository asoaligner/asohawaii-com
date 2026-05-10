"use client";

/**
 * /portal/forgot-password/ — request a reset link by email.
 *
 * The success state never confirms whether the email matched a row;
 * always shows the same "if we have an account, check your inbox"
 * message so an unauthenticated user can't enumerate registered emails
 * via this form. (The server-side endpoint mirrors this stance.)
 */

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/portal/AuthShell";
import { forgotPassword } from "@/lib/portal/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !email) return;
    setBusy(true);
    setErrorMsg(null);
    const result = await forgotPassword(email.trim().toLowerCase());
    setBusy(false);
    if (result.ok) {
      setSubmittedEmail(email.trim().toLowerCase());
      return;
    }
    setErrorMsg(result.error);
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle={
        submittedEmail
          ? "Check your inbox."
          : "Enter your email and we'll send you a reset link."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/portal/"
            className="text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
          >
            Back to sign in
          </Link>
          .
        </>
      }
    >
      {submittedEmail ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13.5px] text-emerald-800 leading-relaxed"
        >
          <p className="font-medium">Check your inbox.</p>
          <p className="mt-2">
            If we have an account for <strong>{submittedEmail}</strong>, a
            reset link is on its way. The link works for <strong>1 hour</strong>{" "}
            and can only be used once.
          </p>
          <p className="mt-2 text-emerald-700/80">
            Didn't get it? Check your spam folder, or contact ASO Hawaii at{" "}
            <a
              href="mailto:aso-digital@outlook.com"
              className="underline underline-offset-2"
            >
              aso-digital@outlook.com
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
            >
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14.5px] text-navy focus:border-navy focus:outline-none transition-colors"
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
            disabled={busy || !email}
            className="w-full inline-flex items-center justify-center bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
