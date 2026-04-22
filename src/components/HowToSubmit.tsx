import Link from "next/link";
import Image from "next/image";

const items = [
  {
    n: "01",
    title: "Sign in to EasyRx",
    body: "Log in with the credentials from your invitation email.",
  },
  {
    n: "02",
    title: "Create a new case",
    body: 'Click "New Case" and select ASO Hawaii as the lab.',
  },
  {
    n: "03",
    title: "Attach your scan",
    body: "Upload STL/PLY or pull directly from your scanner.",
  },
  {
    n: "04",
    title: "Add your prescription",
    body: "Specify the appliance, materials, and any notes.",
  },
  {
    n: "05",
    title: "Review and submit",
    body: "Your case is encrypted and sent instantly.",
  },
  {
    n: "06",
    title: "Track progress",
    body: "Received → production → shipped, all in-dashboard.",
  },
];

export default function HowToSubmit() {
  return (
    <section
      id="how-to"
      className="py-20 md:py-24 bg-gray-50/60 border-y border-gray-200/60"
    >
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              How to submit
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tightest text-navy text-balance">
              Submit cases via{" "}
              <span className="italic">EasyRx</span> — under five minutes.
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              A repeatable six-step workflow your team can master on day one.
              New practices get onboarded in under a business day.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact#invitation"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Request invitation
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
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                Full guide
              </Link>
            </div>

            <div className="mt-8 hidden md:block">
              <div className="relative rounded-xl bg-white border border-gray-200 p-3 shadow-[0_12px_32px_-16px_rgba(15,41,66,0.18)]">
                <Image
                  src="/images/aso/easyrx-logo.png"
                  alt="EasyRx — connecting practices, labs, and patients"
                  width={400}
                  height={400}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: 240,
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {items.map((it) => (
              <li
                key={it.n}
                className="group flex flex-col"
              >
                <div className="font-serif italic text-5xl text-navy/15 group-hover:text-brandOrange/50 leading-none transition-colors duration-500 select-none">
                  {it.n}
                </div>
                <div className="mt-2 h-px w-8 bg-navy/20 group-hover:bg-brandOrange transition-colors duration-500" />
                <h3 className="mt-4 font-serif text-[17px] text-navy leading-snug tracking-tight">
                  {it.title}
                </h3>
                <p className="mt-1.5 text-gray-600 leading-relaxed text-[14px]">
                  {it.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
