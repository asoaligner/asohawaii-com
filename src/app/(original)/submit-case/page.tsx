import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SubmitCaseForm } from "./SubmitCaseForm";

const SITE_URL = "https://asohawaii.com";

export const metadata: Metadata = {
  title: "Submit Case Online | Orthodontic Lab | ASO Hawaii",
  description:
    "Submit your orthodontic case online to ASO Hawaii. Quick form for retainers, expanders, aligners, and more. Response within 1 business day. Serving 150+ Hawaii dental practices.",
  alternates: { canonical: "/submit-case/" },
  openGraph: {
    title: "Submit Case Online — ASO International Hawaii",
    description:
      "Submit your orthodontic case to ASO Hawaii in minutes. Upload STL files, photos, and Rx PDFs through our quick online form.",
    type: "website",
    url: `${SITE_URL}/submit-case/`,
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Orthodontic Laboratory Case Submission",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "State", name: "Hawaii" },
  url: `${SITE_URL}/submit-case/`,
  description:
    "Online case submission for orthodontic appliances — retainers, aligners, expanders, splints, IDB, and more. Response within 1 business day.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Orthodontic appliance services",
    itemListElement: [
      "Plate Type Retainer",
      "Plate Expansion",
      "Functional Appliances",
      "Aligner (ASO ALIGNER)",
      "Lingual Retainer",
      "Invisible Retainer",
      "Flat Occlusal Splint",
      "IDB (Indirect Bonding)",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
};

export default function SubmitCasePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Quick order form
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Submit your{" "}
              <span className="italic text-brandOrange">case.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Quick and easy case submission. Fill out the form below and our
              team will confirm your order within 1 business day.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-gray-200/60">
        <div className="container-narrow py-5">
          <div className="rounded-xl bg-brandOrange/5 border border-brandOrange/20 px-5 py-4 flex items-start gap-3">
            <span aria-hidden className="text-base leading-none mt-0.5">
              💡
            </span>
            <div className="text-[14px] text-gray-700 leading-relaxed">
              <span className="font-medium text-navy">
                Already using EasyRx?
              </span>{" "}
              Submit directly through your EasyRx account for the fastest
              workflow with full case traceability.{" "}
              <Link
                href="/how-to-order"
                className="text-brandOrange font-medium hover:text-brandOrange/80 underline underline-offset-2 transition-colors"
              >
                Learn about EasyRx →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-narrow">
          <div className="max-w-3xl mx-auto">
            <Suspense
              fallback={
                <div className="text-center text-gray-400 text-sm py-10">
                  Loading form…
                </div>
              }
            >
              <SubmitCaseForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
