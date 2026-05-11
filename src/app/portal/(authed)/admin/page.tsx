"use client";

/**
 * Admin landing — entry point for ASO staff tools. Currently lists the
 * audit log; user management / clinic CRUD / sync controls arrive in
 * Phase 1.4d and will appear here as additional cards.
 */

import Link from "next/link";

interface Tool {
  href: string;
  label: string;
  description: string;
}

const TOOLS: Tool[] = [
  {
    href: "/portal/admin/audit/",
    label: "Audit Log",
    description:
      "Cross-clinic action history — logins, OAuth events, password changes, and other auditable activity.",
  },
];

export default function AdminLandingPage() {
  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-4xl">
        <header className="mb-6 sm:mb-8">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            ASO Staff
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
            Admin
          </h1>
        </header>

        <div className="grid gap-3">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-navy/40 transition-colors"
            >
              <div className="font-medium text-navy">{t.label}</div>
              <div className="mt-1 text-[13px] text-gray-600">
                {t.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
