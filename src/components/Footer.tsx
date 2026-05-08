import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/aso.orthodonticslab.honolulu/";

const quickLinks: { label: string; href: string }[] = [
  { label: "Submit Case", href: "/submit-case/" },
  { label: "Pick-Up Request", href: "/pick-up/" },
  { label: "Get a Quote", href: "/get-a-quote/" },
  { label: "Download", href: "/download/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Privacy Policy", href: "/privacy-policy/" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50/60">
      <div className="container-narrow py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="font-serif text-xl text-navy leading-snug">
              ASO International, Inc.
            </div>
            <p className="mt-3 text-[13.5px] text-gray-600 leading-relaxed">
              Orthodontic Laboratory Services. Serving 150+ Hawaii dental
              practices since 2005.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="mt-5 inline-flex w-9 h-9 items-center justify-center rounded-full text-gray-500 border border-gray-200 hover:text-brandOrange hover:border-brandOrange transition-colors"
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
          </div>

          {/* Contact */}
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
              Contact
            </div>
            <dl className="space-y-2 text-[13.5px] text-gray-700 leading-relaxed">
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a
                    href="tel:8089570111"
                    className="hover:text-brandOrange transition-colors"
                  >
                    808-957-0111
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Fax</dt>
                <dd className="text-gray-500">Fax · 808-957-0222</dd>
              </div>
              <div>
                <dt className="sr-only">Email (general)</dt>
                <dd>
                  <a
                    href="mailto:asohawaii@hotmail.com"
                    className="hover:text-brandOrange transition-colors break-all"
                  >
                    asohawaii@hotmail.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Email (digital submissions)</dt>
                <dd>
                  <a
                    href="mailto:aso-digital@outlook.com"
                    className="hover:text-brandOrange transition-colors break-all"
                  >
                    aso-digital@outlook.com
                  </a>
                  <span className="text-gray-400 text-[12px] block">
                    Digital submissions
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Hours + Address */}
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
              Visit
            </div>
            <p className="text-[13.5px] text-gray-700 leading-relaxed">
              1441 Kapiolani Blvd #1112
              <br />
              Honolulu, HI 96814
            </p>
            <a
              href="https://maps.google.com/?q=1441+Kapiolani+Blvd+%231112+Honolulu+HI+96814"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[12.5px] text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
            >
              Open in Maps
            </a>
            <div className="text-xs uppercase tracking-widest text-gray-400 mt-6 mb-3">
              Hours
            </div>
            <p className="text-[13.5px] text-gray-700 leading-relaxed">
              Mon–Fri · 8:00 AM – 4:30 PM HST
              <br />
              <span className="text-gray-500 text-[12.5px]">
                Closed on federal holidays
              </span>
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
              Quick Links
            </div>
            <ul className="space-y-2 text-[13.5px]">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-700 hover:text-brandOrange transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] text-gray-500">
          <div>© {year} ASO International, Inc. All rights reserved.</div>
          <div className="font-serif italic text-brandOrange">
            ISO 13485 certified
          </div>
        </div>
      </div>
    </footer>
  );
}
