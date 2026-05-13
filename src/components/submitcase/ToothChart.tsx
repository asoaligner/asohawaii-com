"use client";

import { useState } from "react";
import type { Dentition, ToothSelection } from "./types";

/**
 * Interactive tooth chart with permanent / mixed / primary dentition
 * support. Each tooth ID encodes its quadrant and position:
 *   - Quadrant: UR (upper-right), UL (upper-left), LR, LL
 *   - Permanent positions: 1 (central incisor) → 8 (3rd molar)
 *   - Primary positions: A (central incisor) → E (2nd primary molar)
 *
 * Mixed dentition shows perm 1,2,6,7,8 + primary C,D,E per quadrant
 * (the typical 6–12 year-old layout).
 */

type Quadrant = "UR" | "UL" | "LR" | "LL";

type ToothDef = {
  id: string;
  /** Display label inside the tooth (e.g. "1", "C"). */
  label: string;
  /** "incisor" | "canine" | "premolar" | "molar" | "primary". Drives the shape. */
  kind: "incisor" | "canine" | "premolar" | "molar" | "primary";
};

type Quadrants = {
  UR: ToothDef[];
  UL: ToothDef[];
  LR: ToothDef[];
  LL: ToothDef[];
};

function makeQuadrant(prefix: Quadrant, dent: Dentition): ToothDef[] {
  if (dent === "permanent") {
    // Order: 1 (centre) → 8 (back). Rendered with 1 closest to midline.
    return [
      { id: `${prefix}1`, label: "1", kind: "incisor" },
      { id: `${prefix}2`, label: "2", kind: "incisor" },
      { id: `${prefix}3`, label: "3", kind: "canine" },
      { id: `${prefix}4`, label: "4", kind: "premolar" },
      { id: `${prefix}5`, label: "5", kind: "premolar" },
      { id: `${prefix}6`, label: "6", kind: "molar" },
      { id: `${prefix}7`, label: "7", kind: "molar" },
      { id: `${prefix}8`, label: "8", kind: "molar" },
    ];
  }
  if (dent === "primary") {
    // 5 teeth per quadrant: A → E (centre to back).
    return [
      { id: `${prefix}A`, label: "A", kind: "primary" },
      { id: `${prefix}B`, label: "B", kind: "primary" },
      { id: `${prefix}C`, label: "C", kind: "primary" },
      { id: `${prefix}D`, label: "D", kind: "primary" },
      { id: `${prefix}E`, label: "E", kind: "primary" },
    ];
  }
  // Mixed: perm 1, 2 + primary C, D, E + perm 6, 7, 8 (8 teeth per quadrant).
  return [
    { id: `${prefix}1`, label: "1", kind: "incisor" },
    { id: `${prefix}2`, label: "2", kind: "incisor" },
    { id: `${prefix}C`, label: "C", kind: "primary" },
    { id: `${prefix}D`, label: "D", kind: "primary" },
    { id: `${prefix}E`, label: "E", kind: "primary" },
    { id: `${prefix}6`, label: "6", kind: "molar" },
    { id: `${prefix}7`, label: "7", kind: "molar" },
    { id: `${prefix}8`, label: "8", kind: "molar" },
  ];
}

function buildQuadrants(dent: Dentition): Quadrants {
  return {
    UR: makeQuadrant("UR", dent),
    UL: makeQuadrant("UL", dent),
    LR: makeQuadrant("LR", dent),
    LL: makeQuadrant("LL", dent),
  };
}

// Tooth dimensions by kind. Width drives column size; height drives crown
// length (taller = more "anterior"). Crown points down for upper teeth and
// up for lower teeth — that flip is handled via SVG transform per row.
// Dimensions reduced again — fourth round of UX feedback. Per Koji,
// the chart is now used as an "acrylic coverage area" indicator on
// Plate-Type and similar appliances, NOT a precision per-tooth picker.
// Combined with Range being the default mode, the doctor mostly clicks
// 2 endpoints to mark a span (e.g. R7 → L7 for full-arch coverage),
// so the tooth boxes can be quite small. Widths are ~half of the
// previous (45% → ~22% of original); heights stay reasonable so the
// numeric labels are still readable.
const KIND_DIMS: Record<
  ToothDef["kind"],
  { w: number; h: number; rx: number }
