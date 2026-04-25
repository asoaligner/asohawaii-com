import Image from "next/image";
import { COLOR_CHART_IMAGES, STICKERS } from "@/data/acrylic-colors";

export default function StickersGrid() {
  return (
    <div>
      {/* Reference chart — sticker thumbnails are baked into the second
          color sheet at the bottom right. Showing the full sheet keeps
          the visual fidelity with what practices already see on paper. */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-8">
        <Image
          src={COLOR_CHART_IMAGES.neonStickers}
          alt="ASO sticker designs — 29 patient-friendly options that can be embedded in retainers"
          width={1400}
          height={1082}
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="w-full h-auto"
        />
      </div>

      {/* Numbered sticker name list — keeps the catalogue text-readable
          and copy-pastable into Rx forms. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
        {STICKERS.map((s) => (
          <div
            key={s.id}
            className="group flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-navy/30 transition-colors"
          >
            <div className="text-[11px] uppercase tracking-widest text-brandOrange font-semibold shrink-0">
              #{s.id}
            </div>
            <div className="text-[13px] text-navy leading-tight truncate">
              {s.name}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[13.5px] text-gray-500 italic">
        Multiple stickers can be applied per retainer.
      </p>
    </div>
  );
}
