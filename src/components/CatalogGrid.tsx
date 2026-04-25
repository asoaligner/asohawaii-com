"use client";

import Link from "next/link";
import type { CatalogItem } from "@/data/product-catalog";
import { useLightbox } from "@/components/LightboxProvider";

type Props = {
  items: CatalogItem[];
  /** When true, use object-contain + white backdrop for items whose
   *  source image is a bare render/logo that would crop awkwardly. */
  containCards?: boolean;
  /** Parent product slug — used to deep-link "Submit Case" CTAs to
   *  /submit-case/?product=<slug>&item=<code>. When undefined, the
   *  per-item CTA falls back to a category-level link. */
  productSlug?: string;
};

export default function CatalogGrid({
  items,
  containCards = false,
  productSlug,
}: Props) {
  const { openAt } = useLightbox();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {items.map((item, i) => {
        const key = `${item.code ?? ""}-${item.name}-${i}`;
        const submitHref = (() => {
          const params = new URLSearchParams();
          if (productSlug) params.set("product", productSlug);
          if (item.code) params.set("item", item.code);
          const qs = params.toString();
          return qs ? `/submit-case/?${qs}` : "/submit-case/";
        })();
        return (
          <div
            key={key}
            className="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:border-navy/30 hover:shadow-[0_10px_30px_-10px_rgba(15,41,66,0.18)] transition-all flex flex-col"
          >
            {item.image ? (
              <button
                type="button"
                onClick={() => openAt(i)}
                aria-label={`Enlarge ${item.name}`}
                className={`relative aspect-[4/3] overflow-hidden block w-full text-left cursor-zoom-in ${
                  containCards ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-[1.04] ${
                    containCards ? "object-contain p-3" : "object-cover"
                  }`}
                />
                {item.code && (
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center text-[10px] tracking-widest font-semibold font-serif italic bg-white/95 backdrop-blur-sm text-brandOrange px-2 py-0.5 rounded-full">
                    {item.code}
                  </span>
                )}
              </button>
            ) : (
              <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center text-gray-300">
                <svg
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M21 17l-5-5-7 7" />
                </svg>
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-serif text-[15px] text-navy leading-snug tracking-tight">
                {item.name}
              </h3>
              {item.note && (
                <p className="mt-1.5 text-[12.5px] text-gray-500 leading-relaxed">
                  {item.note}
                </p>
              )}
              <Link
                href={submitHref}
                className="mt-3 inline-flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-brandOrange border border-brandOrange/30 hover:bg-brandOrange hover:text-white rounded-full px-3 py-1.5 transition-colors w-fit"
              >
                Submit case
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
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
