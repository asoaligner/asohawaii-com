import Link from "next/link";

export default function ConsultationBand() {
  return (
    <section className="relative bg-navy overflow-hidden py-16 md:py-20">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #F97316 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)",
        }}
      />
      <div className="container-narrow relative">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
            Consultation about our products
          </div>
          <p className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.2] tracking-tight text-balance">
            We are happy to explain how our orthodontic appliances can support
            your treatment.{" "}
            <span className="italic text-brandOrange">
              Please feel free to contact us.
            </span>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brandOrange text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors"
            >
              Contact us
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
              href="tel:8089570111"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/25 px-6 py-3.5 rounded-full text-sm font-medium hover:bg-white/5 hover:border-white/50 transition-colors"
            >
              808-957-0111
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
