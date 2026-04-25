"use client";

import Image from "next/image";
import { useState } from "react";
import {
  COLOR_CHART_IMAGES,
  GLITTER_COLORS,
  NEON_COLORS,
  TRADITIONAL_COLORS,
  type AcrylicColor,
} from "@/data/acrylic-colors";

type Tab = "traditional" | "glitter" | "neon";

const TABS: { key: Tab; label: string; count: number }[] = [
  { key: "traditional", label: "Traditional", count: TRADITIONAL_COLORS.length },
  { key: "glitter", label: "Glitter", count: GLITTER_COLORS.length },
  { key: "neon", label: "Neon", count: NEON_COLORS.length },
];

const COLORS_BY_TAB: Record<Tab, AcrylicColor[]> = {
  traditional: TRADITIONAL_COLORS,
  glitter: GLITTER_COLORS,
  neon: NEON_COLORS,
};

export default function AcrylicColorChart() {
  const [tab, setTab] = useState<Tab>("traditional");
  const colors = COLORS_BY_TAB[tab];
  const chart =
    tab === "neon"
      ? COLOR_CHART_IMAGES.neonStickers
      : COLOR_CHART_IMAGES.traditionalGlitter;
  const chartAlt =
    tab === "neon"
      ? "ASO neon color samples — 9 high-saturation acrylic options"
      : "ASO traditional and glitter color samples — 11 traditional + 8 glitter acrylic options";

  return (
    <div>
      {/* Tab strip */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-navy text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-navy hover:text-navy"
              }`}
            >
              {t.label}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/15 text-white/85" : "bg-gray-100 text-gray-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reference chart image */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-8">
        <Image
          src={chart}
          alt={chartAlt}
          width={1400}
          height={1082}
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="w-full h-auto"
        />
      </div>

      {/* Swatch grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {colors.map((c) => (
          <div
            key={c.id}
            className="group rounded-xl border border-gray-200 bg-white p-3 hover:border-navy/30 hover:shadow-[0_8px_24px_-12px_rgba(15,41,66,0.18)] transition-all cursor-default"
          >
            <div
              className="aspect-square rounded-lg border border-gray-200/70 mb-2.5 transition-transform group-hover:scale-[1.02]"
              style={{
                background:
                  c.swatch === "#FFFFFF"
                    ? "repeating-linear-gradient(45deg, #ffffff, #ffffff 6px, #f3f4f6 6px, #f3f4f6 12px)"
                    : c.swatch,
              }}
              aria-hidden
            />
            <div className="text-[11px] uppercase tracking-widest text-brandOrange font-semibold">
              #{c.id}
            </div>
            <div className="text-[13px] text-navy leading-tight">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
