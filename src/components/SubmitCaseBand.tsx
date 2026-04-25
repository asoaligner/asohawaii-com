import Link from "next/link";

export default function SubmitCaseBand() {
  return (
    <section className="relative bg-navy overflow-hidden py-14 md:py-16">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 30%, #F97316 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="container-narrow relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
          <div className="md:col-span-8 text-white">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
              Quick order form
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-balance">
              Ready to submit a case?
            </h2>
            <p className="mt-3 text-white/70 text-[15.5px] leading-relaxed max-w-xl">
              Quick online form. Response within 1 business day.
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link
              href="/submit-case/"
              className="inline-flex items-center gap-2 bg-brandOrange text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors"
            >
              Submit your case
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
    </section>
  );
}
