"use client";

import { useEffect } from "react";

type PdfPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
};

export default function PdfPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
}: PdfPreviewModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-navy text-white">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brandOrange hover:bg-[#EA6A0E] text-white text-sm font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2v9M4 7l4 4 4-4M3 13h10" />
              </svg>
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close preview"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
