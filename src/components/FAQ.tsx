"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    q: "Is EasyRx included, or is there a cost for my practice?",
    a: "EasyRx is provided at no cost to practices submitting cases to ASO International Hawaii. There are no setup fees, monthly fees, or per-case charges.",
  },
  {
    q: "How long does setup take?",
    a: "Most practices are sending their first case within one business day. After you request an invitation, we verify your practice and send a secure email to activate your EasyRx account.",
  },
  {
    q: "Which intraoral scanners are supported?",
    a: "All major scanners — iTero, Medit, Shining 3D, 3Shape TRIOS, Primescan, and DEXIS. If your scanner can export STL/PLY files, it works with EasyRx.",
  },
  {
    q: "Is my patient data secure?",
    a: "Yes. EasyRx is HIPAA-compliant, with end-to-end encryption, role-based access, and a complete audit trail. We do not share data with third parties.",
  },
  {
    q: "Can I still submit cases the old way (fax or paper)?",
    a: "Yes, but we strongly recommend EasyRx. Digital submission is faster, reduces errors, and gives you a complete case history that paper simply cannot match.",
  },
  {
    q: "What if I need help using EasyRx?",
    a: "Our team is one phone call or email away — 808-957-0111 or aso-digital@outlook.com. EasyRx also has a dedicated support team for software questions.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const shown = faqs.slice(0, 4);

  return (
    <section id="faq" className="py-24 md:py-32 bg-white">
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              FAQ
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              Questions, <span className="italic">answered.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Four quick ones below — see the{" "}
              <Link
                href="/faq"
                className="text-navy font-medium underline underline-offset-2 hover:text-brandOrange transition-colors"
              >
                full FAQ
              </Link>{" "}
              for all 8. Or call{" "}
              <a
                href="tel:8089570111"
                className="text-navy font-medium hover:text-brandOrange transition-colors"
              >
                808-957-0111
              </a>
              .
            </p>
          </div>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {shown.map((f, i) => {
                const isOpen = open === i;
                return (
                  <li key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full flex items-start justify-between gap-6 py-6 text-left group"
                      aria-expanded={isOpen}
                    >
                      <span className="font-serif text-lg sm:text-xl text-navy leading-snug tracking-tight pr-4">
                        {f.q}
                      </span>
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
                          ? "grid-rows-[1fr] opacity-100 pb-7"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-gray-600 leading-relaxed text-[15px] max-w-2xl">
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
              >
                See all 8 FAQ
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
