"use client";

/**
 * /portal/access-pending/ — confirmation screen shown after a successful
 * application submission. The actual row already exists in
 * portal_pending_users; this page only sets expectations and gives the
 * applicant a way back out (sign in if they were just there, or home).
 */

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AccessPendingInner() {
  const params = useSearchParams();
  const email = params.get("email");
  const kind = params.get("kind");
  const isLinking = kind === "linking";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50/40">
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60">
        <div className="container-narrow flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="ASO Hawaii — Home"
          >
            <img
              src="/images/aso/aso-logo.png"
              alt="ASO Hawaii"
              className="h-9 w-auto object-contain"
            />
            <span className="hidden sm:inline-block font-serif text-base text-navy leading-tight">
              Doctor Portal
            </span>
          </Link>
          <Link
            href="/"
            className="text-[13px] text-gray-500 hover:text-navy transition-colors"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-brandOrange/15 text-brandOrange">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-navy leading-snug">
            {isLinking ? "Linking request received" : "Application received"}
          </h1>
          <p className="mt-3 text-[14px] text-gray-600 leading-relaxed">
            Thanks — we&apos;ve emailed a receipt to{" "}
            {email ? (
              <strong className="text-navy">{email}</strong>
            ) : (
              "your inbox"
            )}{" "}
            and ASO Hawaii has been notified. We typically reply within one
            business day.
          </p>
          {isLinking ? (
            <p className="mt-3 text-[13px] text-gray-500 leading-relaxed">
              You can keep using the portal in the meantime — once approved,
              your dashboard will switch to your real clinic&apos;s orders
              automatically.
            </p>
          ) : (
            <p className="mt-3 text-[13px] text-gray-500 leading-relaxed">
              You&apos;ll receive a follow-up email when your application is
              approved with sign-in instructions.
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-3 text-[13px]">
            <Link
              href={isLinking ? "/portal/dashboard/" : "/portal/"}
              className="rounded-full bg-navy text-white px-5 py-2.5 hover:bg-navy/90 transition-colors"
            >
              {isLinking ? "Back to Dashboard" : "Back to Sign in"}
            </Link>
            <Link
              href="/portal/guide/"
              className="rounded-full border border-gray-200 text-navy px-5 py-2.5 hover:border-navy transition-colors"
            >
              View onboarding guide
            </Link>
          </div>

          <p className="mt-8 text-[12px] text-gray-500 leading-relaxed">
            Need to talk to us directly?{" "}
            <a
              href="tel:+18089570111"
              className="text-navy hover:text-brandOrange transition-colors"
            >
              808-957-0111
            </a>{" "}
            ·{" "}
            <a
              href="mailto:aso-digital@outlook.com"
              className="text-navy hover:text-brandOrange transition-colors"
            >
              aso-digital@outlook.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AccessPendingPage() {
  return (
    <Suspense fallback={null}>
      <AccessPendingInner />
    </Suspense>
  );
}