> = {
  incisor: { w: 8, h: 13, rx: 2 },
  canine: { w: 8, h: 14, rx: 2 },
  premolar: { w: 9, h: 12, rx: 2 },
  molar: { w: 10, h: 12, rx: 2 },
  primary: { w: 7, h: 10, rx: 2 },
};

const TOOTH_GAP = 1;
const ROW_PADDING_X = 8;
const MIDLINE_GAP = 6;
const ROW_HEIGHT = 20;

function rowWidth(quad: ToothDef[]): number {
  return quad.reduce(
    (acc, t, i) => acc + KIND_DIMS[t.kind].w + (i > 0 ? TOOTH_GAP : 0),
    0
  );
}

type Mode = "add" | "remove" | "range";

type Props = {
  value: ToothSelection;
  onChange: (next: ToothSelection) => void;
  /** When set, only this arch row is rendered (and the selection
   *  summary suppresses the other line). Used by ApplianceDetails so
   *  an upper-arch retainer panel doesn't show lower teeth and vice
   *  versa. Defaults to both arches. */
  arch?: "upper" | "lower";
};

/** Display order for one arch — left-to-right as the chart renders:
 *  right quadrant positions reversed (8→1 / E→A so molars sit on the
 *  outside) then left quadrant in normal order (1→8 / A→E). Exported
 *  for ReviewSummary to share the compact-range format. */
export function archDisplayOrder(
  archLetter: "U" | "L",
  dent: Dentition,
): string[] {
  const rPrefix = (archLetter + "R") as Quadrant;
  const lPrefix = (archLetter + "L") as Quadrant;
  const rightPositions = makeQuadrant(rPrefix, dent).map((t) => t.label);
  const leftPositions = makeQuadrant(lPrefix, dent).map((t) => t.label);
  return [
    ...rightPositions
      .slice()
      .reverse()
      .map((p) => `${rPrefix}${p}`),
    ...leftPositions.map((p) => `${lPrefix}${p}`),
  ];
}

/** Compact contiguous-run formatter: ["UR7","UR6",...,"UL7"] →
 *  "UR7 to UL7". Disjoint runs become "UR7 to UR5, UL3 to UL5".
 *  Single-tooth runs render as themselves. Empty input → "". Exported
 *  alongside archDisplayOrder for ReviewSummary. */
export function compactRanges(
  selectedIds: string[],
  displayOrder: string[],
): string {
  const sel = new Set(selectedIds);
  const runs: string[][] = [];
  let current: string[] = [];
  for (const id of displayOrder) {
    if (sel.has(id)) {
      current.push(id);
    } else if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length > 0) runs.push(current);
  return runs
    .map((r) =>
      r.length === 1 ? r[0] : `${r[0]} to ${r[r.length - 1]}`,
    )
    .join(", ");
}

