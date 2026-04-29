import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New Products · ASO Hawaii — Latest appliance lineup",
  description:
    "ASO Hawaii's newest appliances: SomnoDent sleep devices, MSE/MARPE expanders, LuxCreo 3D-printed aligners, Zendura A retainers, SYMPHONY, SHU-Lider, and more.",
  alternates: { canonical: "/new-products/" },
};

type Tile = {
  name: string;
  blurb: string;
  category: "sleep" | "expander" | "retainer" | "aligner" | "other";
  image: string;
  /** When set, "Submit order" deep-links to /submit-case?product=<slug>
   *  so the form opens with this appliance pre-selected. Falls back to
   *  /submit-case when omitted. Slugs match src/data/product-catalog.ts. */
  submitSlug?: string;
};

// Each tile explicitly paired with its photo (no index-based assignment).
// Duplicates removed: the two "LuxCreo" tiles on the live site (aligner +
// retainer) collapsed into a single combined entry.
const tiles: Tile[] = [
  {
    name: "Keyless Expander",
    blurb:
      "Self-activating palatal expansion without daily key turns.",
    category: "expander",
    image: "/images/aso/wix/e724a4_22d23e4a4f8a4cb69d43d5885b75c6fe.jpg",
    submitSlug: "band-appliance",
  },
  {
    name: "MSE / MARPE",
    blurb:
      "Miniscrew-assisted rapid palatal expansion for skeletal correction.",
    category: "expander",
    image: "/images/aso/wix/e724a4_55c75e2ae23242f292fd3859437b2bad.png",
    submitSlug: "band-appliance",
  },
  {
    name: "3D Metal Lingual Retainer",
    blurb:
      "CAD-designed, laser-sintered metal retainers for superior fit.",
    category: "retainer",
    image: "/images/aso/wix/e724a4_93c8cf01becb4c9aafbec0535ba8dd8a.jpg",
    submitSlug: "lingual-retainer",
  },
  {
    name: "EMA Sleep Appliance",
    blurb:
      "Elastic mandibular advancement for mild-to-moderate OSA.",
    category: "sleep",
    image: "/images/aso/wix/e724a4_a4a45caa785843bf91c3a9bb1cf73767.png",
    submitSlug: "sleep-apnea",
  },
  {
    name: "SomnoDent Flex",
    blurb:
      "Flexible acrylic MAD — patient-preferred for long-term wear.",
    category: "sleep",
    image: "/images/aso/wix/e724a4_76fb08407abd470d8a3c571f051615b8.png",
    submitSlug: "sleep-apnea",
  },
  {
    name: "SomnoDent Avant",
    blurb:
      "Streamlined MAD with reduced bulk and improved tongue space.",
    category: "sleep",
    image: "/images/aso/wix/e724a4_4db1add57fbf4808a5d1c315f6c950f3.jpg",
    submitSlug: "sleep-apnea",
  },
  {
    name: "SomnoDent HAE",
    blurb:
      "Herbst-style element for precise titration of mandibular position.",
    category: "sleep",
    image: "/images/aso/wix/e724a4_10e33fb6969e435097d4e0343603233f.jpg",
    submitSlug: "sleep-apnea",
  },
  {
    name: "SomnoDent Fusion",
    blurb:
      "Dual-laminate thermoformed base with hard occlusal surface.",
    category: "sleep",
    image: "/images/aso/wix/e724a4_0183e18246234931bf68dabf3e38b007.png",
    submitSlug: "sleep-apnea",
  },
  {
    name: "Zendura A Clear Retainer",
    blurb:
      "Crack-resistant, clarity-preserving clear retainer material.",
    category: "retainer",
    image: "/images/aso/wix/e724a4_3ad43298f7574f9cb1fc21fd8c6c8f63.png",
    submitSlug: "invisible-retainer",
  },
  {
    // Merged "Lux Creo Direct Printed Aligner" + "LuxCreo Direct Print" into
    // a single product (both described the same printed aligner/retainer line).
    name: "LuxCreo Direct Printed Aligner & Retainer",
    blurb:
      "3D-printed aligners and retainers directly from digital treatment plans — precise tolerance, no thermoforming.",
    category: "aligner",
    image: "/images/aso/wix/e724a4_9c6f80d6b09240ce8403b15b8eb62d87.png",
    submitSlug: "aso-aligner",
  },
  {
    name: "MARPE",
    blurb:
      "Mini-implant Assisted Rapid Palatal Expansion for skeletal correction.",
    category: "expander",
    image: "/images/aso/wix/e724a4_ead0b5562944490991f8052f49f8feb6.png",
    submitSlug: "band-appliance",
  },
  {
    name: "MSE",
    blurb:
      "Maxillary Skeletal Expander designed for efficient mid-palatal suture opening.",
    category: "expander",
    image: "/images/aso/wix/e724a4_b1665132987b48ff8c427a6e9c394a5b.png",
    submitSlug: "band-appliance",
  },
  {
    name: "SHU-Lider",
    blurb:
      "Guided bite-correction appliance for Class II patients — a modern take on functional therapy.",
    category: "other",
    image: "/images/aso/wix/e724a4_d79e41519f0344dcb4c09855f333773e.png",
    submitSlug: "functional-appliances",
  },
  {
    name: "SYMPHONY",
    blurb:
      "Customized orthodontic appliance from a digital treatment plan — our CAD team works to your Rx.",
    category: "other",
    image: "/images/aso/wix/e724a4_8225fcb0004044709fb4a58ff7ddd2ba.png",
  },
  {
    name: "HARMONY",
    blurb:
      "Advanced lingual bracket system — fully customized from digital treatment plan for discreet treatment.",
    category: "other",
    image: "/images/aso/wix/e724a4_aedc33243ff14e6194d4681d11380366.jpg",
    submitSlug: "lingual-retainer",
  },
];

const catLabel: Record<Tile["category"], string> = {
  sleep: "Sleep",
  expander: "Expander",
  retainer: "Retainer",
  aligner: "Aligner",
  other: "Custom",
};

export default function NewProductsPage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Newly launched
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              New products from{" "}
              <span className="italic text-brandOrange">the lab.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Our latest appliances — sleep devices, MSE/MARPE expanders,
              direct-printed aligners and retainers, and CAD-engineered metal
              lingual retainers.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiles.map((t) => (
              <div
                key={t.name}
                className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-medium bg-white/90 backdrop-blur-sm text-navy px-2.5 py-1 rounded-full">
                      {catLabel[t.category]}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                    {t.name}
                  </h3>
                  <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed flex-grow">
                    {t.blurb}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={
                        t.submitSlug
                          ? `/submit-case?product=${t.submitSlug}`
                          : "/submit-case"
                      }
                      className="inline-flex items-center gap-1.5 text-sm font-medium bg-navy text-white px-4 py-2 rounded-full hover:bg-navy-light transition-colors"
                    >
                      Submit order
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
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors"
                    >
                      Request quote →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Interested?
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
              Want pricing on any of <span className="italic">these?</span>
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Pricing depends on appliance type, complexity, and quantity. We
              reply within one business day.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
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
                href="/product"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                See full catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
