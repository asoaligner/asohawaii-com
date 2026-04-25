"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/aso.orthodonticslab.honolulu/";

type PrimaryLink = {
  label: string;
  href: string;
  /** Optional children — renders as hover dropdown on desktop. */
  children?: { label: string; href: string }[];
};

const primary: PrimaryLink[] = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about" },
  {
    label: "How to Order",
    href: "/how-to-order",
    children: [
      { label: "Ordering Process", href: "/how-to-order" },
      {
        label: "Scanner Setup Guides",
        href: "/how-to-order#scanner-guides",
      },
    ],
  },
  { label: "Shop", href: "/shop" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const rightLinks = [
  { label: "Download", href: "/download" },
  { label: "Get a Quote", href: "/get-a-quote" },
];

// Items only surfaced in the mobile menu (already represented in the top
// utility bar or right-side CTAs on desktop).
const mobileExtras = [
  { label: "New Products", href: "/new-products" },
  { label: "Pick Up Request", href: "/pick-up" },
];

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  // Debug/screenshot helper: when URL ends with #show-dropdown, force the
  // "How to Order" dropdown visible. Read synchronously on first render
  // so headless screenshots catch the open state.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/60">
      {/* Top utility bar */}
      <div className="bg-navy text-white/90">
        <div className="container-narrow flex items-center justify-end h-8 text-[12px] tracking-wide">
          <Link
            href="/pick-up"
            className="inline-flex items-center gap-1 text-white/85 hover:text-brandOrange transition-colors"
          >
            Pick Up Request
            <span aria-hidden className="text-brandOrange">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Main nav row */}
      <div className="container-narrow flex items-center justify-between h-40 sm:h-44 gap-6">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center shrink-0"
          aria-label="ASO International, Inc. — Home"
        >
          <Image
            src="/images/aso/aso-logo.png"
            alt="ASO International, Inc. — Orthodontic Laboratory Services"
            width={750}
            height={511}
            priority
            className="h-28 sm:h-32 lg:h-36 w-auto object-contain"
          />
        </Link>

        {/* MAIN NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {primary.map((l) =>
            l.children ? (
              <div key={l.href} className="relative group">
                <Link
                  href={l.href}
                  className={`inline-flex items-center gap-1 text-[14px] transition-colors relative py-1 ${
                    isActive(l.href)
                      ? "text-navy font-medium"
                      : "text-gray-600 hover:text-navy"
                  }`}
                >
                  {l.label}
                  <svg
                    className="w-3 h-3 transition-transform group-hover:rotate-180"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                  {isActive(l.href) && (
                    <span className="absolute -bottom-[64px] sm:-bottom-[72px] left-0 right-0 h-0.5 bg-brandOrange rounded-full" />
                  )}
                </Link>
                {/* Dropdown menu */}
                <div className="absolute top-full left-0 pt-3 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-lg bg-white shadow-lg border border-gray-100 py-2">
                    {l.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          isActive(c.href)
                            ? "text-brandOrange font-medium bg-orange-50/50"
                            : "text-gray-700 hover:bg-gray-50 hover:text-brandOrange"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[14px] transition-colors relative py-1 ${
                  isActive(l.href)
                    ? "text-navy font-medium"
                    : "text-gray-600 hover:text-navy"
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute -bottom-[64px] sm:-bottom-[72px] left-0 right-0 h-0.5 bg-brandOrange rounded-full" />
                )}
              </Link>
            )
          )}
        </nav>

        {/* RIGHT CTAs */}
        <div className="flex items-center gap-4">
          {/* text CTAs on desktop */}
          <div className="hidden lg:flex items-center gap-4 text-[13.5px]">
            {rightLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors ${
                  isActive(l.href)
                    ? "text-navy font-medium"
                    : "text-gray-600 hover:text-navy"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <span aria-hidden className="w-px h-4 bg-gray-200" />
          </div>

          {/* Instagram — always visible */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex w-9 h-9 items-center justify-center rounded-full text-gray-500 hover:text-brandOrange hover:bg-gray-50 transition-colors"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
          </a>

          {/* Log In — desktop */}
          <a
            href="https://easyrxcloud.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-[13.5px] font-medium text-navy border border-gray-200 px-3.5 py-1.5 rounded-full hover:border-navy hover:bg-navy hover:text-white transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Log In
          </a>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex w-10 h-10 items-center justify-center rounded-lg border border-gray-200 text-navy hover:border-navy transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="container-narrow py-4 grid gap-1">
            {primary.map((l) => (
              <div key={l.href}>
                <Link
                  href={l.href}
                  className={`block px-3 py-2.5 text-sm rounded-lg ${
                    isActive(l.href)
                      ? "bg-navy/5 text-navy font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {l.label}
                </Link>
                {l.children && (
                  <div className="ml-4 border-l border-gray-100 pl-3 mt-1 mb-1 grid gap-0.5">
                    {l.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block px-3 py-2 text-[13px] rounded-lg ${
                          isActive(c.href)
                            ? "text-brandOrange font-medium"
                            : "text-gray-600 hover:text-brandOrange"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {[...rightLinks, ...mobileExtras].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 text-sm rounded-lg ${
                  isActive(l.href)
                    ? "bg-navy/5 text-navy font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://easyrxcloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden px-3 py-2.5 text-sm text-navy font-medium rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Log In (EasyRx) ↗
            </a>
            <Link
              href="/contact#invitation"
              className="mx-3 mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-navy text-white px-4 py-3 rounded-full"
            >
              Request invitation →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
