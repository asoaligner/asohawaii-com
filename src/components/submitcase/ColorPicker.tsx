"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ALL_COLORS,
  COLOR_CHART_IMAGES,
  CUSTOMIZATION_OPTIONS,
  GLITTER_COLORS,
  NEON_COLORS,
  TRADITIONAL_COLORS,
  findColor,
  type ColorOption,
  type CustomizationOption,
  type CustomizationType,
} from "@/data/colors";
import type { ColorChoice } from "./types";

type Tab = "traditional" | "glitter" | "neon";

const COLORS_BY_TAB: Record<Tab, ColorOption[]> = {
  traditional: TRADITIONAL_COLORS,
  glitter: GLITTER_COLORS,
  neon: NEON_COLORS,
};

const TAB_LIST: { id: Tab; label: string; count: number }[] = [
  { id: "traditional", label: "Traditional", count: TRADITIONAL_COLORS.length },
  { id: "glitter", label: "Glitter", count: GLITTER_COLORS.length },
  { id: "neon", label: "Neon", count: NEON_COLORS.length },
];

type Props = {
  /** Currently committed value (drives the inline summary chip). */
  value?: ColorChoice;
  /** Called when the user clicks Confirm. Pass `undefined` to clear. */
  onChange: (next: ColorChoice | undefined) => void;
  /** Render the trigger button label. */
  label?: string;
};

function ColorChip({
  color,
  size = "md",
}: {
  color: ColorOption;
  size?: "sm" | "md";
}) {
  const px = size === "sm" ? 22 : 28;
  // Prefer the real swatch photo when present; fall back to a hex chip.
  if (color.imagePath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={color.imagePath}
        alt={`#${color.id} ${color.name}`}
        className="inline-block rounded-md object-cover border border-gray-300/80"
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <span
      className="inline-block rounded-full border border-gray-300/80"
      style={{
        width: px,
        height: px,
        background:
          color.id === 20
            ? "repeating-linear-gradient(45deg, #fff, #fff 4px, #f3f4f6 4px, #f3f4f6 8px)"
            : color.hex,
      }}
      aria-hidden
    />
  );
}

function ColorSummaryChip({ choice }: { choice: ColorChoice }) {
  const finish = CUSTOMIZATION_OPTIONS.find((o) => o.id === choice.type);
  const ids = [choice.primary, choice.secondary, choice.tertiary].filter(
    (v): v is number => typeof v === "number"
  );
  const colors = ids
    .map((id) => findColor(id))
    .filter((c): c is ColorOption => !!c);
  if (colors.length === 0)
    return <span className="text-gray-400">No colour</span>;
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-navy">
      <span className="inline-flex -space-x-1">
        {colors.map((c) => (
          <ColorChip key={c.id} color={c} size="sm" />
        ))}
      </span>
      <span className="text-[12px] text-gray-600">
        {colors.map((c) => `#${c.id} ${c.name}`).join(" / ")}
        {finish && finish.id !== "solid" ? ` · ${finish.label}` : ""}
      </span>
    </span>
  );
}

