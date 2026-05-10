"use client";

/**
 * /portal/reset-password/?token=... — complete the reset.
 *
 * Reads the raw token from the query string, asks for a new password +
 * confirmation, posts to /api/portal/auth/reset-password. Server returns
 * a friendly error message for invalid / expired / already-used tokens
 * which we render in place. On success we show a "signed out everywhere"
 * confirmation and link to /portal/.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import AuthShell from "@/components/portal/AuthShell";
import { resetPassword } from "@/lib/portal/client";

export default function ResetPasswordPage() {
  // useSearchParams() must be wrapped in Suspense at this layer so the
  // static export prerender doesn't bail. The inner component is the
  // real page body.
  return (
    <Suspense
      fallback={
        <AuthShell title="Reset password" subtitle="Loading…">
          <div className="text-center text-sm text-gray-400 py-2">Loading…</div>
        </AuthShell>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const tokenPresent = token.length > 0;

  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrorMsg(null);

    if (next.length < 10) {
      setErrorMsg("New password must be at least 10 characters.");
      return;
    }
    if (next !== confirm) {
      setErrorMsg("Password and confirmation don't match.");
      return;
    }

    setBusy(true);
    const result = await resetPassword({ token, newPassword: next });
    setBusy(false);
    if (result.ok) {
      setDone(true);
      return;
    }
    setErrorMsg(result.error);
  }

  if (!tokenPresent) {
    return (
      <AuthShell
        title="Reset password"
        subtitle="This reset link is missing its token."
        footer={
          <>
            Request a new link from the{" "}
            <Link
              href="/portal/forgot-password/"
              className="text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
            >
              forgot-password page
            </Link>
            .
          </>
        }
      >
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13.5px] text-amber-800"
        >
          The reset URL did not include a token. Make sure you opened the
          full link from the email — long links sometimes get cut off in
          mail clients.
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        title="Password reset"
        subtitle="You can sign in with the new password."
      >
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13.5px] text-emerald-800 leading-relaxed"
        >
          <p className="font-medium">All done.</p>
          <p className="mt-2">
            Your password has been updated and every session for this
            account has been signed out (including any that may have been
            on a stolen device).
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/portal/"
            className="w-full inline-flex items-center justify-center bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Choose a new password for your portal account."
      footer={
        <>
          Wrong account?{" "}
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
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div>
          <label
            htmlFor="reset-new"
            className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
          >
            New password
          </label>
          <input
            id="reset-new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14.5px] text-navy focus:border-navy focus:outline-none transition-colors"
          />
          <p className="mt-1 text-[11.5px] text-gray-500">
            At least 10 characters.
          </p>
        </div>
        <div>
          <label
            htmlFor="reset-confirm"
            className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
          >
            Confirm new password
          </label>
          <input
            id="reset-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
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
          disabled={busy || !next || !confirm}
          className="w-full inline-flex items-center justify-center bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}
