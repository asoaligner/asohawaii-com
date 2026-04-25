import Image from "next/image";
import Link from "next/link";

export default function MiniatureCollectionBand() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-50 border border-gray-200">
              <Image
                src="/images/aso/miniature/miniature-hand.jpg"
                alt="ASO miniature orthodontic models — hand-crafted with real dental resin"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              A special collection
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              Hand-crafted{" "}
              <span className="italic">miniature models.</span>
            </h2>
            <p className="mt-6 text-[16px] text-gray-700 leading-relaxed">
              Beyond our daily craft for dental practices, we hand-make
              miniature orthodontic models — perfect for graduations, gifts,
              and orthodontic office decor.
            </p>
            <div className="mt-8">
              <Link
                href="/shop/"
                className="inline-flex items-center gap-2 bg-navy text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Discover the collection
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
