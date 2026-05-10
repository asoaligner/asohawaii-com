"use client";

/**
 * Shared chrome for unauthenticated portal pages: login, forgot
 * password, reset password. Same header bar (logo + back-to-site link)
 * and centered card layout. Children render the page-specific form.
 */

import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Footer content rendered below the card. */
  footer?: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50/40">
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60">
        <div className="container-narrow flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="ASO Hawaii — Home"
          >
            <Image
              src="/images/aso/aso-logo.png"
              alt="ASO Hawaii"
              width={750}
              height={511}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block font-serif text-base text-navy leading-tight">
              Doctor Portal
            </span>
          </Link>
          <Link
            href="/"
            className="text-[13px] text-gray-500 hover:text-navy transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_24px_60px_-24px_rgba(15,41,66,0.18)] p-7 sm:p-9">
            <h1 className="font-serif text-3xl text-navy text-center leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center text-[13.5px] text-gray-500">
                {subtitle}
              </p>
            )}
            <div className="mt-7">{children}</div>
          </div>
          {footer && (
            <p className="mt-6 text-center text-[12px] text-gray-500 leading-relaxed">
              {footer}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
