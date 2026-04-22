"use client";

import Image from "next/image";
import { useState } from "react";
import { scannerGuides, type ScannerGuide } from "@/data/scanner-guides";
import PdfPreviewModal from "./PdfPreviewModal";

// Small presentational card — scanner logo + name + "view guide" hint.
// Clicking anywhere opens the PDF in a modal (desktop) or a new tab (mobile).
function ScannerCard({
  guide,
  onClick,
}: {
  guide: ScannerGuide;
  onClick: () => void;
}) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.open(guide.pdfFile, "_blank");
    } else {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex flex-col items-center gap-3 rounded-xl bg-white border border-gray-200 p-5 hover:border-brandOrange hover:shadow-[0_10px_30px_-10px_rgba(15,41,66,0.18)] transition-all text-left w-full"
      aria-label={`View ${guide.scannerName} setup guide`}
    >
      {/* Accent bar */}
      <span
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: guide.accentColor }}
      />
      <div className="relative w-full h-20 flex items-center justify-center mt-2">
        <Image
          src={guide.logoPath}
          alt={`${guide.scannerName} logo`}
          width={180}
          height={80}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </div>
      <div className="w-full text-center border-t border-gray-100 pt-3">
        <div className="font-serif text-[15px] text-navy leading-tight">
          {guide.scannerName}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
          via {guide.platform}
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-navy group-hover:text-brandOrange transition-colors">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View setup guide
        </div>
      </div>
    </button>
  );
}

export default function ScannerGuidesSection() {
  const [previewGuide, setPreviewGuide] = useState<ScannerGuide | null>(null);
  const sorted = [...scannerGuides].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {sorted.map((g) => (
          <ScannerCard
            key={g.id}
            guide={g}
            onClick={() => setPreviewGuide(g)}
          />
        ))}
      </div>

      <PdfPreviewModal
        isOpen={previewGuide !== null}
        onClose={() => setPreviewGuide(null)}
        pdfUrl={previewGuide?.pdfFile ?? ""}
        title={previewGuide?.scannerFullName ?? ""}
      />
    </>
  );
}
