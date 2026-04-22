const benefits = [
  {
    title: "Nothing gets lost.",
    body:
      "Every case, scan, and note lives in one secure thread — traceable from submission through delivery. No lost faxes. No missing attachments.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M4 6h16v12H4z" />
        <path d="M4 10h16M9 14h6" />
      </svg>
    ),
  },
  {
    title: "HIPAA compliant by design.",
    body:
      "End-to-end encrypted transmission, role-based access, and a full audit trail. Your patient data stays protected at every step.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Full case history at a glance.",
    body:
      "Every prescription, scan, and communication on a single timeline. Review past cases, reorder retainers, and clone submissions in seconds.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
];

export default function WhyEasyRx() {
  return (
    <section id="why" className="py-24 md:py-32 bg-white">
      <div className="container-narrow">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
            Why EasyRx
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
            Built for how modern orthodontic practices{" "}
            <span className="italic">actually</span> work.
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            No more chasing paperwork, no more lost scans. Submit every case
            with confidence.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group relative rounded-2xl border border-gray-200 bg-white p-8 hover:border-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(15,41,66,0.12)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-6 group-hover:bg-navy group-hover:text-white transition-colors duration-300">
                {b.icon}
              </div>
              <h3 className="font-serif text-2xl text-navy tracking-tight leading-snug">
                {b.title}
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
