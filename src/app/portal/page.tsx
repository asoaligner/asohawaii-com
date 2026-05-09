"use client";

/**
 * Portal sign-in. Phase 1.1: email + password only. The Google / EasyRx
 * buttons are placeholders so the visual contract matches the spec —
 * Google ships in Phase 1.3, EasyRx is deferred. If a valid session
 * cookie is already present (e.g. user navigates back here from /portal/
 * dashboard/), redirect them straight to the dashboard.
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe, login } from "@/lib/portal/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((res) => {
      if (cancelled) return;
      if (res && res.authenticated) {
        router.replace("/portal/dashboard/");
        return;
      }
      setCheckingSession(false);
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

  if (checkingSession) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-stone-50/40">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
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

            <div className="mt-7 grid gap-2.5">
              <button
                type="button"
                disabled
                title="Coming soon"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13.5px] font-medium text-gray-400 cursor-not-allowed"
              >
                <span aria-hidden>🔒</span>
                Continue with Google
                <span className="text-[10.5px] uppercase tracking-widest text-gray-400">
                  Soon
                </span>
              </button>
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14.5px] text-navy focus:border-navy focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="portal-password"
                  className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="portal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                disabled={busy || !email || !password}
                className="w-full inline-flex items-center justify-center gap-2 bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-[12.5px]">
              <span
                title="Available in a future update"
                className="text-gray-400 cursor-not-allowed"
              >
                Forgot password?
              </span>
              <a
                href="mailto:aso-digital@outlook.com?subject=ASO%20Portal%20account%20request"
                className="text-navy hover:text-brandOrange transition-colors"
              >
                Need an account?
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-gray-500 leading-relaxed">
            Portal access is invitation-only. Contact your ASO Hawaii rep to
            be added.
          </p>
        </div>
      </main>
    </div>
  );
}
