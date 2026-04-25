import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { productCatalog } from "@/data/product-catalog";

export const metadata: Metadata = {
  title: "Products · ASO Hawaii — Orthodontic lab catalogue",
  description:
    "ASO International Hawaii's full product catalogue: retainers, aligners, splints, sleep appliances, functional appliances, IDB, and more. Fabricated from your digital scans.",
  alternates: { canonical: "/product/" },
};

// Slugs whose hero image is a logo/wordmark or tall arch render that
// shouldn't be cropped by object-cover. Render with object-contain
// so the full image stays inside the card.
const CONTAIN_SLUGS = new Set([
  "flat-occlusal-splint",
  "press-type-appliance",
]);

export default function ProductPage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Full lab catalogue
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Lab products, engineered for{" "}
              <span className="italic text-brandOrange">digital workflow.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Fifteen product lines, all fabricated from your digital scans.
              Tap into any tile for details, or skip ahead and get a quote.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Get a quote
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
                href="/how-to-order"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                How to order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCatalog.map((p, i) => {
              const detailHref = p.slug
                ? p.slug === "new-products"
                  ? "/new-products"
                  : `/product/${p.slug}`
                : "/get-a-quote";
              const submitHref =
                p.slug && p.slug !== "new-products"
                  ? `/submit-case/?product=${encodeURIComponent(p.slug)}`
                  : "/submit-case/";
              const showSubmit = p.slug !== "new-products";
              return (
                <div
                  key={p.tag}
                  className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all flex flex-col"
                >
                  <Link
                    href={detailHref}
                    className={`relative aspect-[4/3] overflow-hidden block ${p.slug && CONTAIN_SLUGS.has(p.slug) ? "bg-white" : "bg-gray-50"}`}
                  >
                    <Image
                      src={p.heroImage}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={
                        p.slug && CONTAIN_SLUGS.has(p.slug)
                          ? "object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                          : "object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      }
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${
                          p.category === "launches"
                            ? "bg-brandOrange/90 text-white"
                            : "bg-white/90 text-navy"
                        }`}
                      >
                        {p.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="font-serif italic text-white text-2xl drop-shadow-md leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={detailHref} className="block">
                      <h3 className="font-serif text-xl text-navy leading-snug tracking-tight group-hover:text-brandOrange transition-colors">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed flex-grow">
                        {p.blurb}
                      </p>
                    </Link>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
                      >
                        {p.slug ? "See details" : "Request quote"}
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
                      {showSubmit && (
                        <Link
                          href={submitHref}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brandOrange border border-brandOrange/30 hover:bg-brandOrange hover:text-white rounded-full px-3 py-1.5 transition-colors ml-auto"
                        >
                          Submit case
                          <svg
                            className="w-3 h-3"
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
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Consultation about our products
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              Not sure which appliance fits your{" "}
              <span className="italic">case?</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              We&apos;re happy to explain how our orthodontic appliances can
              support your treatment. Typical turnaround: 7–10 business days,
              with rush service available on request.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Get a quote
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
