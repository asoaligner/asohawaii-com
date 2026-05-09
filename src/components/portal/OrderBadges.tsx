/**
 * Tiny presentation helpers shared between the dashboard table and the
 * order detail page. All pure — no fetching, no state.
 */

const SOURCE_LABELS: Record<string, string> = {
  visualdlp: "VisualDLP",
  shop: "Shop",
};

const SOURCE_COLORS: Record<string, string> = {
  visualdlp: "bg-blue-50 text-blue-700 border border-blue-200/70",
  shop: "bg-orange-50 text-orange-700 border border-orange-200/70",
};

export function SourceBadge({ source }: { source: string }) {
  const label = SOURCE_LABELS[source] ?? source;
  const colors =
    SOURCE_COLORS[source] ?? "bg-gray-100 text-gray-700 border border-gray-200";
  return (
    <span
      className={`inline-flex items-center text-[10.5px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${colors}`}
    >
      {label}
    </span>
  );
}

/**
 * Render a delivery date with a "delivered" indicator when the date is
 * in the past. Matches against the local date in YYYY-MM-DD form to avoid
 * timezone surprises (the row stores text dates, not timestamps).
 */
export function DeliveryDateCell({ date }: { date: string | null }) {
  if (!date) {
    return <span className="text-gray-400">—</span>;
  }
  const today = new Date().toISOString().slice(0, 10);
  const delivered = date < today;
  if (delivered) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-700">
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 8l4 4 6-8" />
        </svg>
        <span>{date}</span>
        <span className="text-[10.5px] uppercase tracking-widest text-emerald-600/80">
          Delivered
        </span>
      </span>
    );
  }
  return <span className="text-navy">{date}</span>;
}
