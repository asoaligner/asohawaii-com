import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageImages } from "@/data/aso-images";

export const metadata: Metadata = {
  title: "About · ASO International Hawaii — Japan's leading orthodontic lab",
  description:
    "ASO International was founded in Tokyo in 1982 and has grown into Japan's largest orthodontic laboratory. ASO Hawaii (est. 2005) brings that pipeline to practices across the Pacific.",
};

const pillars = [
  {
    n: "01",
    title: "Unmatched technical expertise.",
    body:
      "A pioneer in the orthodontic lab industry, founded by Toshimasa Aso. Our team is supported by expert orthodontists, with ISO 13485-certified quality assurance across every facility.",
  },
  {
    n: "02",
    title: "Digital innovation meets premium design.",
    body:
      "First in Japan to develop a fully systemized clear aligner solution in 2005. CAD/CAM pipelines, 3D printers, and high-performance materials for aligners, retainers, and custom appliances.",
  },
  {
    n: "03",
    title: "Trusted across Japan and beyond.",
    body:
      "Clients include 29 dental universities and many leading orthodontic clinics. ASO Hawaii (est. 2005) was our first overseas production center, followed by Manila and Silicon Valley.",
  },
];

const story = [
  {
    year: "1982",
    title: "Founded in Tokyo.",
    body:
      "Toshimasa Aso founds ASO International, Inc. in Tokyo — a mission to bring orthodontic laboratory work up to the precision standard of top Japanese craftsmanship.",
  },
  {
    year: "1982 – 2005",
    title: "Grew into Japan's largest orthodontic lab.",
    body:
      "Production and sales centers established in Tokyo, Niigata, Nagoya, and Osaka. Built a network of 50+ domestic and international facilities over four decades.",
  },
  {
    year: "2005",
    title: "Digital first — fully systemized clear aligner.",
    body:
      "First in Japan to ship a fully systemized clear aligner workflow. ASO International Hawaii opens the same year as our first overseas production center.",
  },
  {
    year: "Today",
    title: "Global, digital, ISO 13485.",
    body:
      "Offices in Tokyo, Honolulu, Manila, and Silicon Valley. Serving 29 dental universities and practices across the Pacific. ISO 13485 quality certification across facilities.",
  },
];

const offices = [
  { k: "Tokyo", v: "Headquarters · 1982" },
  { k: "Niigata · Nagoya · Osaka", v: "Production & sales centers" },
  { k: "Honolulu", v: "First overseas lab · 2005" },
  { k: "Manila", v: "Philippines production center" },
  { k: "Silicon Valley", v: "U.S. mainland operations" },
];

export default function AboutPage() {
  const heroImage = pageImages("about-us")[0] ?? "/images/aso/product-1.jpg";

  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-20 md:pt-28 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
                About ASO International
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.2rem] leading-[1.03] tracking-tightest text-navy text-balance">
                Japan&apos;s leading orthodontic lab —{" "}
                <span className="italic text-brandOrange">
                  now serving Hawaii.
                </span>
              </h1>
              <p className="mt-7 text-lg text-gray-600 leading-relaxed max-w-xl">
                ASO International, Inc. was founded in Tokyo in 1982 and has
                grown into Japan&apos;s largest and most advanced orthodontic
                laboratory. ASO Hawaii brings that pipeline — CAD/CAM, ISO
                13485, fully systemized aligners — to practices across the
                Pacific.
              </p>
              <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl">
                {[
                  { k: "40+ yrs", v: "Since founding" },
                  { k: "50+", v: "Facilities" },
                  { k: "29", v: "Dental universities" },
                  { k: "ISO 13485", v: "Certified" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="text-xs uppercase tracking-widest text-gray-500">
                      {s.v}
                    </dt>
                    <dd className="mt-1 font-serif text-2xl text-navy tracking-tight">
                      {s.k}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-5">
              <div className="relative max-w-[500px] mx-auto">
                <div className="relative aspect-[3/2] rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-[0_40px_80px_-30px_rgba(15,41,66,0.35)]">
                  <Image
                    src={heroImage}
                    alt="ASO Hawaii orthodontic laboratory"
                    fill
                    sizes="(max-width: 1024px) 80vw, 500px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="absolute -bottom-5 -right-5 rounded-2xl bg-white border border-gray-200 shadow-[0_12px_32px_-12px_rgba(15,41,66,0.2)] p-4 max-w-[200px] hidden md:block">
                  <div className="font-serif italic text-brandOrange text-4xl leading-none mb-2">
                    &ldquo;
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    Japanese craftsmanship at the scale of a global digital
                    pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="container-narrow">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Three pillars
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              What sets ASO International <span className="italic">apart.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Four decades of orthodontic craftsmanship, engineered into a
              modern digital pipeline.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {pillars.map((p) => (
              <div
                key={p.n}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 hover:border-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(15,41,66,0.12)] transition-all duration-300"
              >
                <div className="font-serif italic text-5xl text-brandOrange leading-none mb-6">
                  {p.n}
                </div>
                <h3 className="font-serif text-2xl text-navy tracking-tight leading-snug">
                  {p.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-gray-50/60 border-y border-gray-200/60">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                Timeline
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
                From Tokyo, 1982 →{" "}
                <span className="italic">Honolulu, today.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                A brief timeline of how we got here.
              </p>
            </div>

            <ol className="lg:col-span-8 relative">
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gray-200 hidden sm:block" />
              {story.map((s) => (
                <li
                  key={s.year}
                  className="relative grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-6 pb-10 sm:pl-10"
                >
                  <span
                    aria-hidden
                    className="hidden sm:block absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-brandOrange bg-white"
                  />
                  <div className="font-serif italic text-brandOrange text-lg sm:text-base tracking-tight">
                    {s.year}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-navy tracking-tight leading-snug">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-gray-600 leading-relaxed text-[15px]">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                Our mission
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
                Bringing world-class orthodontic technology to{" "}
                <span className="italic">the world.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Delivering professional, cutting-edge orthodontic technology
                from Japan to the world. We also run seminars, technician
                training, and collaborative research — proud to serve
                Hawaii&apos;s dental community.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact#invitation"
                  className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                >
                  Start sending cases
                </Link>
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
                >
                  See our catalogue
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-6">
                Global offices
              </div>
              <dl className="divide-y divide-gray-100">
                {offices.map((o) => (
                  <div
                    key={o.k}
                    className="grid grid-cols-[minmax(160px,1fr)_1fr] gap-4 py-3.5 items-baseline"
                  >
                    <dt className="font-serif text-navy text-[15px]">{o.k}</dt>
                    <dd className="text-sm text-gray-500">{o.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span className="font-serif italic text-brandOrange">
                  Global reach
                </span>
                <span>5 offices · 3 countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
