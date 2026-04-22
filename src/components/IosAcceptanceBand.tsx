import Link from "next/link";
import ScannerGuidesSection from "@/app/(original)/how-to-order/_components/ScannerGuidesSection";

/**
 * Home-page band below the Hero. Advertises that we accept scans from all
 * major IOS platforms, with the 6 scanner cards as click-to-preview tiles
 * (same component as /how-to-order#scanner-guides). Goal: a visitor lands
 * on home and immediately sees (slides above) + (IOS support below).
 */
export default function IosAcceptanceBand() {
  return (
    <section className="py-14 md:py-16 bg-white border-b border-gray-200/60">
      <div className="container-narrow">
        {/* Trust lede — one-line positioning statement above the scanner band. */}
        <p className="text-center text-[15px] md:text-base text-gray-600 mb-12 md:mb-14 max-w-3xl mx-auto leading-relaxed">
          <span className="font-medium text-navy">
            ASO Hawaii is a trusted orthodontic lab
          </span>{" "}
          providing retainers, aligners, and appliances for dental
          professionals across Honolulu.
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
              IOS accepted
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tightest text-navy text-balance">
              Send cases from <span className="italic">any scanner.</span>
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">
              We accept STL exports from every major intraoral scanner. Click
              any platform below for its step-by-step setup guide.
            </p>
          </div>
          <Link
            href="/how-to-order#scanner-guides"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors shrink-0"
          >
            Full setup instructions
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

        <ScannerGuidesSection />
      </div>
    </section>
  );
}
