import Image from "next/image";
import Link from "next/link";

export default function NewProductsBand() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative aspect-[4/5] max-w-[480px] mx-auto rounded-3xl overflow-hidden shadow-[0_30px_60px_-20px_rgba(15,41,66,0.25)]">
              <Image
                src="/images/aso/product-7.jpg"
                alt="New orthodontic appliance from ASO Hawaii"
                fill
                sizes="(max-width: 1024px) 80vw, 480px"
                className="object-cover"
              />
            </div>
            <div className="absolute -top-6 -right-6 hidden md:flex items-center gap-3 bg-white rounded-full pl-3 pr-5 py-2.5 border border-gray-200 shadow-[0_12px_32px_-12px_rgba(15,41,66,0.2)]">
              <span className="font-serif italic text-brandOrange text-2xl leading-none">
                ✦
              </span>
              <span className="text-sm font-medium text-navy">
                New product lineup
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              New Products
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.08] tracking-tightest text-navy text-balance">
              Newly added:{" "}
              <span className="italic">SomnoDent, MSE/MARPE, LuxCreo</span>,
              and more.
            </h2>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              We&apos;ve expanded our lineup with sleep devices (SomnoDent
              Flex, Avant, HAE, Fusion), miniscrew-assisted expanders
              (MSE/MARPE/Keyless), 3D-printed aligners and retainers
              (LuxCreo, Zendura A), and CAD-engineered metal lingual
              retainers.
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[15px] text-gray-700">
              {[
                "SomnoDent Flex / Avant / HAE / Fusion",
                "EMA Sleep Appliance",
                "MSE / MARPE / Keyless Expander",
                "LuxCreo Direct-Print Aligners",
                "Zendura A Clear Retainer",
                "3D Metal Lingual Retainer",
                "SHU-Lider",
                "SYMPHONY",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 text-brandOrange font-serif italic text-base leading-none">
                    ✦
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/new-products"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Explore new products
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
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-6 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Full catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
