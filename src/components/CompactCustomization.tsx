"use client";

import Image from "next/image";
import { useState } from "react";
import AcrylicColorChart from "./AcrylicColorChart";
import CustomColorOptions from "./CustomColorOptions";
import StickersGrid from "./StickersGrid";

/**
 * Compact, collapsible customization panel for plate-type / expansion /
 * functional-appliance product pages. All three accordions default to
 * closed so the catalog grid stays the page's focal point.
 */
export default function CompactCustomization() {
  const [colorOpen, setColorOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <section className="py-12 md:py-14 bg-gray-50/60 border-t border-gray-200/60">
      <div className="container-narrow">
        <div className="max-w-2xl mb-8">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
            Customization
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl leading-[1.2] tracking-tightest text-navy text-balance">
            Colors &amp; <span className="italic">stickers.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {/* COLORS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="relative w-32 sm:w-40 shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 border border-gray-200/70">
                <Image
                  src="/images/aso/colors/charts/traditional-glitter.jpg"
                  alt="ASO acrylic color sample sheet"
                  fill
                  sizes="160px"
                  className="object-cover object-center"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg sm:text-xl text-navy leading-snug tracking-tight">
                  Acrylic Color Options
                </h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-snug">
                  28 colors · 9 neon shades · custom combinations
                </p>
                <button
                  type="button"
                  onClick={() => setColorOpen((v) => !v)}
                  aria-expanded={colorOpen}
                  aria-controls="customize-colors-panel"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brandOrange hover:text-brandOrange/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 focus-visible:ring-offset-2 rounded-full px-2 -mx-2 py-1 transition-colors"
                >
                  <span aria-hidden className="text-base leading-none">
                    {colorOpen ? "−" : "+"}
                  </span>
                  {colorOpen ? "Hide colors" : "View all colors"}
                </button>
              </div>
            </div>

            {colorOpen && (
              <div
                id="customize-colors-panel"
                className="mt-6 pt-6 border-t border-gray-200/70"
              >
                <AcrylicColorChart />
                <div className="mt-10">
                  <h4 className="font-serif text-lg text-navy mb-1">
                    Custom combinations
                  </h4>
                  <p className="text-[13.5px] text-gray-600 mb-5">
                    Available on request — perfect for a signature look.
                  </p>
                  <CustomColorOptions />
                </div>
              </div>
            )}

            <div className="mt-4 text-[12px] text-gray-500">
              · Dual color · Color with glitter · Neon marble
            </div>
          </div>

          {/* STICKERS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="relative w-32 sm:w-40 shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 border border-gray-200/70">
                <Image
                  src="/images/aso/colors/charts/neon-stickers.jpg"
                  alt="ASO sticker design sample sheet"
                  fill
                  sizes="160px"
                  className="object-cover object-bottom"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg sm:text-xl text-navy leading-snug tracking-tight">
                  Add Personality with Stickers
                </h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-snug">
                  29 fun designs · multiple per retainer
                </p>
                <button
                  type="button"
                  onClick={() => setStickerOpen((v) => !v)}
                  aria-expanded={stickerOpen}
                  aria-controls="customize-stickers-panel"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brandOrange hover:text-brandOrange/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 focus-visible:ring-offset-2 rounded-full px-2 -mx-2 py-1 transition-colors"
                >
                  <span aria-hidden className="text-base leading-none">
                    {stickerOpen ? "−" : "+"}
                  </span>
                  {stickerOpen ? "Hide stickers" : "View all stickers"}
                </button>
              </div>
            </div>

            {stickerOpen && (
              <div
                id="customize-stickers-panel"
                className="mt-6 pt-6 border-t border-gray-200/70"
              >
                <StickersGrid />
              </div>
            )}

            <div className="mt-4 text-[12px] text-gray-500">
              · Animals · Sports · Vehicles · Characters
            </div>
          </div>
        </div>

        {/* IMPORTANT NOTES — accordion */}
        <div className="mt-5 lg:mt-6 rounded-xl border-l-4 border-brandOrange bg-brandOrange/[0.06]">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            aria-expanded={notesOpen}
            aria-controls="customize-notes-panel"
            className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 rounded-r-xl"
          >
            <span className="text-[13.5px] font-medium text-navy">
              <span aria-hidden className="mr-2">
                ℹ️
              </span>
              Important notes about color availability
            </span>
            <span
              aria-hidden
              className="text-brandOrange text-lg leading-none shrink-0"
            >
              {notesOpen ? "−" : "+"}
            </span>
          </button>
          {notesOpen && (
            <ul
              id="customize-notes-panel"
              className="px-5 pb-4 text-[13.5px] text-gray-700 leading-relaxed space-y-1.5 list-disc list-inside"
            >
              <li>
                Color samples may vary slightly from the final product.
              </li>
              <li>Custom combinations available upon request.</li>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
