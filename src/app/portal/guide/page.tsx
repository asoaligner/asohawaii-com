import type { Metadata } from "next";
import Link from "next/link";
import PortalGuideContent from "@/components/portal/PortalGuideContent";

export const metadata: Metadata = {
  title: "ASO Hawaii Doctor Portal — Onboarding Guide",
  description:
    "How to log in, submit cases, reorder, and ask about an order in the ASO Hawaii Doctor Portal.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/portal/guide/" },
};

/**
 * Web view of the onboarding guide. Same shared content component as
 * the print page, wrapped with a thin nav. The "View in 日本語 / English"
 * links jump to the in-page anchors so the same URL can be shared
 * regardless of the recipient's preferred language.
 */
export default function PortalGuidePage() {
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
          <div className="flex items-center gap-4 text-[12.5px]">
            <a
              href="#guide-en"
              className="text-gray-500 hover:text-navy transition-colors"
            >
              English
            </a>
            <a
              href="#guide-ja"
              className="text-gray-500 hover:text-navy transition-colors"
            >
              日本語
            </a>
            <Link
              href="/portal/guide-print/"
              className="rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-navy hover:border-navy transition-colors"
            >
              Print / PDF
            </Link>
            <Link
              href="/portal/"
              className="text-gray-500 hover:text-navy transition-colors"
            >
              ← Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section id="guide-en" className="scroll-mt-20">
          <PortalGuideContent locale="en" />
        </section>
        <div
          className="mx-auto my-2 h-px max-w-[760px] bg-gray-200"
          aria-hidden="true"
        />
        <section id="guide-ja" className="scroll-mt-20">
          <PortalGuideContent locale="ja" />
        </section>
      </main>

      <footer className="border-t border-gray-200/60 bg-white py-6 text-center text-[11.5px] text-gray-500">
        ASO International Hawaii, Inc. · 1441 Kapiolani Blvd #1112, Honolulu HI 96814 ·{" "}
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
      </footer>
    </div>
  );
}
