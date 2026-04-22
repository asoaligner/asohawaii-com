import Image from "next/image";
import Link from "next/link";

type Scanner = {
  name: string;
  maker: string;
  src: string;
  pdf?: string;
};

const scanners: Scanner[] = [
  {
    name: "3Shape TRIOS",
    maker: "3Shape",
    src: "/images/aso/scanner-3shape.png",
  },
  {
    name: "iTero",
    maker: "Align Technology",
    src: "/images/aso/scanner-itero.jpg",
    pdf: "/pdf/ASO_iTero_EasyRx_Setup_Guide.pdf",
  },
  {
    name: "Medit Link",
    maker: "Medit",
    src: "/images/aso/scanner-medit.png",
  },
  {
    name: "Shining 3D",
    maker: "Aoralscan / IntraOral",
    src: "/images/aso/scanner-shining3d.jpg",
  },
  {
    name: "Primescan",
    maker: "Dentsply Sirona",
    src: "/images/aso/scanner-primescan.png",
  },
  {
    name: "DEXIS",
    maker: "DEXIS IS 3800 / 3800W",
    src: "/images/aso/scanner-dexis.jpg",
  },
];

export default function ScannerCards() {
  return (
    <section
      id="scanners"
      className="py-24 md:py-32 bg-gray-50/60 border-y border-gray-200/60"
    >
      <div className="container-narrow">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
            Supported platforms
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
            We accept scan submissions from{" "}
            <span className="italic">every major platform.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
            Export an STL/PLY and we handle the rest.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {scanners.map((s) => (
            <div
              key={s.name}
              className="group rounded-2xl bg-white border border-gray-200 overflow-hidden hover:border-navy/30 hover:shadow-[0_8px_24px_-8px_rgba(15,41,66,0.15)] transition-all flex flex-col"
            >
              <div className="relative h-28 flex items-center justify-center p-5 bg-gradient-to-b from-white to-gray-50/60">
                <Image
                  src={s.src}
                  alt={`${s.name} scanner`}
                  width={240}
                  height={120}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="font-serif text-[15px] text-navy leading-tight">
                  {s.name}
                </div>
                <div className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">
                  {s.maker}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-sm text-gray-500">
            3Shape TRIOS also supported via EasyRx or email.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/how-to-order#scanner-guides"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brandOrange hover:bg-[#EA6A0E] text-white font-semibold transition-colors"
          >
            View Setup Guides
            <svg
              className="w-4 h-4"
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
        </div>
      </div>
    </section>
  );
}