export default function ColorPicker({
  value,
  onChange,
  label = "Choose color",
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("traditional");
  const [draft, setDraft] = useState<ColorChoice>(
    value ?? { type: "solid", primary: undefined }
  );
  const [refOpen, setRefOpen] = useState(false);

  // Resync draft whenever the picker opens — so users always see the
  // committed value, not stale local edits from a previous open.
  useEffect(() => {
    if (open) {
      setDraft(value ?? { type: "solid", primary: undefined });
    }
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

  const finish: CustomizationOption =
    CUSTOMIZATION_OPTIONS.find((o) => o.id === draft.type) ??
    CUSTOMIZATION_OPTIONS[0];

  function pickColor(id: number) {
    setDraft((d) => {
      // Toggle off if user clicks the only-currently-selected slot.
      if (
        d.primary === id &&
        d.secondary === undefined &&
        d.tertiary === undefined
      ) {
        return { ...d, primary: undefined };
      }
      // Fill the next empty slot up to maxColors, otherwise replace
      // the last slot.
      if (d.primary === undefined) return { ...d, primary: id };
      if (finish.maxColors >= 2 && d.secondary === undefined)
        return { ...d, secondary: id };
      if (finish.maxColors >= 3 && d.tertiary === undefined)
        return { ...d, tertiary: id };
      // Otherwise replace the last filled slot.
      if (finish.maxColors === 1) return { ...d, primary: id };
      if (finish.maxColors === 2) return { ...d, secondary: id };
      return { ...d, tertiary: id };
    });
  }

  function clearSlots() {
    setDraft({ type: draft.type, primary: undefined });
  }

  function changeFinish(next: CustomizationType) {
    setDraft((d) => {
      const m = CUSTOMIZATION_OPTIONS.find((o) => o.id === next)!.maxColors;
      // Trim slots beyond the new max.
      return {
        type: next,
        primary: d.primary,
        secondary: m >= 2 ? d.secondary : undefined,
        tertiary: m >= 3 ? d.tertiary : undefined,
      };
    });
  }

  function commit() {
    if (draft.primary === undefined) {
      onChange(undefined);
    } else {
      onChange(draft);
    }
    setOpen(false);
  }

  const slots = [draft.primary, draft.secondary, draft.tertiary]
    .slice(0, finish.maxColors)
    .map((id) => (id !== undefined ? findColor(id) : undefined));

  return (
    <div>
      {/* TRIGGER */}
      {value?.primary !== undefined ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <ColorSummaryChip choice={value} />
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
              onClick={() => onChange(undefined)}
              aria-label="Clear color"
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
          <span aria-hidden>🎨</span>
          {label}
        </button>
      )}

      {/* MODAL */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose color"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[90dvh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200">
              <div className="font-serif text-xl text-navy">Choose color</div>
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

            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Finish selector */}
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Customization
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CUSTOMIZATION_OPTIONS.map((opt) => {
                    const checked = draft.type === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => changeFinish(opt.id)}
                        className={`text-left rounded-xl border px-3 py-2 transition-colors ${
                          checked
                            ? "border-navy bg-navy/[0.03]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-[13px] font-medium text-navy">
                          {opt.label}
                        </div>
                        <div className="text-[11.5px] text-gray-500 leading-snug mt-0.5">
                          {opt.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected slots */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/40 px-4 py-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] uppercase tracking-widest text-gray-500">
                      Selected
                    </span>
                    {slots.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[12px]"
                      >
                        {c ? (
                          <>
                            <ColorChip color={c} size="sm" />
                            <span>
                              #{c.id} {c.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">
                            slot {i + 1} empty
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  {draft.primary !== undefined && (
                    <button
                      type="button"
                      onClick={clearSlots}
                      className="text-[12px] text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {TAB_LIST.map((t) => {
                  const active = t.id === tab;
                  // Highlight Neon tab when neon_marble finish is selected.
                  const recommended =
                    draft.type === "neon_marble" && t.id === "neon";
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${
                        active
                          ? "bg-navy text-white"
                          : recommended
                            ? "bg-brandOrange/10 text-brandOrange border border-brandOrange/30"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-navy"
                      }`}
                    >
                      {t.label}
                      <span
                        className={`text-[10.5px] px-1.5 py-0.5 rounded-full ${
                          active
                            ? "bg-white/15 text-white/85"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.count}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setRefOpen(true)}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-navy border border-gray-200 hover:border-navy rounded-full transition-colors"
                >
                  📋 View reference chart
                </button>
              </div>

              {/* Color grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {COLORS_BY_TAB[tab].map((c) => {
                  const isSelected =
                    draft.primary === c.id ||
                    draft.secondary === c.id ||
                    draft.tertiary === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pickColor(c.id)}
                      aria-pressed={isSelected}
                      className={`group relative rounded-xl border bg-white p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-navy ring-2 ring-navy/20 -translate-y-0.5"
                          : "border-gray-200 hover:border-navy/30 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="relative aspect-[4/3] rounded-lg border border-gray-200/70 mb-1.5 overflow-hidden bg-gray-50">
                        {c.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.imagePath}
                            alt={`#${c.id} ${c.name}`}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="absolute inset-0"
                            style={{
                              background:
                                c.id === 20
                                  ? "repeating-linear-gradient(45deg, #fff, #fff 6px, #f3f4f6 6px, #f3f4f6 12px)"
                                  : c.hex,
                            }}
                          />
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-brandOrange font-semibold">
                        #{c.id}
                      </div>
                      <div className="text-[12.5px] text-navy leading-tight truncate">
                        {c.name}
                      </div>
                      {isSelected && (
                        <span
                          aria-hidden
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-end gap-3">
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

          {/* Reference chart lightbox */}
          {refOpen && (
            <div
              role="dialog"
              aria-modal="true"
              className="absolute inset-0 z-10 bg-black/85 flex items-center justify-center p-4"
              onClick={() => setRefOpen(false)}
            >
              <button
                type="button"
                onClick={() => setRefOpen(false)}
                aria-label="Close reference chart"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-navy shadow-lg flex items-center justify-center"
              >
                ×
              </button>
              <Image
                src={
                  tab === "neon"
                    ? COLOR_CHART_IMAGES.neonStickers
                    : COLOR_CHART_IMAGES.traditionalGlitter
                }
                alt="ASO color reference chart"
                width={1400}
                height={1082}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="max-w-full max-h-[88vh] object-contain rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export so callers can read the all-colours list without a second import.
export { ALL_COLORS };
