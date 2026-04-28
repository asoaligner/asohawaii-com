import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · ASO International Hawaii",
  description:
    "Privacy policy for ASO International Hawaii — what information we collect, how we use it, data storage, cookies, third-party services, and your rights.",
  alternates: { canonical: "/privacy-policy/" },
};

const sections = [
  {
    n: "01",
    title: "Introduction",
    body: (
      <>
        ASO International Hawaii is committed to protecting the privacy of its
        customers and website visitors. This policy outlines how we collect,
        use, and safeguard information submitted through our website and
        services.
      </>
    ),
  },
  {
    n: "02",
    title: "Information We Collect",
    body: (
      <>
        We may collect the following personal information when you interact
        with our services:
        <ul className="mt-3 pl-5 list-disc space-y-1.5">
          <li>Name, email address, and phone number</li>
          <li>Practice or clinic details (clinic name, address)</li>
          <li>Order or pick-up request information</li>
        </ul>
        <p className="mt-3">
          This information is collected when you fill out contact or service
          forms, reach us by email or phone, or submit a pick-up or order
          request.
        </p>
      </>
    ),
  },
  {
    n: "03",
    title: "How We Use Your Information",
    body: (
      <>
        We use your information to:
        <ul className="mt-3 pl-5 list-disc space-y-1.5">
          <li>Process and fulfill your orders or pick-up requests</li>
          <li>
            Communicate with you about your orders, inquiries, or updates
          </li>
          <li>Improve our services and respond effectively to your needs</li>
          <li>Maintain internal records</li>
        </ul>
        <p className="mt-3">
          We do not sell or rent your personal information to third parties.
        </p>
      </>
    ),
  },
  {
    n: "04",
    title: "Data Storage and Security",
    body: (
      <>
        Your information is stored securely and we take reasonable precautions
        to protect it against unauthorized access, disclosure, or alteration.
        Transmission between practices and our lab is encrypted via EasyRx and
        standard TLS.
      </>
    ),
  },
  {
    n: "05",
    title: "Cookies",
    body: (
      <>
        Our website may use cookies to enhance your browsing experience. You
        can choose to disable cookies through your browser settings if you
        prefer.
      </>
    ),
  },
  {
    n: "06",
    title: "Third-Party Services",
    body: (
      <>
        We may use third-party services (e.g. Formspree, Google Forms, EasyRx)
        to support our operations. Each of these providers has its own privacy
        policy, which we encourage you to review.
      </>
    ),
  },
  {
    n: "07",
    title: "Your Rights",
    body: (
      <>
        You have the right to request access to, correction of, or deletion of
        your personal information. To exercise these rights, contact us at{" "}
        <a
          href="mailto:asohawaii@hotmail.com"
          className="text-navy font-medium underline underline-offset-2 hover:text-brandOrange transition-colors"
        >
          asohawaii@hotmail.com
        </a>
        .
      </>
    ),
  },
  {
    n: "08",
    title: "Updates to This Policy",
    body: (
      <>
        This policy may be updated from time to time. The latest version will
        always be available on this page.
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Effective 2025.06.13
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Privacy{" "}
              <span className="italic text-brandOrange">policy.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              What we collect, how we use it, and how to exercise your rights.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-narrow max-w-3xl">
          <ol className="relative border-l border-gray-200 pl-8 space-y-12">
            {sections.map((s) => (
              <li key={s.n} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-brandOrange flex items-center justify-center font-serif italic text-brandOrange text-sm"
                >
                  {s.n}
                </span>
                <h2 className="font-serif text-2xl text-navy leading-snug tracking-tight mb-3">
                  {s.title}
                </h2>
                <div className="text-[15.5px] text-gray-700 leading-relaxed">
                  {s.body}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 rounded-2xl bg-gray-50/60 border border-gray-200 p-8">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-4">
              Contact
            </div>
            <p className="font-serif text-xl text-navy leading-snug">
              ASO International Hawaii, Inc.
            </p>
            <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
              1441 Kapiolani Blvd #1112
              <br />
              Honolulu, HI 96814
            </p>
            <div className="mt-5 space-y-1 text-[15px]">
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-400 mr-3">
                  Phone
                </span>
                <a
                  href="tel:8089570111"
                  className="text-navy font-medium hover:text-brandOrange transition-colors"
                >
                  808-957-0111
                </a>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-400 mr-3">
                  Email
                </span>
                <a
                  href="mailto:asohawaii@hotmail.com"
                  className="text-navy font-medium hover:text-brandOrange transition-colors"
                >
                  asohawaii@hotmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-navy transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
