"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    q: "What is the typical turnaround time for ASO Hawaii products?",
    a: "Standard turnaround is 7–10 business days. Customized products and clear aligner cases may vary — contact us for a specific quote on complex cases.",
  },
  {
    q: "Do you offer pick-up and delivery?",
    a: "Yes — on Oahu, Monday–Friday, 1:00 pm – 4:00 pm (some remote areas excluded). For same-day pickup, submit your request by 12:00 pm (noon). Mainland practices can ship UPS/FedEx to our Honolulu address.",
  },
  {
    q: "Can I schedule a specific pick-up time?",
    a: "Pickups cannot be scheduled to a precise time. Our driver arrives at some point between 1:00 pm and 4:00 pm, depending on the route that day.",
  },
  {
    q: "How do I submit a prescription?",
    a: "Online through EasyRx — the easiest, most traceable method. If your practice isn't yet registered with EasyRx, contact the lab and we'll set up your account (typically same business day).",
  },
  {
    q: "What digital file types do you accept?",
    a: "STL files from all major intraoral scanners: iTero, 3Shape TRIOS, Medit, Primescan, DEXIS, and Shining 3D. Note: 3Shape must be sent via EasyRx or email (not 3Shape Communicate).",
  },
  {
    q: "Do you offer rush service?",
    a: "Yes, rush service is available on request. Additional fees may apply depending on case complexity and turnaround requested.",
  },
  {
    q: "What kinds of appliances do you fabricate?",
    a: "Plate-type retainers, banded appliances, lingual retainers, clear aligners (ASO Aligner), occlusal splints, MARPE / MSE, invisible retainers, flippers, night guards, positioners, study models, and IDB. If you don't see what you need listed — ask us.",
  },
  {
    q: "How do I contact ASO Hawaii?",
    a: "Phone 808-957-0111 · Email aso-digital@outlook.com · Hours Monday–Friday, 8:00 am – 4:30 pm HST (closed on federal holidays).",
  },
];

// Schema.org FAQPage — Google may render Q/A directly in search results.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Dental lab FAQ
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Questions, <span className="italic text-brandOrange">answered.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              The most common questions practices ask us. Still not seeing yours?{" "}
              <Link
                href="/contact"
                className="text-navy font-medium underline underline-offset-2 hover:text-brandOrange transition-colors"
              >
                Drop us a line
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-narrow max-w-3xl">
          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-6 py-7 text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-serif italic text-brandOrange text-sm pt-1 tracking-tight shrink-0 w-8">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-serif text-lg sm:text-xl text-navy leading-snug tracking-tight pr-4">
                        {f.q}
                      </span>
                    </div>
                    <span
                      className={`mt-1 shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-navy transition-all duration-300 ${
                        isOpen
                          ? "bg-navy text-white border-navy rotate-45"
                          : "group-hover:border-navy"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M8 3v10M3 8h10" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 pb-8"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="ml-12 text-gray-600 leading-relaxed text-[15px] max-w-2xl">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Consultation about our products
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
              We&apos;re happy to explain how our appliances can support your{" "}
              <span className="italic">treatment.</span>
            </h2>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Contact us
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Get a quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
