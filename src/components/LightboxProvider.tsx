"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CatalogItem } from "@/data/product-catalog";

type LightboxCtx = {
  /** Open the lightbox at a specific items[] index. Ignored if the item
   *  has no image. */
  openAt: (index: number) => void;
  /** Open the lightbox at whichever item has this image path. If no
   *  match, opens the first imaged item. */
  openByImage: (image: string) => void;
};

const Ctx = createContext<LightboxCtx | null>(null);

export function useLightbox(): LightboxCtx {
  const c = useContext(Ctx);
  if (!c) {
    throw new Error("useLightbox must be used within <LightboxProvider>");
  }
  return c;
}

type ProviderProps = {
  items: CatalogItem[];
  children: React.ReactNode;
};

export function LightboxProvider({ items, children }: ProviderProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Only items with an image participate in navigation.
  const imaged = useMemo(
    () =>
      items
        .map((item, i) => ({ item, origIndex: i }))
        .filter(({ item }) => !!item.image),
    [items]
  );

  const openAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;
      if (!items[index].image) return;
      setOpenIndex(index);
    },
    [items]
  );

  const openByImage = useCallback(
    (image: string) => {
      const i = items.findIndex((it) => it.image === image);
      if (i >= 0) {
        setOpenIndex(i);
      } else if (imaged.length > 0) {
        setOpenIndex(imaged[0].origIndex);
      }
    },
    [items, imaged]
  );

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setOpenIndex((current) => {
        if (current === null || imaged.length === 0) return current;
        const pos = imaged.findIndex((x) => x.origIndex === current);
        if (pos === -1) return imaged[0].origIndex;
        const next = (pos + dir + imaged.length) % imaged.length;
        return imaged[next].origIndex;
      });
    },
    [imaged]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step]);

  const openItem = openIndex !== null ? items[openIndex] : null;
  const pos =
    openIndex !== null
      ? imaged.findIndex((x) => x.origIndex === openIndex)
      : -1;

  const ctxValue = useMemo<LightboxCtx>(
    () => ({ openAt, openByImage }),
    [openAt, openByImage]
  );

  return (
    <Ctx.Provider value={ctxValue}>
      {children}
      {openItem?.image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${openItem.name} — enlarged`}
          className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
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
              {imaged.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
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
                key={openItem.image}
                src={openItem.image}
                alt={openItem.name}
                className="min-w-0 max-h-[78vh] max-w-full w-auto rounded-lg shadow-2xl object-contain"
              />

              {imaged.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
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
              {openItem.code && (
                <div className="text-[11px] uppercase tracking-[0.25em] font-semibold text-brandOrange mb-1.5">
                  {openItem.code}
                </div>
              )}
              <h3 className="font-serif text-xl sm:text-2xl text-navy leading-tight">
                {openItem.name}
              </h3>
              {openItem.note && (
                <p className="mt-1.5 text-sm sm:text-[15px] text-gray-600 leading-relaxed">
                  {openItem.note}
                </p>
              )}
              {imaged.length > 1 && pos >= 0 && (
                <div className="mt-2.5 text-[11px] uppercase tracking-[0.25em] text-gray-400">
                  {pos + 1} / {imaged.length}
                </div>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </Ctx.Provider>
  );
}
