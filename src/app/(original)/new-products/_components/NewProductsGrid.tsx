"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Tile = {
  name: string;
  blurb: string;
  category: "sleep" | "expander" | "retainer" | "aligner" | "other";
  image: string;
  submitSlug?: string;
  submitItem?: string;
};

type Props = {
  tiles: Tile[];
  catLabel: Record<Tile["category"], string>;
};

function submitOrderHref(t: Tile): string {
  if (!t.submitSlug) return "/submit-case";
  const params = new URLSearchParams();
  params.set("product", t.submitSlug);
  if (t.submitItem) params.set("item", t.submitItem);
  return `/submit-case?${params.toString()}`;
}

/**
 * Tile grid + click-to-enlarge lightbox for the New Products page.
 *
 * Mirrors the keyboard / overflow / arrow-navigation UX of the
 * product-detail Lightbox: Escape closes, ArrowLeft / ArrowRight
 * cycles through tiles, body scroll is locked while open.
 */
export default function NewProductsGrid({
  tiles,
  catLabel,
}: Props) {
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      else if (e.key === "ArrowLeft")
        setZoom((i) =>
          i === null ? null : (i - 1 + tiles.length) % tiles.length
        );
      else if (e.key === "ArrowRight")
        setZoom((i) => (i === null ? null : (i + 1) % tiles.length));
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom, tiles.length]);

  const open = zoom !== null ? tiles[zoom] : null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((t, i) => (
          <div
            key={t.name}
            className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-navy/30 hover:shadow-[0_12px_40px_-12px_rgba(15,41,66,0.15)] transition-all flex flex-col"
          >
            <button
              type="button"
              onClick={() => setZoom(i)}
              aria-label={`Enlarge ${t.name}`}
              className="relative aspect-[4/3] bg-gray-50 overflow-hidden block focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/50"
            >
              <Image
                src={t.image}
                alt={t.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-medium bg-white/90 backdrop-blur-sm text-navy px-2.5 py-1 rounded-full">
                  {catLabel[t.category]}
                </span>
              </div>
              <span
                aria-hidden
                className="absolute bottom-3 right-3 inline-flex w-9 h-9 items-center justify-center rounded-full bg-white/90 text-navy opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <svg
                  className="w-4 h-4"
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
            </button>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
                {t.name}
              </h3>
              <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed flex-grow">
                {t.blurb}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={submitOrderHref(t)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium bg-navy text-white px-4 py-2 rounded-full hover:bg-navy-light transition-colors"
                >
                  Submit order
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
                  href="/get-a-quote"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors"
                >
                  Request quote →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && zoom !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${open.name} — enlarged`}
          className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(null);
            }}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-navy shadow-lg flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <figure
            className="flex flex-col items-center gap-4 sm:gap-5 max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-4 max-w-full">
              {tiles.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom(
                      (i) =>
                        i === null
                          ? null
                          : (i - 1 + tiles.length) % tiles.length
                    );
                  }}
                  aria-label="Previous"
                  className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 hover:bg-white text-navy shadow-xl ring-1 ring-black/10 flex items-center justify-center transition-transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={open.image}
                src={open.image}
                alt={open.name}
                className="min-w-0 max-h-[78vh] max-w-full w-auto rounded-lg shadow-2xl object-contain"
              />
              {tiles.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((i) =>
                      i === null ? null : (i + 1) % tiles.length
                    );
                  }}
                  aria-label="Next"
                  className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 hover:bg-white text-navy shadow-xl ring-1 ring-black/10 flex items-center justify-center transition-transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>
            <figcaption className="text-center px-6 sm:px-8 py-4 sm:py-5 bg-white/95 rounded-2xl shadow-lg max-w-2xl">
              <h3 className="font-serif text-xl sm:text-2xl text-navy leading-tight">
                {open.name}
              </h3>
              <p className="mt-1.5 text-sm sm:text-[15px] text-gray-600 leading-relaxed">
                {open.blurb}
              </p>
              {tiles.length > 1 && (
                <div className="mt-2.5 text-[11px] uppercase tracking-[0.25em] text-gray-400">
                  {zoom + 1} / {tiles.length}
                </div>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
