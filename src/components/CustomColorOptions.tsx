import { CUSTOM_OPTIONS } from "@/data/acrylic-colors";

export default function CustomColorOptions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {CUSTOM_OPTIONS.map((opt, i) => (
        <div
          key={opt.id}
          className="group rounded-2xl border border-gray-200 bg-white p-6 md:p-7 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_12px_32px_-16px_rgba(15,41,66,0.18)] transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="font-serif italic text-brandOrange text-xl">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-brandOrange/40 to-transparent" />
          </div>
          <h3 className="font-serif text-xl text-navy leading-snug tracking-tight">
            {opt.title}
          </h3>
          <p className="mt-3 text-[14.5px] text-gray-600 leading-relaxed">
            {opt.description}
          </p>
          <div className="mt-5 inline-block text-[12.5px] text-gray-500 bg-gray-50 border border-gray-200/80 rounded-lg px-3 py-2 font-mono">
            {opt.example}
          </div>
        </div>
      ))}
    </div>
  );
}
