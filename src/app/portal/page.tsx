"use client";

/**
 * Portal sign-in. Email + password (Phase 1.1) and Google OAuth
 * (Phase 1.3). EasyRx remains deferred to Phase 2 — the button is kept
 * disabled with a "Soon" tag so the visual contract matches the spec.
 *
 * Google sign-in is a small <form method="POST" action="/api/portal/
 * auth/google"> rather than a fetch + redirect, so the browser follows
 * Google's 302 cleanly without us needing JS-side navigation tricks.
 *
 * On return the URL may carry ?error=<code>; we read it via Suspense
 * (useSearchParams demands it under static export) and surface a
 * single-line banner above the form so the user understands why they
 * were bounced back.
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PasswordInput from "@/components/portal/PasswordInput";
import { fetchMe, login } from "@/lib/portal/client";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_denied:
    "Google sign-in was cancelled. Try again or use email + password.",
  not_registered:
    "This Google account is not registered yet. Please apply for access on the form below.",
  email_unverified:
    "Your Google email is not verified. Verify it on Google, then try again.",
  account_disabled:
    "This account is disabled. Contact your ASO Hawaii rep.",
  google_id_conflict:
    "This portal account is already linked to a different Google account.",
  state_mismatch:
    "Sign-in session expired. Please try Google sign-in again.",
  invalid_state:
    "Sign-in session expired. Please try Google sign-in again.",
  missing_state:
    "Sign-in session expired. Please try Google sign-in again.",
  missing_code:
    "Google did not return an authorization code. Please try again.",
  token_exchange_failed:
    "Could not complete Google sign-in. Please try again.",
  userinfo_failed:
    "Could not load your Google profile. Please try again.",
  invite_invalid:
    "That invitation link is not valid. Ask your ASO Hawaii rep to send a new one.",
  invite_used:
    "That invitation has already been accepted. Sign in below.",
  invite_revoked:
    "That invitation was revoked. Contact your ASO Hawaii rep for a new one.",
  invite_expired:
    "That invitation has expired. Contact your ASO Hawaii rep for a new one.",
  invite_email_conflict:
    "An account already exists for this email. Sign in below or use forgot password.",
  unknown:
    "Google sign-in is not configured correctly. Contact ASO Hawaii.",
};

export default function PortalLoginPage() {
  return (
    <Suspense fallback={<LoginShell error={null} />}>
      <PortalLoginInner />
    </Suspense>
  );
}

function PortalLoginInner() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("error") ?? null;
  return <LoginShell error={errorCode} />;
}

function LoginShell({ error }: { error: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // No early-return loading state: render the form on first paint so
  // Chrome's password manager can scan and offer autofill. If the user
  // is already authenticated, the useEffect below redirects within a
  // few hundred ms.
  useEffect(() => {
    let cancelled = false;
    fetchMe().then((res) => {
      if (cancelled) return;
      if (res && res.authenticated) {
        router.replace("/portal/dashboard/");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrorMsg(null);
    setBusy(true);
    const result = await login({ email, password });
    if (result.ok) {
      router.replace("/portal/dashboard/");
      return;
    }
    setErrorMsg(result.error);
    setBusy(false);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50/40">
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60">
        <div className="container-narrow flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="ASO Hawaii — Home"
          >
            <Image
              src="/images/aso/aso-logo.png"
              alt="ASO Hawaii"
              width={750}
              height={511}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block font-serif text-base text-navy leading-tight">
              Doctor Portal
            </span>
          </Link>
          <Link
            href="/"
            className="text-[13px] text-gray-500 hover:text-navy transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_24px_60px_-24px_rgba(15,41,66,0.18)] p-7 sm:p-9">
            <h1 className="font-serif text-3xl text-navy text-center leading-snug">
              Welcome to ASO Portal
            </h1>
            <p className="mt-2 text-center text-[13.5px] text-gray-500">
              Sign in to view your case history and delivery dates.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
              >
                {OAUTH_ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again."}
              </div>
            )}

            <div className="mt-7 grid gap-2.5">
              <form method="POST" action="/api/portal/auth/google">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13.5px] font-medium text-navy hover:border-navy hover:bg-navy/[0.03] transition-colors"
                >
                  <GoogleGlyph />
                  Continue with Google
                </button>
              </form>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13.5px] font-medium text-gray-400 cursor-not-allowed"
              >
                <span aria-hidden>🔒</span>
                Continue with EasyRx
                <span className="text-[10.5px] uppercase tracking-widest text-gray-400">
                  Soon
                </span>
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-gray-400">
              <div className="flex-grow h-px bg-gray-200" />
              <span>or</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <div>
                <label
                  htmlFor="portal-email"
                  className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="portal-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14.5px] text-navy focus:border-navy focus:outline-none transition-colors"
                />
              </div>

              <PasswordInput
                id="portal-password"
                name="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
              />

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
                disabled={busy || !email || !password}
                className="w-full inline-flex items-center justify-center gap-2 bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-[12.5px]">
              <Link
                href="/portal/forgot-password/"
                className="text-navy hover:text-brandOrange transition-colors"
              >
                Forgot password?
              </Link>
              <Link
                href="/portal/request-access/"
                className="text-navy hover:text-brandOrange transition-colors"
              >
                Apply for access →
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-gray-500 leading-relaxed">
            Already received an invitation? Use the link in that email.
            Otherwise{" "}
            <Link
              href="/portal/request-access/"
              className="text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
            >
              apply for access
            </Link>{" "}
            and we&apos;ll set up your clinic.
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      aria-hidden
      style={{ display: "inline-block" }}
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
