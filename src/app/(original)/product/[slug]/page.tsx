import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogGrid from "@/components/CatalogGrid";
import CompactCustomization from "@/components/CompactCustomization";
import HeroImageButton from "@/components/HeroImageButton";
import { LightboxProvider } from "@/components/LightboxProvider";
import {
  findProductBySlug,
  productCatalog,
  productDetailSlugs,
  RELATED_BY_SLUG,
} from "@/data/product-catalog";
import type { ProductTile } from "@/data/product-catalog";

/** Slugs for products whose acrylic body is colour-customisable.
 *  Each renders the colour chart, custom combinations, and stickers
 *  sections between the hero/promo and the catalog grid. */
const COLOR_CUSTOMIZABLE_SLUGS = new Set([
  "plate-type-retainer-expansion",
  "plate-expansion",
  "functional-appliances",
]);

/** Description copy appended to the product description when the
 *  product supports the full colour palette. Used for SEO metadata. */
const COLOR_PALETTE_NOTE =
  "28 colors, glitter options, 9 neon colors, and 29 stickers available.";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return productDetailSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const product = findProductBySlug(params.slug);
  if (!product) return { title: "Product · ASO Hawaii" };
  const hasColorCustomization =
    product.slug !== null && COLOR_CUSTOMIZABLE_SLUGS.has(product.slug);
  const description = hasColorCustomization
    ? `${product.description} ${COLOR_PALETTE_NOTE}`
    : product.description;
  return {
    title: `${product.name} · ASO Hawaii`,
    description,
    alternates: { canonical: `/product/${product.slug}/` },
  };
}

const SITE_URL = "https://asohawaii.com";

