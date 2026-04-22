const steps = [
  {
    number: "01",
    title: "Request an invitation",
    body:
      "Fill out the quick form below. We'll verify your practice and set up your EasyRx connection — usually the same business day.",
  },
  {
    number: "02",
    title: "Check your inbox",
    body:
      "You'll receive a secure invite email from EasyRx. Click the link, set your password, and your account is live.",
  },
  {
    number: "03",
    title: "Start sending cases",
    body:
      "Submit your first case in minutes. Upload scans from any scanner, attach notes, and your case arrives instantly at ASO Hawaii.",
  },
];

export default function GettingStarted() {
  return (
    <section
      id="getting-started"
      className="py-24 md:py-32 bg-gray-50/60 border-y border-gray-200/60"
    >
      <div className="container-narrow">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
            Getting Started
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
            Three steps. That&apos;s it.
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            From first contact to sending your first case — most practices are
            up and running within a day.
          </p>
        </div>

        <ol className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {steps.map((s, i) => (
            <li
              key={s.number}
              className="relative rounded-2xl bg-white border border-gray-200 p-8"
            >
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif italic text-4xl text-brandOrange leading-none">
                  {s.number}
                </span>
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  Step
                </span>
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">
                {s.body}
              </p>

              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 z-10">
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
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
