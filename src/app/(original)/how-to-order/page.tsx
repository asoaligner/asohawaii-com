import type { Metadata } from "next";
import Link from "next/link";
import ScannerGuidesSection from "./_components/ScannerGuidesSection";

export const metadata: Metadata = {
  title: "How to Order · ASO Hawaii — Case submission & pickup",
  description:
    "How to send your cases to ASO International Hawaii. Digital scanner submissions (iTero, Medit, Primescan, DEXIS, Shining 3D, 3Shape) or stone models. Oahu afternoon pickup available.",
};

export default function HowToOrderPage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              How to order
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              How to send your cases to{" "}
              <span className="italic text-brandOrange">ASO Hawaii.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Two ways in — digital scanner data or traditional stone models.
              Whichever your workflow, we&apos;ll meet you where you are.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/pick-up"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Request a pick-up
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
                href="/download"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Download instructions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                01 · Submission options
              </div>
              <h2 className="font-serif text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
                Case submission <span className="italic">options.</span>
              </h2>
              <p className="mt-5 text-gray-600 leading-relaxed">
                We accept both digital intraoral scanner data and traditional
                stone models. On Oahu, our driver covers pickup and delivery in
                the afternoon (some remote areas excluded). Mainland practices
                can ship to our Honolulu address.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-5">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="12" rx="2" />
                    <path d="M7 21h10M12 17v4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-navy">Digital scan</h3>
                <p className="mt-2 text-gray-600 text-[15px] leading-relaxed">
                  Export STL/PLY from any major chairside scanner. Uploads via
                  EasyRx for full traceability.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-5">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7h18l-2 13H5L3 7zM8 7V4h8v3" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-navy">Stone models</h3>
                <p className="mt-2 text-gray-600 text-[15px] leading-relaxed">
                  Type III hard stone or higher. We also accept impressions and
                  can pour them in-house on request.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-5">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="7" width="15" height="10" rx="1" />
                    <path d="M18 11h3l-1 6h-2" />
                    <circle cx="7" cy="18" r="1.5" />
                    <circle cx="17" cy="18" r="1.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-navy">Oahu pickup</h3>
                <p className="mt-2 text-gray-600 text-[15px] leading-relaxed">
                  Mon–Fri, 1:00 pm – 4:00 pm. Same-day if requested before
                  noon — call for same-day after.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-5">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16v12H5.5L4 20V4z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-navy">Need help?</h3>
                <p className="mt-2 text-gray-600 text-[15px] leading-relaxed">
                  Call{" "}
                  <a
                    href="tel:8089570111"
                    className="text-navy font-medium hover:text-brandOrange transition-colors"
                  >
                    808-957-0111
                  </a>{" "}
                  or email{" "}
                  <a
                    href="mailto:aso-digital@outlook.com"
                    className="text-navy font-medium hover:text-brandOrange transition-colors"
                  >
                    aso-digital@outlook.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="scanner-guides"
        className="py-24 md:py-28 bg-gray-50/60 border-y border-gray-200/60 scroll-mt-24"
      >
        <div className="container-narrow">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              02 · Digital scanner
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              Every major scanner, <span className="italic">one workflow.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              We accept STL exports from every major chairside scanner. Route
              through EasyRx for HIPAA-compliant transmission and full case
              traceability. Click any scanner below to view its step-by-step
              setup guide.
            </p>
          </div>

          <ScannerGuidesSection />

          <div className="mt-10 rounded-2xl border-l-4 border-brandOrange bg-white p-6 md:p-8 max-w-3xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brandOrange/10 text-brandOrange flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path
                    d="M12 8v4M12 16h0"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-1">
                  Note · 3Shape
                </div>
                <p className="text-[15px] text-navy leading-relaxed">
                  3Shape submissions must be sent via <strong>EasyRx</strong>{" "}
                  or <a
                    href="mailto:aso-digital@outlook.com"
                    className="underline underline-offset-2 hover:text-brandOrange"
                  >
                    email
                  </a>
                  . Direct upload through 3Shape Communicate is not supported.
                  For scanners not listed above, please contact us in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28 bg-white">
        <div className="container-narrow">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              03 · Stone models
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              Traditional is <span className="italic">welcome too.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              For practices still on analog impressions, we accept stone models
              cast in hard stone (Type III or higher). Or send impressions and
              we&apos;ll pour in-house.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                eyebrow: "Material",
                title: "Type III hard stone or higher.",
                body:
                  "Softer stones can chip during fabrication. Type III ensures tolerances hold through the full CAD/CAM loop.",
              },
              {
                eyebrow: "Packaging",
                title: "Secure and labeled.",
                body:
                  "Include patient/case ID, doctor name, and prescription inside the box. We cross-reference on receipt before production.",
              },
              {
                eyebrow: "Impressions OK",
                title: "We'll pour in-house.",
                body:
                  "Prefer to send impressions? We'll cast the stone models for you — additional charges may apply.",
              },
            ].map((c) => (
              <div
                key={c.eyebrow}
                className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(15,41,66,0.12)] transition-all"
              >
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                  {c.eyebrow}
                </div>
                <h3 className="font-serif text-xl text-navy leading-snug">
                  {c.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60">
        <div className="container-narrow text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Questions before submitting?
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              Talk to us <span className="italic">first.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Replies within one business day. Same-day by phone.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:aso-digital@outlook.com"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                aso-digital@outlook.com
              </a>
              <a
                href="tel:8089570111"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                808-957-0111
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
