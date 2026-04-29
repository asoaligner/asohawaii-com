import Link from "next/link";
import Image from "next/image";

const bullets = [
  {
    label: "$0 for our practices",
    body: "No setup fee, no monthly subscription, no per-case charge.",
  },
  {
    label: "Browser-based, no install",
    body: "Open it on any laptop or iPad. No software to maintain.",
  },
  {
    label: "Direct scanner integration",
    body: "iTero, Medit, 3Shape TRIOS, Primescan, DEXIS, Shining 3D — all flow straight in.",
  },
  {
    label: "HIPAA compliant",
    body: "End-to-end encrypted, role-based access, full audit trail.",
  },
];

export default function EasyRxIntro() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Submit cases digitally
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              What is{" "}
              <span className="italic">EasyRx?</span>
            </h2>
            <p className="mt-6 text-[16px] text-gray-700 leading-relaxed">
              EasyRx is a cloud-based prescription &amp; case-management platform
              that lets your practice send cases straight to ASO Hawaii — no
              more lost faxes, no more emailing STLs around.
            </p>
            <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
              We cover the licence so it&apos;s free for our practices, and most
              clinics are sending their first case within one business day of
              requesting an invitation.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact#invitation"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Request an EasyRx invitation
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
              <a
                href="https://easyrxcloud.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Already have an account? Log in ↗
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-6 md:p-8">
              <div className="flex items-start gap-5 mb-6">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-white border border-gray-200 p-2 flex items-center justify-center">
                  <Image
                    src="/images/aso/easyrx-logo.png"
                    alt="EasyRx logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[14px] text-gray-700 leading-relaxed pt-1">
                  Built specifically for orthodontic labs &amp; practices —
                  the same platform 600+ U.S. labs use for digital case
                  intake.
                </p>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {bullets.map((b) => (
                  <div key={b.label}>
                    <dt className="font-serif text-[16.5px] text-navy leading-snug tracking-tight">
                      {b.label}
                    </dt>
                    <dd className="mt-1 text-[13.5px] text-gray-600 leading-relaxed">
                      {b.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
