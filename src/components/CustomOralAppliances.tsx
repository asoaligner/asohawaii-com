import Image from "next/image";
import Link from "next/link";

export default function CustomOralAppliances() {
  return (
    <section className="py-24 md:py-32 bg-gray-50/60 border-y border-gray-200/60">
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Sleep apnea
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.08] tracking-tightest text-navy text-balance">
              Custom oral appliances for{" "}
              <span className="italic text-brandOrange">better sleep.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Custom-made oral appliances designed to help manage snoring and
              obstructive sleep apnea. Multiple adjustable designs available to
              meet individual clinical needs.
            </p>

            <ul className="mt-8 space-y-3 text-[15px] text-gray-700">
              {[
                "Mandibular advancement devices (MAD)",
                "Tongue-retaining designs",
                "Telescoping and elastic mechanisms",
                "Full SomnoDent lineup (Flex, Avant, HAE, Fusion)",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mt-0.5">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                View Products
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
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Get a quote
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_30px_60px_-20px_rgba(15,41,66,0.25)]">
              <Image
                src="/images/aso/product-2.jpg"
                alt="Custom sleep apnea and snoring appliances — SomnoDent and adjustable MAD designs"
                fill
                sizes="(max-width: 1024px) 80vw, 520px"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-5 left-5 md:bottom-6 md:left-6 max-w-[260px] pointer-events-none">
              <div className="inline-flex flex-col items-start rounded-xl bg-black/55 backdrop-blur-md px-4 py-3 border border-white/10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/75">
                  Featured
                </div>
                <div className="font-serif italic text-white text-base md:text-lg leading-tight mt-1">
                  SomnoDent · EMA · MAD
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 bg-white rounded-full pl-3 pr-5 py-2.5 border border-gray-200 shadow-[0_12px_32px_-12px_rgba(15,41,66,0.2)]">
              <span className="w-7 h-7 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              </span>
              <span className="text-sm font-medium text-navy">
                Custom-fit · Adjustable
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
