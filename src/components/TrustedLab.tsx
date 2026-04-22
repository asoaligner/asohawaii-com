export default function TrustedLab() {
  const stats = [
    { k: "150+", v: "Practices served" },
    { k: "HIPAA", v: "Compliant by design" },
    { k: "6", v: "Scanner integrations" },
    { k: "< 1 day", v: "Average onboarding" },
  ];

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container-narrow">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
            Trusted lab
          </div>
          <p className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.25] tracking-tight text-navy text-balance">
            ASO Hawaii is a{" "}
            <span className="italic text-brandOrange">
              trusted orthodontic lab
            </span>{" "}
            providing retainers, aligners, and appliances for dental
            professionals across Honolulu.
          </p>
        </div>

        <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 max-w-4xl mx-auto">
          {stats.map((s) => (
            <div
              key={s.v}
              className="text-center md:text-left md:border-l md:border-gray-200 md:pl-6 first:md:border-l-0 first:md:pl-0"
            >
              <dt className="text-xs uppercase tracking-widest text-gray-500">
                {s.v}
              </dt>
              <dd className="mt-2 font-serif text-3xl sm:text-4xl text-navy tracking-tight">
                {s.k}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
