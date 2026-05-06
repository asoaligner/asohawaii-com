import Link from "next/link";

const FEATURES = [
  "Track your case submissions",
  "View order history",
  "Access invoices and shipping status",
  "Manage your account preferences",
];

export default function PortalPage() {
  return (
    <section className="relative hero-gradient overflow-hidden">
      <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
      <div className="container-narrow relative pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
            Doctor Portal · In Development
          </div>

          <div className="text-6xl md:text-7xl mb-6" aria-hidden>
            🚧
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tightest text-navy text-balance">
            ASO Hawaii Doctor Portal
          </h1>
          <p className="mt-4 font-serif italic text-2xl sm:text-3xl text-brandOrange">
            Coming Soon
          </p>

          <p className="mt-8 text-lg text-gray-600 leading-relaxed">
            We&apos;re building a dedicated portal for our valued partner
            clinics where you&apos;ll be able to:
          </p>

          <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex shrink-0 w-6 h-6 items-center justify-center rounded-full bg-brandOrange/10 text-brandOrange"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-gray-500 leading-relaxed">
            In the meantime, please use our EasyRx integration for case
            submissions and management.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://easyrxcloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-navy text-white px-5 py-3 rounded-full hover:bg-navy-light transition-colors"
            >
              EasyRx Login
              <span aria-hidden>→</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-navy border border-gray-300 px-5 py-3 rounded-full hover:border-navy hover:bg-navy/5 transition-colors"
            >
              <span aria-hidden>←</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
