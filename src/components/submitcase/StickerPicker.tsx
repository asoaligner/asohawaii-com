"use client";

import { useEffect, useState } from "react";
import {
  MAX_STICKERS_PER_APPLIANCE,
  STICKERS,
  STICKER_CATEGORIES,
  findSticker,
  type Sticker,
  type StickerCategory,
} from "@/data/stickers";

type Filter = StickerCategory | "all";

type Props = {
  value: number[];
  onChange: (next: number[]) => void;
  max?: number;
};

function StickerSummary({ ids }: { ids: number[] }) {
  if (ids.length === 0)
    return <span className="text-gray-400 text-[13px]">No stickers</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const s = findSticker(id);
        if (!s) return null;
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[12px]"
          >
            <span className="text-brandOrange font-semibold">#{s.id}</span>{" "}
            <span>{s.name}</span>
          </span>
        );
      })}
    </span>
  );
}

export default function StickerPicker({
  value,
  onChange,
  max = MAX_STICKERS_PER_APPLIANCE,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(value);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function toggle(id: number) {
    setDraft((d) => {
      if (d.includes(id)) return d.filter((x) => x !== id);
      if (d.length >= max) return d;
      return [...d, id];
    });
  }

  function commit() {
    onChange(draft);
    setOpen(false);
  }

  const filtered: Sticker[] =
    filter === "all"
      ? STICKERS
      : STICKERS.filter((s) => s.category === filter);

  return (
    <div>
      {/* TRIGGER */}
      {value.length > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <StickerSummary ids={value} />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[12px] font-medium text-navy hover:text-brandOrange transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              aria-label="Clear stickers"
              className="text-gray-400 hover:text-red-600 text-base leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-brandOrange border border-brandOrange/40 hover:bg-brandOrange/5 rounded-full transition-colors"
        >
          <span aria-hidden>🎟️</span>
          Choose stickers
        </button>
      )}

      {/* MODAL */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose stickers"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200">
              <div>
                <div className="font-serif text-xl text-navy">
                  Choose stickers
                </div>
                <div className="text-[12px] text-gray-500">
                  Up to {max} per appliance · {draft.length} selected
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center"
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
            </div>

            <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Filter row */}
              <div className="flex flex-wrap gap-2">
                {STICKER_CATEGORIES.map((c) => {
                  const active = c.id === filter;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFilter(c.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                        active
                          ? "bg-navy text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-navy"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Sticker grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {filtered.map((s) => {
                  const isSelected = draft.includes(s.id);
                  const atCapacity = draft.length >= max && !isSelected;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      disabled={atCapacity}
                      aria-pressed={isSelected}
                      className={`group relative rounded-xl border bg-white p-3 text-center transition-all ${
                        isSelected
                          ? "border-navy ring-2 ring-navy/20 -translate-y-0.5"
                          : atCapacity
                            ? "border-gray-100 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-navy/30 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="aspect-square rounded-full border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white mb-2 flex items-center justify-center text-[18px] font-serif italic text-brandOrange">
                        #{s.id}
                      </div>
                      <div className="text-[12.5px] text-navy leading-tight truncate">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize mt-0.5">
                        {s.category}
                      </div>
                      {isSelected && (
                        <span
                          aria-hidden
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-brandOrange text-white text-[12px] flex items-center justify-center font-medium"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12.5px] text-gray-600">
                {draft.length === 0 ? (
                  <span className="text-gray-400">No stickers selected</span>
                ) : (
                  <span>
                    Selected:{" "}
                    {draft
                      .map((id) => {
                        const s = findSticker(id);
                        return s ? `#${s.id} ${s.name}` : null;
                      })
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center px-4 py-2 text-[13px] text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={commit}
                  className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-navy-light transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
