import Image from "next/image";
import Link from "next/link";

export default function Support() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-narrow py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-4">
            <div className="inline-flex items-center rounded-xl bg-white px-4 py-2.5">
              <Image
                src="/images/aso/aso-logo.png"
                alt="ASO International, Inc logo"
                width={220}
                height={78}
                style={{
                  width: "auto",
                  height: "46px",
                  objectFit: "contain",
                }}
              />
            </div>
            <p className="mt-6 text-[15px] text-white/70 leading-relaxed max-w-sm">
              A Pioneer in Orthodontic Laboratory Services. ASO International,
              Inc. — serving Hawaii and the Pacific from Honolulu, with
              headquarters in Tokyo.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/aso.orthodonticslab.honolulu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-brandOrange hover:text-brandOrange transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
              <Link
                href="/portal/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 border border-white/20 rounded-full px-3.5 py-1.5 hover:border-brandOrange hover:text-brandOrange transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Doctor Portal
              </Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Address
            </div>
            <p className="text-[15px] leading-relaxed text-white/90">
              1441 Kapiolani Blvd #1112
              <br />
              Honolulu, HI 96814
            </p>
            <dl className="mt-5 space-y-2 text-[14px] text-white/70">
              <div className="flex gap-3">
                <dt className="w-12 text-white/50">Tel</dt>
                <dd>
                  <a
                    href="tel:8089570111"
                    className="hover:text-brandOrange transition-colors"
                  >
                    808-957-0111
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-12 text-white/50">Fax</dt>
                <dd>808-957-0222</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-12 text-white/50">Email</dt>
                <dd>
                  <a
                    href="mailto:asohawaii@hotmail.com"
                    className="hover:text-brandOrange transition-colors"
                  >
                    asohawaii@hotmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Opening Hours
            </div>
            <p className="text-[15px] leading-relaxed text-white/90">
              Monday – Friday
              <br />
              8:00 am – 4:30 pm
            </p>
            <p className="mt-4 text-[13px] text-white/50 leading-relaxed">
              Closed on Federal Holidays
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Site
            </div>
            <nav className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/product" },
                { label: "New Products", href: "/new-products" },
                { label: "About", href: "/about" },
                { label: "How to Order", href: "/how-to-order" },
                { label: "Submit Case", href: "/submit-case" },
                { label: "Shop", href: "/shop" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
                { label: "Get a Quote", href: "/get-a-quote" },
                { label: "Pick-Up", href: "/pick-up" },
                { label: "Download", href: "/download" },
                { label: "Privacy", href: "/privacy-policy" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-white/80 hover:text-brandOrange transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] text-white/50">
          <div>
            © {new Date().getFullYear()} ASO International Hawaii, Inc. —
            All rights reserved.
          </div>
          <div className="font-serif italic text-white/70">
            Orthodontic Lab · Honolulu, Hawai‘i
          </div>
        </div>
      </div>
    </footer>
  );
}