export default function ToothChart({ value, onChange, arch }: Props) {
  // Default to "range" so the common case of marking a span of adjacent
  // teeth (e.g. UR2–UL2 for an anterior retainer) is one click less than
  // before. Add / remove stay available.
  const [mode, setMode] = useState<Mode>("range");
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);

  const showUpper = arch !== "lower";
  const showLower = arch !== "upper";

  const quads = buildQuadrants(value.dentition);

  // Shared geometry for the SVG: figure out the row width using whichever
  // arch row is widest (UR+UL, LR+LL — for symmetric layouts they're equal).
  const upperRowWidth =
    rowWidth(quads.UR) + rowWidth(quads.UL) + MIDLINE_GAP;
  const lowerRowWidth =
    rowWidth(quads.LR) + rowWidth(quads.LL) + MIDLINE_GAP;
  const archWidth = Math.max(upperRowWidth, lowerRowWidth);
  const svgW = archWidth + ROW_PADDING_X * 2;
  // Vertical band per visible arch (row + arch label). When only one
  // arch is shown the chart's height collapses to ~half.
  const visibleArches = (showUpper ? 1 : 0) + (showLower ? 1 : 0);
  const svgH = visibleArches === 2 ? ROW_HEIGHT * 2 + 36 : ROW_HEIGHT + 18;

  const upperSelected = new Set(value.upper);
  const lowerSelected = new Set(value.lower);

  function setSelection(next: { upper: string[]; lower: string[] }) {
    onChange({ ...value, upper: next.upper, lower: next.lower });
  }

  function setDentition(d: Dentition) {
    // Switching dentitions clears selections (different IDs).
    onChange({ dentition: d, upper: [], lower: [] });
    setRangeAnchor(null);
  }

  function isUpperId(id: string) {
    return id.startsWith("UR") || id.startsWith("UL");
  }

  function teethBetween(
    a: string,
    b: string
  ): { upper: string[]; lower: string[] } {
    // Build a single ordered list of all teeth in display order so we can
    // pick the slice between two clicks.
    const ordered: string[] = [
      ...quads.UR.slice().reverse().map((t) => t.id),
      ...quads.UL.map((t) => t.id),
      ...quads.LR.slice().reverse().map((t) => t.id),
      ...quads.LL.map((t) => t.id),
    ];
    const ai = ordered.indexOf(a);
    const bi = ordered.indexOf(b);
    if (ai < 0 || bi < 0) return { upper: [], lower: [] };
    const [lo, hi] = ai < bi ? [ai, bi] : [bi, ai];
    const slice = ordered.slice(lo, hi + 1);
    return {
      upper: slice.filter(isUpperId),
      lower: slice.filter((id) => !isUpperId(id)),
    };
  }

  function clickTooth(id: string) {
    const wasSelected = isUpperId(id)
      ? upperSelected.has(id)
      : lowerSelected.has(id);

    if (mode === "range") {
      if (!rangeAnchor) {
        setRangeAnchor(id);
        return;
      }
      const { upper: uAdd, lower: lAdd } = teethBetween(rangeAnchor, id);
      const newUpper = new Set(value.upper);
      const newLower = new Set(value.lower);
      uAdd.forEach((t) => newUpper.add(t));
      lAdd.forEach((t) => newLower.add(t));
      setSelection({
        upper: Array.from(newUpper),
        lower: Array.from(newLower),
      });
      setRangeAnchor(null);
      return;
    }

    if (mode === "remove" || (mode === "add" && wasSelected)) {
      // Remove
      const newUpper = new Set(value.upper);
      const newLower = new Set(value.lower);
      newUpper.delete(id);
      newLower.delete(id);
      setSelection({
        upper: Array.from(newUpper),
        lower: Array.from(newLower),
      });
    } else {
      // Add
      const newUpper = new Set(value.upper);
      const newLower = new Set(value.lower);
      if (isUpperId(id)) newUpper.add(id);
      else newLower.add(id);
      setSelection({
        upper: Array.from(newUpper),
        lower: Array.from(newLower),
      });
    }
  }

  function selectAll(arch: "upper" | "lower" | "both") {
    const upper =
      arch === "lower"
        ? value.upper
        : [...quads.UR.map((t) => t.id), ...quads.UL.map((t) => t.id)];
    const lower =
      arch === "upper"
        ? value.lower
        : [...quads.LR.map((t) => t.id), ...quads.LL.map((t) => t.id)];
    setSelection({ upper, lower });
  }

  function clearArch(arch: "upper" | "lower" | "all") {
    if (arch === "all") setSelection({ upper: [], lower: [] });
    else if (arch === "upper")
      setSelection({ upper: [], lower: value.lower });
    else setSelection({ upper: value.upper, lower: [] });
    setRangeAnchor(null);
  }

  // Render a single row of teeth (one arch). `flip` flips crown direction
  // so upper teeth point down and lower teeth point up.
  function renderRow(
    rightQuad: ToothDef[],
    leftQuad: ToothDef[],
    flip: boolean,
    yTop: number,
    selectedSet: Set<string>
  ) {
    // Right quadrant renders mirrored — far molar at the outside (left on
    // screen) and incisor at the midline (right of right-side row).
    const elements: JSX.Element[] = [];
    const total = rowWidth(rightQuad) + rowWidth(leftQuad) + MIDLINE_GAP;
    const startX = ROW_PADDING_X + (archWidth - total) / 2;
    let x = startX;

    // Right side teeth: index 7 → 0 means molar first (back), incisor last (front)
    const rightOrdered = rightQuad.slice().reverse();
    rightOrdered.forEach((t) => {
      elements.push(
        renderTooth(t, x, yTop, flip, selectedSet, "right")
      );
      x += KIND_DIMS[t.kind].w + TOOTH_GAP;
    });

    // Midline divider
    elements.push(
      <line
        key="midline"
        x1={x + (MIDLINE_GAP - TOOTH_GAP) / 2}
        x2={x + (MIDLINE_GAP - TOOTH_GAP) / 2}
        y1={yTop - 2}
        y2={yTop + ROW_HEIGHT - 8}
        stroke="#9CA3AF"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    );
    x += MIDLINE_GAP;

    leftQuad.forEach((t) => {
      elements.push(renderTooth(t, x, yTop, flip, selectedSet, "left"));
      x += KIND_DIMS[t.kind].w + TOOTH_GAP;
    });

    return elements;
  }

  function renderTooth(
    t: ToothDef,
    x: number,
    yTop: number,
    flip: boolean,
    selectedSet: Set<string>,
    side: "left" | "right"
  ) {
    const dim = KIND_DIMS[t.kind];
    const isSelected = selectedSet.has(t.id);
    const isAnchor = rangeAnchor === t.id;
    const fill = isSelected
      ? "#F97316"
      : isAnchor
        ? "#FED7AA"
        : "#FFFFFF";
    const stroke = isSelected
      ? "#EA580C"
      : isAnchor
        ? "#F97316"
        : "#9CA3AF";
    const strokeW = isSelected || isAnchor ? 1.75 : 1;
    const textColor = isSelected ? "#FFFFFF" : "#374151";
    // Crown alignment: upper teeth render with flat side at top of slot;
    // lower teeth render flipped so flat side is at the bottom.
    const y = flip ? yTop + (ROW_HEIGHT - dim.h) : yTop;
    const transform = flip
      ? `rotate(180 ${x + dim.w / 2} ${y + dim.h / 2})`
      : undefined;
    return (
      <g
        key={t.id}
        className="cursor-pointer"
        onClick={() => clickTooth(t.id)}
        role="button"
        aria-label={`Tooth ${t.id} (${displayLabel(t.id, side)})`}
        aria-pressed={isSelected}
      >
        <rect
          x={x}
          y={y}
          width={dim.w}
          height={dim.h}
          rx={dim.rx}
          ry={dim.rx}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          transform={transform}
        />
        <text
          x={x + dim.w / 2}
          y={y + dim.h / 2 + 3}
          textAnchor="middle"
          fontSize={8}
          fontWeight={600}
          fill={textColor}
          pointerEvents="none"
        >
          {t.label}
        </text>
      </g>
    );
  }

  function displayLabel(id: string, _side: "left" | "right"): string {
    // Convert internal id "UR1" to "Upper R1".
    const arch = id.slice(0, 1) === "U" ? "Upper" : "Lower";
    const sd = id.slice(1, 2) === "R" ? "R" : "L";
    const pos = id.slice(2);
    return `${arch} ${sd}${pos}`;
  }

  const upperCount = value.upper.length;
  const lowerCount = value.lower.length;

  return (
    <div className="space-y-4">
      {/* Dentition toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Dentition type"
          className="inline-flex rounded-full bg-gray-100 p-1"
        >
          {(["permanent", "mixed", "primary"] as Dentition[]).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={value.dentition === d}
              onClick={() => setDentition(d)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium capitalize transition-colors ${
                value.dentition === d
                  ? "bg-white text-navy shadow-sm"
                  : "text-gray-600 hover:text-navy"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div
          role="radiogroup"
          aria-label="Selection mode"
          className="inline-flex rounded-full bg-gray-100 p-1"
        >
          {(["add", "remove", "range"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => {
                setMode(m);
                if (m !== "range") setRangeAnchor(null);
              }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-white text-navy shadow-sm"
                  : "text-gray-600 hover:text-navy"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "range" && (
        <div className="text-[12px] text-brandOrange bg-brandOrange/5 border border-brandOrange/20 rounded-md px-3 py-2">
          {rangeAnchor
            ? `Range anchor: ${displayLabel(rangeAnchor, "left")} — click another tooth to fill the range.`
            : "Click two teeth to select everything between them (in display order)."}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 text-[11.5px]">
        {[
          { label: "Select all upper", fn: () => selectAll("upper") },
          { label: "Select all lower", fn: () => selectAll("lower") },
          { label: "Clear upper", fn: () => clearArch("upper") },
          { label: "Clear lower", fn: () => clearArch("lower") },
          { label: "Clear all", fn: () => clearArch("all") },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.fn}
            className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 hover:border-navy hover:text-navy transition-colors"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Chart — minWidth halved from the previous 560 to match the
          new tooth dimensions; the SVG is still scaled to 100% of its
          container so the doctor doesn't have to hunt for endpoints. */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          className="select-none"
          aria-label="Tooth selection chart"
          role="img"
          style={{ maxWidth: 280 }}
        >
          {showUpper && (
            <>
              {renderRow(quads.UR, quads.UL, false, 2, upperSelected)}
              <text
                x={svgW / 2}
                y={ROW_HEIGHT + 14}
                textAnchor="middle"
                fontSize={9}
                fill="#6B7280"
                letterSpacing="0.12em"
              >
                UPPER {value.dentition.toUpperCase()}{" "}
                ({upperCount} selected)
              </text>
            </>
          )}
          {showLower && (
            <>
              {renderRow(
                quads.LR,
                quads.LL,
                true,
                showUpper ? ROW_HEIGHT + 20 : 2,
                lowerSelected
              )}
              <text
                x={svgW / 2}
                y={svgH - 4}
                textAnchor="middle"
                fontSize={9}
                fill="#6B7280"
                letterSpacing="0.12em"
              >
                LOWER {value.dentition.toUpperCase()}{" "}
                ({lowerCount} selected)
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Selection summary — compact contiguous-run format. A full
          upper arch shows as "UR7 to UL7" (or 8→8 for wisdom-tooth
          cases); disjoint regions get comma-separated. */}
      <div className="rounded-xl bg-gray-50/60 border border-gray-200 px-4 py-3 text-[13px] text-gray-700">
        {(() => {
          const upperOrder = archDisplayOrder("U", value.dentition);
          const lowerOrder = archDisplayOrder("L", value.dentition);
          const upperText = compactRanges(value.upper, upperOrder);
          const lowerText = compactRanges(value.lower, lowerOrder);
          const upperEmpty = upperCount === 0;
          const lowerEmpty = lowerCount === 0;
          if (
            (!showUpper || upperEmpty) &&
            (!showLower || lowerEmpty)
          ) {
            return (
              <span className="text-gray-400">No teeth selected.</span>
            );
          }
          return (
            <div className="space-y-0.5">
              {showUpper && (
                <div>
                  <span className="font-medium text-navy">Upper:</span>{" "}
                  {upperEmpty ? "—" : upperText}
                </div>
              )}
              {showLower && (
                <div>
                  <span className="font-medium text-navy">Lower:</span>{" "}
                  {lowerEmpty ? "—" : lowerText}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
