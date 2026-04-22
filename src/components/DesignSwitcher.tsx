"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const variants = [
  { slug: "/", label: "Original", accent: "#F97316" },
  { slug: "/apple", label: "Apple", accent: "#0071e3" },
  { slug: "/stripe", label: "Stripe", accent: "#533afd" },
  { slug: "/linear", label: "Linear", accent: "#5e6ad2" },
  { slug: "/notion", label: "Notion", accent: "#0075de" },
  { slug: "/claude", label: "Claude", accent: "#c96442" },
  { slug: "/vercel", label: "Vercel", accent: "#171717" },
  { slug: "/supabase", label: "Supabase", accent: "#3ecf8e" },
];

export default function DesignSwitcher() {
  const pathname = usePathname();
  const normalized =
    pathname === "/"
      ? "/"
      : "/" + (pathname?.split("/").filter(Boolean)[0] ?? "");

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
      aria-label="Design variant switcher"
    >
      <div className="pointer-events-auto flex items-center gap-0.5 p-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl flex-wrap justify-center max-w-[min(92vw,780px)]">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 px-2 hidden lg:inline">
          Compare
        </span>
        {variants.map((v) => {
          const active = v.slug === normalized;
          return (
            <Link
              key={v.slug}
              href={v.slug}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                active
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              style={active ? { background: v.accent } : undefined}
            >
              {v.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
