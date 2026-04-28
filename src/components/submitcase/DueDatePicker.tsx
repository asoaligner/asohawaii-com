"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { enUS } from "date-fns/locale";
import "./day-picker.css";
import {
  formatIsoDate,
  formatLongDate,
} from "@/utils/leadTimeCalculator";

type Props = {
  /** ISO yyyy-mm-dd, or "" when nothing is picked yet. */
  value: string;
  onChange: (iso: string) => void;
  /** Earliest selectable day (inclusive). */
  minDate: Date;
  inputId?: string;
};

/**
 * Brand-styled, English-locale date picker.
 *
 * The browser's native <input type="date"> ignores `lang="en"` on Chrome
 * when the OS locale is non-English, so the calendar UI renders in
 * Japanese for our HQ users. This component swaps in react-day-picker
 * (locked to en-US) inside a click-anchored popover so the calendar
 * always reads in English regardless of OS locale.
 */
export default function DueDatePicker({
  value,
  onChange,
  minDate,
  inputId,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left text-navy hover:border-navy/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors flex items-center justify-between"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? formatLongDate(selected) : "Select a due date"}
        </span>
        <span aria-hidden className="text-gray-400">
          📅
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Pick a due date"
          className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3"
          style={{
            // Brand accent on selected day / today
            ["--rdp-accent-color" as string]: "#0a2540",
            ["--rdp-accent-background-color" as string]: "#0a25400d",
            ["--rdp-today-color" as string]: "#ec6927",
          }}
        >
          <DayPicker
            mode="single"
            locale={enUS}
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(formatIsoDate(d));
                setOpen(false);
              }
            }}
            disabled={{ before: minDate }}
            defaultMonth={selected ?? minDate}
            showOutsideDays
            captionLayout="label"
          />
        </div>
      )}
    </div>
  );
}
