import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const SITE_URL = "https://asohawaii.com";

export const metadata: Metadata = {
  title:
    "Shop | Hand-crafted Miniature Orthodontic Models | ASO Hawaii",
  description:
    "Hand-crafted miniature orthodontic models from ASO Hawaii. Perfect for dental hygienist graduations, orthodontic office decor, and unique dental gifts. Set of 5: $220, Single: $48.",
  alternates: { canonical: "/shop/" },
  openGraph: {
    title: "ASO Miniature Collection — Hand-crafted Orthodontic Models",
    description:
      "Hand-crafted miniature orthodontic models, made by the same technicians who craft real appliances for 150+ Hawaii dental practices.",
    images: [
      {
        url: "/images/aso/miniature/miniature-set.jpg",
        width: 1200,
        height: 800,
        alt: "ASO Miniature Collection — set of 5 hand-crafted orthodontic models in acrylic display case",
      },
    ],
  },
};

const howItWorks = [
  {
    n: "01",
    title: "Submit your order",
    body: "Tell us which piece you want, where to ship it, and any special requests. Takes about a minute.",
  },
  {
    n: "02",
    title: "We send a payment link",
    body: "Within 24 hours we email you a secure payment link with the final total including shipping.",
  },
];

const faqs = [
  {
    q: "Are these actual orthodontic appliances?",
    a: "They are miniature replicas hand-crafted using real dental resin, following the same precision techniques used to make actual orthodontic appliances. They are decorative items, not functional dental devices.",
  },
  {
    q: "Can I customize a set?",
    a: "Yes — contact us with your specific requests for custom configurations.",
  },
  {
    q: "How long does delivery take?",
    a: "We typically ship within 2 weeks of order confirmation.",
  },
  {
    q: "Do you offer wholesale pricing for clinics?",
    a: "Yes — please contact us for wholesale and bulk order pricing.",
  },
  {
    q: "Can I return or exchange?",
    a: "Due to the handcrafted nature of each piece, all sales are final. However, if your item arrives damaged, please contact us within 7 days for a replacement.",
  },
];

const productJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ASO Miniature Collection — Complete Set of 5",
    description:
      "Five hand-crafted miniature orthodontic models displayed in a premium clear acrylic case with subtle ASO branding. Made with real dental resin by the same technicians who craft real appliances for Hawaii dental practices.",
    image: `${SITE_URL}/images/aso/miniature/miniature-set.jpg`,
    brand: { "@type": "Brand", name: "ASO International Hawaii" },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      price: "220",
      url: `${SITE_URL}/shop/order/?item=set`,
    },
    url: `${SITE_URL}/shop/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ASO Miniature — Individual Model",
    description:
      "A single hand-crafted miniature orthodontic model. Choose your favorite appliance type and color. Perfect as a keepsake or gift for graduations and patient milestones.",
    image: `${SITE_URL}/images/aso/miniature/miniature-hand.jpg`,
    brand: { "@type": "Brand", name: "ASO International Hawaii" },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      price: "48",
      url: `${SITE_URL}/shop/order/?item=single`,
    },
    url: `${SITE_URL}/shop/`,
  },
];

export default function ShopPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/aso/miniature/miniature-set.jpg"
            alt="ASO Miniature Collection — set of 5 hand-crafted orthodontic models"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/55 to-navy/85" />
        </div>
        <div className="container-narrow relative pt-24 pb-24 md:pt-36 md:pb-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm text-xs text-white/85 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Limited collection
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.25rem] leading-[1.05] tracking-tightest text-balance">
              ASO Miniature{" "}
              <span className="italic text-brandOrange">Collection.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-2xl">
              Hand-crafted tributes to four decades of orthodontic precision.
            </p>
            <p className="mt-4 text-[15px] text-white/65 leading-relaxed max-w-2xl">
              From the lab that crafts real orthodontic appliances for 150+
              Hawaii dental practices.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 bg-brandOrange text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors"
              >
                View the collection
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </Link>
              <Link
                href="/shop/order/"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/25 px-5 py-3 rounded-full text-sm font-medium hover:bg-white/15 transition-colors"
              >
                Place an order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-50 border border-gray-200">
                <Image
                  src="/images/aso/miniature/miniature-hand.jpg"
                  alt="ASO miniature models shown alongside a full-size dental model for scale"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                The story
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
                A smaller tribute to a{" "}
                <span className="italic">bigger craft.</span>
              </h2>
              <p className="mt-6 text-[16px] text-gray-700 leading-relaxed">
                Each miniature is hand-crafted by the same dental technicians
                who create real orthodontic appliances for clinics across
                Hawaii. Using actual dental resin and the same precision
                techniques honed over 40+ years, every piece is a celebration of
                the art of orthodontics.
              </p>
              <p className="mt-5 text-[15px] text-gray-600 leading-relaxed">
                <span className="text-navy font-medium">Perfect for:</span>{" "}
                dental hygienist graduations, orthodontic office decor, patient
                milestone gifts, or anyone who appreciates the beauty of
                dentistry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section
        id="products"
        className="py-20 md:py-28 bg-gray-50/60 border-y border-gray-200/60 scroll-mt-24"
      >
        <div className="container-narrow">
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              The collection
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
              Two ways to <span className="italic">own a piece.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SET */}
            <div className="lg:col-span-7 rounded-3xl border border-gray-200 bg-white overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-gray-50">
                <Image
                  src="/images/aso/miniature/miniature-set.jpg"
                  alt="Complete set of 5 ASO miniature orthodontic models in a clear acrylic display case"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold bg-brandOrange/95 text-white px-2.5 py-1 rounded-full">
                  Bestseller
                </span>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h3 className="font-serif text-2xl md:text-3xl text-navy leading-snug tracking-tight">
                    Complete Collection (Set of 5)
                  </h3>
                  <div className="font-serif text-3xl text-brandOrange tracking-tight">
                    $220
                  </div>
                </div>
                <p className="mt-4 text-[15px] text-gray-600 leading-relaxed">
                  Five hand-crafted miniature models showcasing different
                  orthodontic appliance types, displayed in a premium clear
                  acrylic case with subtle ASO branding.
                </p>
                <p className="mt-4 text-[14px] text-gray-600 leading-relaxed">
                  Choose from a variety of appliance types.
                </p>
                <div className="mt-7">
                  <Link
                    href="/shop/order/?item=set"
                    className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                  >
                    Order this set
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

            {/* SINGLE */}
            <div className="lg:col-span-5 rounded-3xl border border-gray-200 bg-white overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-gray-50">
                <Image
                  src="/images/aso/miniature/miniature-hand.jpg"
                  alt="Individual ASO miniature orthodontic model"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h3 className="font-serif text-2xl md:text-3xl text-navy leading-snug tracking-tight">
                    Individual Model
                  </h3>
                  <div className="font-serif text-3xl text-brandOrange tracking-tight">
                    $48
                  </div>
                </div>
                <p className="mt-4 text-[15px] text-gray-600 leading-relaxed flex-grow">
                  A single hand-crafted miniature, perfect as a keepsake or
                  gift. Choose your favorite appliance type.
                </p>
                <p className="mt-4 text-[14px] text-gray-600 leading-relaxed">
                  Choose from a variety of appliance types.
                </p>
                <div className="mt-7">
                  <Link
                    href="/shop/order/?item=single"
                    className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                  >
                    Order single model
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
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-narrow">
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              How it works
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
              From inquiry to{" "}
              <span className="italic">your hands.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-gray-200 bg-white p-7"
              >
                <div className="font-serif italic text-brandOrange text-xl mb-4">
                  {s.n}
                </div>
                <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-[14.5px] text-gray-600 leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHIPPING */}
      <section className="py-16 md:py-20 bg-gray-50/60 border-y border-gray-200/60">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                US Domestic
              </div>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                <span className="font-medium text-navy">$15 flat rate</span>
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                International
              </div>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                <span className="font-medium text-navy">Quoted per order</span>
                <br />
                Contact us for shipping rates and timing.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                Origin
              </div>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                <span className="font-medium text-navy">Honolulu, Hawai‘i</span>
                <br />
                All items ship from our Kapiolani Blvd lab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-narrow max-w-3xl">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              FAQ
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
              Common <span className="italic">questions.</span>
            </h2>
          </div>
          <dl className="divide-y divide-gray-100 border-y border-gray-100">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-serif text-lg text-navy leading-snug tracking-tight">
                  {f.q}
                </dt>
                <dd className="mt-3 text-[15px] text-gray-600 leading-relaxed">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 bg-navy text-white">
        <div className="container-narrow text-center max-w-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-balance">
            Ready to own a piece of{" "}
            <span className="italic text-brandOrange">
              orthodontic craftsmanship?
            </span>
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed">
            Ships within 2 weeks of order confirmation.
          </p>
          <div className="mt-8">
            <Link
              href="/shop/order/"
              className="inline-flex items-center gap-2 bg-brandOrange text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors"
            >
              Place your order
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
    </>
  );
}
