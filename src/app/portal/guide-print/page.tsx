import type { Metadata } from "next";
import PortalGuideContent from "@/components/portal/PortalGuideContent";

export const metadata: Metadata = {
  title: "ASO Hawaii Doctor Portal — Onboarding Guide (Print)",
  robots: { index: false, follow: false },
};

/**
 * Print-only layout. Open in a desktop browser, hit Cmd/Ctrl+P, and save
 * as PDF for attachment to invitation emails. Page 1 = English, page 2 =
 * Japanese — recipients can print one side only via the print dialog's
 * page-range selector.
 *
 * Designed for A4 portrait at 12mm margins (set via @page). Inline
 * <style> block so static export bundles the rules without needing a
 * separate stylesheet.
 */
export default function PortalGuidePrintPage() {
  return (
    <>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        html, body {
          background: #ffffff;
          margin: 0;
          padding: 0;
        }
        .guide-page {
          padding-left: 0 !important;
          padding-right: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          max-width: 100% !important;
        }
        .guide-page + .guide-page {
          page-break-before: always;
          margin-top: 32px;
        }
        .print-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fef3c7;
          color: #78350f;
          border-bottom: 1px solid #fcd34d;
          padding: 8px 16px;
          font: 13px/1.4 system-ui, "Segoe UI", sans-serif;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .print-toolbar button {
          background: #0F2942;
          color: #fff;
          border: 0;
          border-radius: 999px;
          padding: 6px 14px;
          font: inherit;
          font-weight: 500;
          cursor: pointer;
        }
        @media print {
          .print-toolbar { display: none !important; }
          .guide-page + .guide-page { margin-top: 0; }
        }
      `}</style>

      <div className="print-toolbar">
        <span>
          Press <kbd>Ctrl/Cmd&nbsp;+&nbsp;P</kbd> to print or save as PDF
          — page&nbsp;1&nbsp;= English, page&nbsp;2&nbsp;= Japanese.
          ブラウザの「印刷」(Ctrl/Cmd+P) で PDF 保存できます。
        </span>
      </div>

      <PortalGuideContent locale="en" />
      <PortalGuideContent locale="ja" />
    </>
  );
}
