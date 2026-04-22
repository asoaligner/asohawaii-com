import Image from "next/image";
import Link from "next/link";
import { findProductBySlug } from "@/data/product-catalog";

const FEATURED_SLUGS = [
  "aso-aligner",
  "lingual-retainer",
  "flat-occlusal-splint",
  "band-appliance",
  "plate-expansion",
  "invisible-retainer",
] as const;

// Slugs whose hero image is a logo/wordmark or tall arch render that
// shouldn't be cropped by object-cover. Use object-contain + padding
// on the home-page card to show the whole image.
const CONTAIN_SLUGS = new Set([
  "flat-occlusal-splint",
  "press-type-appliance",
]);

export default function FeaturedProducts() {
  const featured = FEATURED_SLUGS.map((slug) => findProductBySlug(slug)).filter(
    (p): p is NonNullable<ReturnType<typeof findProductBySlug>> => !!p
  );

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Our Products
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.08] tracking-tightest text-navy text-balance">
              Digital orthodontic appliances,{" "}
              <span className="italic text-brandOrange">
                precision-crafted
              </span>{" "}
              to your specifications.
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              From clear aligners to custom expansion appliances, every product
              is designed and fabricated from your digital scans in our
              Honolulu lab.
            </p>
          </div>
          <Link
            href="/product/"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors shrink-0"
          >
            Browse all 15 products
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              key={p.tag}
              href={`/product/${p.slug}/`}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                <Image
                  src={p.heroImage}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={
                    p.slug && CONTAIN_SLUGS.has(p.slug)
                      ? "object-contain p-8 transition-transform duration-500 group-hover:scale-[1.03]"
                      : "object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/5 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed flex-grow">
                  {p.blurb}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors">
                  View details
                  <svg
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/product/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy bg-white border border-gray-200 px-5 py-2.5 rounded-full hover:border-navy transition-colors"
          >
            Browse all 15 products
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
    </section>
  );
}
