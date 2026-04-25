import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderForm } from "./OrderForm";

export const metadata: Metadata = {
  title: "Place Order | ASO Miniature Collection | ASO Hawaii",
  description:
    "Order your ASO miniature orthodontic models. Quick and secure ordering process — submit the form and receive a payment link within 24 hours.",
  alternates: { canonical: "/shop/order/" },
};

export default function ShopOrderPage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <Link
              href="/shop/"
              className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-500 hover:text-navy transition-colors mb-5"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 4L6 8l4 4" />
              </svg>
              Back to shop
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Order inquiry
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Place your <span className="italic text-brandOrange">order.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Complete the form below and we&apos;ll send you a secure payment
              link via email within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl bg-gray-50/60 border border-gray-200 p-7 sm:p-9 md:p-10">
              <Suspense
                fallback={
                  <div className="text-center py-10 text-gray-400 text-sm">
                    Loading order form…
                  </div>
                }
              >
                <OrderForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
