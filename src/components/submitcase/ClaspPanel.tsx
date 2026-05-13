"use client";

/**
 * Per-clasp picker that sits to the right of the ToothChart inside a
 * Plate-Type-Retainer-style appliance details panel.
 *
 * Each card represents one of the five clasp types defined in
 * CLASP_META. Clicking a card makes that clasp "active" — tooth clicks
 * on the chart then add / remove teeth from that clasp's list instead
 * of from the generic Teeth-Involved selection. Click again to
 * deactivate.
 *
 * Ball clasp is special: it stores ordered pairs (consecutive entries
 * in the flat array form one "between A and B" pair). An odd-length
 * list means the user has placed the first endpoint and is waiting to
 * click the second; the card displays that anchor.
 *
 * Cards can be hidden individually via the × in their top-right corner
 * when the doctor knows that clasp type isn't relevant to this case.
 * Hidden cards re-appear via the footer "+ Show …" links.
 */

import { useState } from "react";
import type { Dentition } from "./types";
import {
  CLASP_META,
  type ClaspMeta,
  type ClaspSelections,
  type ClaspType,
} from "./types";
import { archDisplayOrder, compactRanges } from "./ToothChart";

interface Props {
  value: ClaspSelections;
  active: ClaspType | null;
  onActiveChange: (next: ClaspType | null) => void;
  onClear: (clasp: ClaspType) => void;
  dentition: Dentition;
  arch?: "upper" | "lower";
  /** Per-clasp option flags that don't fit the generic tooth-list model.
   *  Currently just labial_bow_with_resin_pad — others can join when
   *  needed. */
  onOptionChange?: (next: Partial<ClaspSelections>) => void;
  /** When provided, an × button appears at the top-right of the panel.
   *  Clicking it should hide the panel and (per ApplianceDetails)
   *  clear all per-clasp tooth lists — for appliances where the
   *  doctor doesn't need clasp placement. */
  onDismiss?: () => void;
}

/** Compact summary for one clasp's selection. Mirrors the tooth-chart
 *  range format ("UR7 to UL7") except ball clasp pairs render as
 *  "between UR4 and UR5, between UR6 and UR7" so the doctor can sanity-
 *  check the pairing at a glance. */
function summarizeClasp(
  meta: ClaspMeta,
  teeth: string[],
  dentition: Dentition,
  arch?: "upper" | "lower",
): string {
  if (teeth.length === 0) return "—";
  if (meta.pairMode) {
    const pairs: string[] = [];
    for (let i = 0; i + 1 < teeth.length; i += 2) {
      pairs.push(`between ${teeth[i]} and ${teeth[i + 1]}`);
    }
    if (teeth.length % 2 === 1) {
      pairs.push(`anchor ${teeth[teeth.length - 1]} (click second tooth)`);
    }
    return pairs.join(", ");
  }
  // Non-ball clasps: build the display order for whichever arch is in
  // focus (or both, for the case form where arch isn't pinned) and use
  // the same compactRanges helper the chart's bottom summary does.
  const orders =
    arch === "upper"
      ? [archDisplayOrder("U", dentition)]
      : arch === "lower"
        ? [archDisplayOrder("L", dentition)]
        : [archDisplayOrder("U", dentition), archDisplayOrder("L", dentition)];
  const parts: string[] = [];
  for (const order of orders) {
    const formatted = compactRanges(teeth, order);
    if (formatted) parts.push(formatted);
  }
  return parts.join(", ") || "—";
}

export default function ClaspPanel({
  value,
  active,
  onActiveChange,
  onClear,
  dentition,
  arch,
  onOptionChange,
  onDismiss,
}: Props) {
  // Per-card hidden state is UI-only — it doesn't survive a remount
  // and isn't serialized into form data. A hidden card clears its own
  // teeth on dismiss so the lab can't get phantom selections back.
  const [hiddenCards, setHiddenCards] = useState<Set<ClaspType>>(new Set());
  const visibleMeta = CLASP_META.filter((m) => !hiddenCards.has(m.type));
  const hiddenMeta = CLASP_META.filter((m) => hiddenCards.has(m.type));

  function hideCard(type: ClaspType) {
    setHiddenCards((prev) => new Set(prev).add(type));
    onClear(type);
    if (active === type) onActiveChange(null);
  }
  function showCard(type: ClaspType) {
    setHiddenCards((prev) => {
      const next = new Set(prev);
      next.delete(type);
      return next;
    });
  }

  return (
    <div className="grid gap-2 sm:max-w-[14rem] relative">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Hide entire clasp picker"
          title="Hide entire clasp picker (for cases that don't need any clasps)"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center text-sm leading-none shadow-sm transition-colors z-10"
        >
          ×
        </button>
      )}
      {visibleMeta.map((meta) => {
        const teeth = value[meta.type];
        const isActive = active === meta.type;
        const hasSelection = teeth.length > 0;
        const summary = summarizeClasp(meta, teeth, dentition, arch);
        return (
          <button
            key={meta.type}
            type="button"
            onClick={() => onActiveChange(isActive ? null : meta.type)}
            className={`relative text-left rounded-xl border bg-white px-3 py-2 pr-7 transition-colors ${
              isActive
                ? `border-transparent ring-2 ${meta.ringClass} bg-gray-50`
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                hideCard(meta.type);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  hideCard(meta.type);
                }
              }}
              aria-label={`Hide ${meta.label} (not used in this case)`}
              title={`Hide ${meta.label}`}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 flex items-center justify-center text-sm leading-none cursor-pointer"
            >
              ×
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${meta.dotClass}`}
                aria-hidden
              />
              <span className="text-[13px] font-medium text-navy flex-1">
                {meta.label}
              </span>
              {hasSelection && (
                <span className="text-[10.5px] uppercase tracking-widest text-gray-500">
                  {meta.pairMode
                    ? `${Math.floor(teeth.length / 2)}${
                        teeth.length % 2 === 1 ? "+½" : ""
                      }`
                    : teeth.length}
                </span>
              )}
            </div>
            <div className="mt-1 text-[11.5px] text-gray-500 leading-snug">
              {isActive ? "Click teeth on the chart →" : meta.hint}
            </div>
            <div
              className={`mt-1 text-[11.5px] leading-snug ${
                hasSelection ? "text-navy" : "text-gray-400"
              }`}
            >
              {summary}
            </div>
            {meta.type === "labial_bow" && onOptionChange && (
              <label
                onClick={(e) => e.stopPropagation()}
                className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!value.labial_bow_with_resin_pad}
                  onChange={(e) => {
                    e.stopPropagation();
                    onOptionChange({
                      labial_bow_with_resin_pad: e.target.checked,
                    });
                  }}
                  className="accent-navy"
                />
                with Resin Pad
              </label>
            )}
            {hasSelection && (
              <div className="mt-1.5 flex justify-end">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear(meta.type);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onClear(meta.type);
                    }
                  }}
                  className="text-[11px] text-gray-500 underline underline-offset-2 hover:text-red-600 cursor-pointer"
                >
                  Clear
                </span>
              </div>
            )}
          </button>
        );
      })}
      {hiddenMeta.length > 0 && (
        <div className="text-[11.5px] text-gray-500 leading-snug flex flex-wrap gap-x-2 gap-y-1 pt-1">
          <span>+ Show:</span>
          {hiddenMeta.map((meta, i) => (
            <button
              key={meta.type}
              type="button"
              onClick={() => showCard(meta.type)}
              className="text-navy hover:text-brandOrange underline underline-offset-2 transition-colors"
            >
              {meta.label}
              {i < hiddenMeta.length - 1 ? "," : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
