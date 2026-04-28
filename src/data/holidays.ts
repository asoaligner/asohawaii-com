/**
 * Federal holidays + ASO Hawaii's own closures (year-end, New Year).
 *
 * The Submit Case form's lead-time calculator skips these dates when
 * counting business days, and uses runs of two-or-more consecutive
 * weekday holidays as the trigger to switch the 2-week appliance lead
 * time from a calendar-day count to a business-day count (so a case
 * placed on Dec 22 doesn't promise delivery during the year-end shutdown).
 *
 * Update this list once a year — the federal-holiday observance dates
 * shift between years. Source: opm.gov, plus ASO's confirmed closures.
 */

export interface HolidayDate {
  /** ISO 形式 YYYY-MM-DD */
  date: string;
  /** 表示用ラベル */
  name: string;
  /** ASO 独自休業か連邦祝日か */
  type: "federal" | "aso";
}

export const ASO_HOLIDAYS: HolidayDate[] = [
  // ===== 2026 =====
  { date: "2026-01-01", name: "New Year's Day", type: "federal" },
  { date: "2026-01-19", name: "MLK Day", type: "federal" },
  { date: "2026-02-16", name: "Presidents' Day", type: "federal" },
  { date: "2026-05-25", name: "Memorial Day", type: "federal" },
  { date: "2026-06-19", name: "Juneteenth", type: "federal" },
  { date: "2026-07-03", name: "Independence Day (observed)", type: "federal" },
  { date: "2026-09-07", name: "Labor Day", type: "federal" },
  { date: "2026-10-12", name: "Columbus Day", type: "federal" },
  { date: "2026-11-11", name: "Veterans Day", type: "federal" },
  { date: "2026-11-26", name: "Thanksgiving", type: "federal" },
  { date: "2026-12-25", name: "Christmas Day", type: "federal" },
  { date: "2026-12-30", name: "ASO Year-End Closure", type: "aso" },
  { date: "2026-12-31", name: "ASO Year-End Closure", type: "aso" },

  // ===== 2027 =====
  { date: "2027-01-01", name: "New Year's Day", type: "federal" },
  { date: "2027-01-02", name: "ASO New Year Closure", type: "aso" },
  { date: "2027-01-03", name: "ASO New Year Closure", type: "aso" },
  { date: "2027-01-18", name: "MLK Day", type: "federal" },
  { date: "2027-02-15", name: "Presidents' Day", type: "federal" },
  { date: "2027-05-31", name: "Memorial Day", type: "federal" },
  { date: "2027-06-18", name: "Juneteenth (observed)", type: "federal" },
  { date: "2027-07-05", name: "Independence Day (observed)", type: "federal" },
  { date: "2027-09-06", name: "Labor Day", type: "federal" },
  { date: "2027-10-11", name: "Columbus Day", type: "federal" },
  { date: "2027-11-11", name: "Veterans Day", type: "federal" },
  { date: "2027-11-25", name: "Thanksgiving", type: "federal" },
  { date: "2027-12-24", name: "Christmas (observed)", type: "federal" },
  { date: "2027-12-30", name: "ASO Year-End Closure", type: "aso" },
  { date: "2027-12-31", name: "ASO Year-End Closure", type: "aso" },
];

const HOLIDAY_SET: Set<string> = new Set(ASO_HOLIDAYS.map((h) => h.date));

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isHoliday(date: Date): boolean {
  return HOLIDAY_SET.has(toIsoDate(date));
}

export function isWeekend(date: Date): boolean {
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

export { toIsoDate };
