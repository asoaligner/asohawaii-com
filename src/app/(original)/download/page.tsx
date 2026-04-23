import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download · ASO Hawaii — Forms & guides",
  description:
    "Download order forms, submission guides, and reference documents from ASO International Hawaii.",
};

const files = [
  {
    name: "Prescription Form (Rx)",
    desc:
      "General prescription / order form for ASO Hawaii appliances — retainers, splints, expanders, and custom orthodontic work. Fill out and include with stone-model submissions.",
    href: "/pdf/aso-hawaii-order-form.pdf",
    filename: "aso-hawaii-order-form.pdf",
    size: "167 KB",
  },
  {
    name: "ASO ALIGNER Prescription Form",
    desc:
      "Clear-aligner-specific order sheet for ASO ALIGNER treatment planning. Captures staging, material, and attachment preferences.",
    href: "/pdf/aso-aligner-order-form.pdf",
    filename: "aso-aligner-order-form.pdf",
    size: "221 KB",
  },
  {
    name: "Product Catalog",
    desc:
      "Complete ASO International product catalog — every appliance line we fabricate, with specifications, material options, and configuration codes.",
    href: "/pdf/aso-general-catalog.pdf",
    filename: "aso-general-catalog.pdf",
    size: "6.7 MB",
  },
];

export default function DownloadPage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Resources
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Downloads &amp;{" "}
              <span className="italic text-brandOrange">reference docs.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Order forms, submission instructions, and scanner setup guides —
              all as PDFs. Print what you need; attach to case submissions as
              required.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {files.map((f, i) => (
              <div
                key={f.name}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all flex flex-col"
              >
                {/* Inline PDF preview — browser renders page 1 natively. */}
                <a
                  href={f.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[3/4] bg-gray-50 border-b border-gray-100 overflow-hidden"
                >
                  <iframe
                    src={`${f.href}#toolbar=0&navpanes=0&view=FitH`}
                    title={`${f.name} preview`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold bg-brandOrange/90 text-white px-2 py-1 rounded-full">
                    PDF
                  </span>
                  <span className="absolute top-3 right-3 font-serif italic text-brandOrange bg-white/95 px-2 py-0.5 rounded-full text-sm leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[11px] font-medium bg-white/95 text-navy px-2.5 py-1 rounded-full shadow-sm">
                    Open full
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </span>
                </a>
                <div className="p-7 flex flex-col flex-grow">
                  <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                    {f.name}
                  </h3>
                  <p className="mt-3 text-[14.5px] text-gray-600 leading-relaxed flex-grow">
                    {f.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400">
                    <span>PDF</span>
                    <span aria-hidden>·</span>
                    <span>{f.size}</span>
                  </div>
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={f.filename}
                    className="mt-6 inline-flex items-center justify-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 2v9M4 7l4 4 4-4M3 13h10" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl bg-gray-50/60 border border-gray-200 p-8 md:p-10 text-center max-w-3xl mx-auto">
            <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
              Looking for something specific? Drop us a line and we&apos;ll get
              the right document to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Contact us
              </Link>
              <a
                href="mailto:asohawaii@hotmail.com"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
              >
                asohawaii@hotmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
