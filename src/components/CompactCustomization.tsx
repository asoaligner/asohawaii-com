"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Two color-chart thumbnails with click-to-zoom lightbox. Designed to
 * tuck into the hero column of plate-type / expansion / functional
 * appliance product pages without crowding out the catalog grid below.
 *
 * Esc key and backdrop click both close the lightbox.
 */

const CHARTS: { src: string; alt: string; label: string }[] = [
  {
    src: "/images/aso/colors/charts/traditional-glitter.jpg",
    alt: "Acrylic color chart — traditional and glitter samples",
    label: "Acrylic colors",
  },
  {
    src: "/images/aso/colors/charts/neon-stickers.jpg",
    alt: "Neon colors and sticker designs reference chart",
    label: "Neon & stickers",
  },
];

export default function CompactCustomization() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (openIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIdx(null);
    }
    window.addEventListener("keydown", onKey);
    // Lock body scroll while lightbox is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIdx]);

  const open = openIdx !== null ? CHARTS[openIdx] : null;

  return (
    <>
      <div className="mt-6 flex items-start gap-3">
        {CHARTS.map((c, i) => (
          <button
            key={c.src}
            type="button"
            onClick={() => setOpenIdx(i)}
            aria-label={`View ${c.label} chart`}
            className="group block w-28 sm:w-32 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-navy/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/50 focus-visible:ring-offset-2 transition-all"
          >
            <div className="relative aspect-[4/3] bg-gray-50">
              <Image
                src={c.src}
                alt={c.alt}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 text-white transition-opacity"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
                </svg>
              </span>
            </div>
            <div className="px-2.5 py-1.5 text-[11px] uppercase tracking-widest text-gray-500 truncate">
              {c.label}
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.alt}
          onClick={() => setOpenIdx(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setOpenIdx(null)}
            aria-label="Close enlarged chart"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-navy shadow-lg flex items-center justify-center hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/60 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4L4 12" />
            </svg>
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] w-full"
          >
            <Image
              src={open.src}
              alt={open.alt}
              width={1400}
              height={1082}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
