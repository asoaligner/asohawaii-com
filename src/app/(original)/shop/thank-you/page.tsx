"use client";

/**
 * Post-capture confirmation. Reads orderId from ?orderId= since we don't
 * persist orders on our side — PayPal is the system of record. Showing
 * the id lets the buyer cross-reference the email PayPal already sent.
 *
 * Wrapped in <Suspense> at the page boundary because useSearchParams
 * triggers a CSR bailout under Next.js 14 when the parent is statically
 * exported. The Suspense fallback is a quiet "Loading…" so we don't
 * flash a confusing empty state.
 */

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="container-narrow py-20 text-center text-sm text-gray-400">
          Loading order details…
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams?.get("orderId") ?? "";
  const orderId = rawId.trim();

  return (
    <section className="hero-gradient py-20 md:py-28">
      <div className="container-narrow max-w-2xl">
        <div className="rounded-3xl bg-white border border-gray-200 p-8 md:p-12 text-center shadow-[0_30px_60px_-30px_rgba(15,41,66,0.18)]">
          <div className="mx-auto w-16 h-16 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mb-6">
            <svg
              width="32"
              height="32"
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
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tightest text-navy">
            Thank you for your <span className="italic text-brandOrange">order!</span>
          </h1>
          {orderId && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-[13px] text-gray-700">
              <span className="text-gray-500">Order Number:</span>
              <code className="font-mono text-navy">{orderId}</code>
            </div>
          )}
          <p className="mt-7 text-[15px] text-gray-700 leading-relaxed">
            You will receive a confirmation email from PayPal shortly with the
            order details and your receipt.
          </p>
          <p className="mt-4 text-[15px] text-gray-700 leading-relaxed">
            We typically process miniature orders within{" "}
            <span className="font-medium text-navy">2&nbsp;weeks</span>.
            You&apos;ll receive a tracking number once your order ships.
          </p>
          <p className="mt-4 text-[13px] text-gray-500 leading-relaxed">
            Questions? Email{" "}
            <a
              href="mailto:aso-digital@outlook.com"
              className="text-navy underline underline-offset-2 hover:no-underline"
            >
              aso-digital@outlook.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:8089570111"
              className="text-navy underline underline-offset-2 hover:no-underline"
            >
              808-957-0111
            </a>
            .
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop/"
              className="inline-flex items-center justify-center gap-2 bg-navy text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
            >
              Return to shop
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-300 px-5 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
            >
              View other products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