export default function ProductDetailPage({ params }: { params: Params }) {
  const product = findProductBySlug(params.slug);
  if (!product || product.slug === "new-products" || product.slug === null)
    notFound();

  // Product JSON-LD for Google rich-results. Uses the page hero image and
  // points back to the ASO organization node defined in the root layout.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${SITE_URL}${product.heroImage}`,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "ASO International Hawaii",
    },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      url: `${SITE_URL}/product/${product.slug}/`,
      priceSpecification: {
        "@type": "PriceSpecification",
        description: "Quote on request",
      },
    },
    url: `${SITE_URL}/product/${product.slug}/`,
  };

  // Prefer the curated cross-category related list when we have one;
  // otherwise fall back to same-category siblings. Most products now
  // ship with a curated list so the bottom-of-page section always shows
  // three tiles.
  const curatedSlugs = product.slug ? RELATED_BY_SLUG[product.slug] : undefined;
  const related: ProductTile[] = curatedSlugs
    ? curatedSlugs
        .map((s) => productCatalog.find((p) => p.slug === s))
        .filter((p): p is ProductTile => !!p)
    : productCatalog
        .filter(
          (p) =>
            p.slug &&
            p.slug !== product.slug &&
            p.slug !== "new-products" &&
            p.category === product.category
        )
        .slice(0, 3);

  // ASO ALIGNER is rendered as a brochure/intro page rather than a tile
  // catalog — its "variants" are wear schedules + material grades, not
  // discrete SKUs with individual photos, so the lineup layout
  // (generic /product/[slug] default) reads wrong for it.
  const isAligner = product.slug === "aso-aligner";

  // Slugs whose hero/lineup images are arch-shaped (U-form) renders or
  // logos that get visibly cropped by object-cover in a 4:3 frame.
  // Render them with object-contain + neutral backdrop so the full arch
  // is visible.
  const CONTAIN_SLUGS = new Set([
    "flat-occlusal-splint",
    // press-type-appliance: real bench photos are pre-padded to 4:3 with
    // their own dark backdrop, so object-cover fills the card cleanly.
    // invisible-retainer: source image is 1440×1920 — high-res enough to
    // show cropped with object-cover without quality loss. Full-bleed
    // look is stronger than the letterboxed contain version.
  ]);
  const containHero = !!product.slug && CONTAIN_SLUGS.has(product.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <LightboxProvider items={product.items ?? []}>
      {isAligner ? (
        <>
          {/* ——— ASO ALIGNER brochure hero ——— */}
          <section className="relative hero-gradient overflow-hidden">
            <div className="absolute inset-0 subtle-grid opacity-30 pointer-events-none" />
            <div className="container-narrow relative pt-20 pb-16 md:pt-28 md:pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <div className="lg:col-span-6 order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm text-xs text-gray-600 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
                    Signature clear aligner
                  </div>
                  <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.04] tracking-tightest text-navy text-balance">
                    A transparent,{" "}
                    <span className="italic text-brandOrange">aesthetic</span>{" "}
                    mouthpiece-type appliance.
                  </h1>
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    ASO ALIGNER is a thin, clear orthodontic mouthpiece that
                    moves teeth without metal. Designed in our CAD pipeline and
                    delivered in pre-staged trays, it is Japan&apos;s first
                    fully-systemized clear aligner solution — introduced by ASO
                    in 2005 and refined every year since.
                  </p>

                  <div className="mt-10 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/get-a-quote"
                      className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                    >
                      Request a quote
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
                      className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
                    >
                      How to submit a case
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 order-1 lg:order-2">
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-navy shadow-[0_30px_60px_-20px_rgba(15,41,66,0.25)]">
                    <Image
                      src="/images/aso/aso-aligner-package.png"
                      alt="AsoAligner Digital retail packaging — Soft and Hard variants"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ——— Packages: 1 / 3 / 5 step ——— */}
          <section className="py-20 md:py-24 bg-white border-t border-gray-200/60">
            <div className="container-narrow">
              <div className="max-w-2xl mb-14">
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                  Packages
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
                  Three pre-staged <span className="italic">series.</span>
                </h2>
                <p className="mt-4 text-gray-600 leading-relaxed text-[15px]">
                  Every AsoAligner Digital case ships as a staged sequence of
                  trays. Pick the length that matches your treatment plan.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    steps: "1",
                    name: "1 step",
                    blurb:
                      "Single-stage workflow — minor corrections and orthodontic relapse.",
                  },
                  {
                    steps: "3",
                    name: "3 steps",
                    blurb:
                      "Recommended package. Progressive tooth movement for mild-to-moderate cases.",
                    featured: true,
                  },
                  {
                    steps: "5",
                    name: "5 steps",
                    blurb:
                      "Extended series for more complex cases within aligner indications.",
                  },
                ].map((p) => (
                  <div
                    key={p.steps}
                    className={`rounded-2xl p-8 border transition-colors ${
                      p.featured
                        ? "border-brandOrange/40 bg-brandOrange/5"
                        : "border-gray-200 bg-white hover:border-navy/30"
                    }`}
                  >
                    <div
                      className={`text-[11px] uppercase tracking-widest font-semibold mb-3 ${
                        p.featured ? "text-brandOrange" : "text-gray-400"
                      }`}
                    >
                      {p.featured ? "Recommended" : `Package ${p.steps}`}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-5xl text-navy leading-none">
                        {p.steps}
                      </span>
                      <span className="font-serif text-lg text-gray-500 italic">
                        step{p.steps === "1" ? "" : "s"}
                      </span>
                    </div>
                    <h3 className="mt-5 font-serif text-xl text-navy">
                      AsoAligner Digital · {p.name}
                    </h3>
                    <p className="mt-3 text-[14.5px] text-gray-600 leading-relaxed">
                      {p.blurb}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ——— Materials & wear time ——— */}
          <section className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60">
            <div className="container-narrow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
                <div>
                  <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                    Materials
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
                    Soft · Medium · Hard.{" "}
                    <span className="italic text-gray-400">Three grades.</span>
                  </h2>
                  <p className="mt-4 text-gray-600 leading-relaxed text-[15px]">
                    Each tray is pressed from one of three aligner materials,
                    chosen to match the movement you need at that stage.
                  </p>
                  <dl className="mt-8 space-y-5">
                    <div className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-5">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-brandOrange/10 text-brandOrange font-serif text-lg flex items-center justify-center">
                        S
                      </div>
                      <div>
                        <dt className="font-medium text-navy">Soft · 0.5 mm</dt>
                        <dd className="mt-1 text-[14.5px] text-gray-600">
                          Initial-wear. 140–200 hrs (7–10 days) per tray.
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-5">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-brandOrange/15 text-brandOrange font-serif text-lg flex items-center justify-center">
                        M
                      </div>
                      <div>
                        <dt className="font-medium text-navy">Medium · 0.6 mm</dt>
                        <dd className="mt-1 text-[14.5px] text-gray-600">
                          Bridging wear. 140–200 hrs (7–10 days) per tray.
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-5">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-brandOrange/25 text-brandOrange font-serif text-lg flex items-center justify-center">
                        H
                      </div>
                      <div>
                        <dt className="font-medium text-navy">Hard · 0.8 mm</dt>
                        <dd className="mt-1 text-[14.5px] text-gray-600">
                          Final-wear. ~250 hrs (~2 weeks) per tray.
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                    Indications
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
                    Best for — and{" "}
                    <span className="italic">not ideal for.</span>
                  </h2>
                  <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-7">
                    <div className="text-[11px] uppercase tracking-widest font-semibold text-brandOrange mb-4">
                      Ideal cases
                    </div>
                    <ul className="space-y-3 text-[15px] text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          >
                            <path d="M3 8l3 3 7-7" />
                          </svg>
                        </span>
                        Post-treatment relapse
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          >
                            <path d="M3 8l3 3 7-7" />
                          </svg>
                        </span>
                        Minor tooth movement (mainly 3–3)
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          >
                            <path d="M3 8l3 3 7-7" />
                          </svg>
                        </span>
                        Mild crowding ≤ 4 mm
                      </li>
                    </ul>
                  </div>
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-7">
                    <div className="text-[11px] uppercase tracking-widest font-semibold text-gray-400 mb-4">
                      Not recommended
                    </div>
                    <ul className="space-y-3 text-[15px] text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-2.5 h-2.5"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          >
                            <path d="M4 4l8 8M12 4L4 12" />
                          </svg>
                        </span>
                        Extraction cases
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-2.5 h-2.5"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          >
                            <path d="M4 4l8 8M12 4L4 12" />
                          </svg>
                        </span>
                        Severe Angle Class II / III
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-2.5 h-2.5"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          >
                            <path d="M4 4l8 8M12 4L4 12" />
                          </svg>
                        </span>
                        Skeletal discrepancies, open bite
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-30 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-20 md:pt-24 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
                {product.category[0].toUpperCase() + product.category.slice(1)}{" "}
                · {product.tag.replaceAll("_", " ")}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tightest text-navy text-balance">
                {product.name}
              </h1>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                {product.blurb}
              </p>
              <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
                {product.description}
              </p>

              <ul className="mt-8 space-y-3">
                {product.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-[15px] text-gray-700"
                  >
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
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/get-a-quote"
                  className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                >
                  Request quote
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
                  How to submit a case
                </Link>
              </div>

              {product.slug && COLOR_CUSTOMIZABLE_SLUGS.has(product.slug) && (
                <CompactCustomization />
              )}
            </div>

            <div className="lg:col-span-7">
              <HeroImageButton
                image={product.heroImage}
                label={`Enlarge ${product.name}`}
                className={`relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_30px_60px_-20px_rgba(15,41,66,0.25)] block w-full ${containHero ? "bg-white border border-gray-200" : "bg-gray-100"}`}
              >
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className={containHero ? "object-contain p-6 md:p-10" : "object-cover"}
                  priority
                />
                {product.items && product.items.length > 0 && (() => {
                  // Pick the item whose image matches the hero (when the
                  // catalog has an explicit heroImageOverride pointing at a
                  // non-first item). Falls back to items[0].
                  const shown =
                    product.items.find((it) => it.image === product.heroImage) ??
                    product.items[0];
                  return (
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 pointer-events-none">
                    <div className="inline-flex flex-col items-start rounded-xl bg-black/55 backdrop-blur-md px-4 py-2.5 border border-white/10">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                        Shown
                      </div>
                      <div className="font-serif italic text-white text-base md:text-lg leading-tight mt-0.5">
                        {shown.code
                          ? `${shown.code} · ${shown.name}`
                          : shown.name}
                      </div>
                    </div>
                    <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm text-navy text-xs font-medium px-3 py-1.5">
                      <span className="font-serif italic text-brandOrange">
                        {product.items.length}
                      </span>
                      variants in catalog below
                    </div>
                  </div>
                  );
                })()}
              </HeroImageButton>
            </div>
          </div>
        </div>
      </section>
      )}

      {product.promo && (
        <section className="py-8 bg-brandOrange/5 border-y border-brandOrange/20">
          <div className="container-narrow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-brandOrange font-semibold mb-1">
                  {product.promo.label}
                </div>
                <div className="font-serif text-navy text-lg md:text-xl">
                  {product.promo.body}
                </div>
              </div>
              <Link
                href="/get-a-quote"
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-brandOrange text-white px-5 py-2.5 rounded-full hover:bg-brandOrange/90 transition-colors shrink-0"
              >
                Get the promo
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
      )}

      {product.items && product.items.length > 0 && (
        <section className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60">
          <div className="container-narrow">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                  Catalog
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
                  {product.name}{" "}
                  <span className="italic text-gray-400">lineup</span>
                </h2>
                <p className="mt-3 text-gray-600 text-[15px]">
                  {product.items.length} variants available. Ask us for
                  specifics when you request a quote.
                </p>
              </div>
              <Link
                href="/get-a-quote"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors shrink-0"
              >
                Request a quote →
              </Link>
            </div>
            <CatalogGrid items={product.items} containCards={containHero} />

          </div>
        </section>
      )}

      <section className="py-20 md:py-24 bg-white border-t border-gray-200/60">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                Submission
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug">
                Digital or stone — your call.
              </h3>
              <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
                STL/PLY exports from any major scanner, or traditional stone
                models. Typical turnaround 7–10 business days.
              </p>
              <Link
                href="/how-to-order"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
              >
                How to order
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
            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                Pricing
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug">
                Quote by case.
              </h3>
              <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
                Pricing depends on appliance type, complexity, and quantity.
                Quotes returned within one business day.
              </p>
              <Link
                href="/get-a-quote"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
              >
                Request a quote
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
            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
                Rush service
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug">
                Need it faster?
              </h3>
              <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
                Rush service is available on request. Additional fees may apply
                based on complexity and turnaround.
              </p>
              <a
                href="tel:8089570111"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
              >
                Call 808-957-0111
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
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 md:py-24 bg-gray-50/60 border-y border-gray-200/60">
          <div className="container-narrow">
            <div className="max-w-2xl mb-12">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                Related products
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
                Similar <span className="italic">lines.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.tag}
                  href={`/product/${r.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all"
                >
                  <div className={`relative aspect-[4/3] overflow-hidden ${r.slug && CONTAIN_SLUGS.has(r.slug) ? "bg-white" : "bg-gray-50"}`}>
                    <Image
                      src={r.heroImage}
                      alt={r.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={
                        r.slug && CONTAIN_SLUGS.has(r.slug)
                          ? "object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                          : "object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      }
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                      {r.name}
                    </h3>
                    <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed">
                      {r.blurb}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors">
                      View product
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Miniature Collection cross-sell */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-narrow">
          <Link
            href="/shop/"
            className="group block rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white overflow-hidden hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
              <div className="md:col-span-5 relative aspect-[4/3] md:aspect-auto md:min-h-[280px] bg-gray-50">
                <Image
                  src="/images/aso/miniature/miniature-set.jpg"
                  alt="ASO Miniature Collection — set of 5 hand-crafted models"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="md:col-span-7 p-7 md:p-10 flex flex-col justify-center">
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                  Looking for a unique dental gift?
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-navy leading-snug tracking-tight">
                  Discover our{" "}
                  <span className="italic">Miniature Collection.</span>
                </h3>
                <p className="mt-3 text-[14.5px] text-gray-600 leading-relaxed max-w-xl">
                  Hand-crafted miniature orthodontic models — for graduations,
                  patient milestones, and orthodontic office decor.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors">
                  Visit the shop
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
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-12 text-center">
        <Link
          href="/product"
          className="text-sm text-gray-500 hover:text-navy transition-colors"
        >
          ← Back to all products
        </Link>
      </section>
      </LightboxProvider>
    </>
  );
}
