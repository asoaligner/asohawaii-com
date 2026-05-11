"use client";

/**
 * Top navigation for authenticated /portal/* pages. Replaces the public
 * site Nav inside the portal route. Mobile collapses the user chip into
 * a menu under the brand row; desktop keeps everything inline.
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout, type PortalClinic, type PortalUser } from "@/lib/portal/client";

interface Props {
  user: PortalUser;
  clinic: PortalClinic;
}

interface NavLink {
  label: string;
  href: string;
}

const BASE_NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/portal/dashboard/" },
  { label: "Submit Case", href: "/portal/submit-case/" },
  { label: "Profile", href: "/portal/profile/" },
];

function navLinksFor(user: PortalUser): NavLink[] {
  if (user.role === "aso_staff") {
    return [...BASE_NAV_LINKS, { label: "Admin", href: "/portal/admin/" }];
  }
  return BASE_NAV_LINKS;
}

export default function PortalNav({ user, clinic }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = navLinksFor(user);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    await logout();
    router.replace("/portal/");
  }

  const initials =
    (user.name ?? user.email)
      .split(/\s+/)
      .map((p) => p.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/60">
      <div className="container-narrow flex items-center justify-between gap-4 h-16">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" aria-label="ASO Hawaii home" className="shrink-0">
            <Image
              src="/images/aso/aso-logo.png"
              alt="ASO Hawaii"
              width={750}
              height={511}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <Link
            href="/portal/dashboard/"
            className="hidden sm:inline-block font-serif text-base text-navy leading-tight hover:text-brandOrange transition-colors"
          >
            Doctor Portal
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[14px]">
          {navLinks.map((l) => (
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
        </nav>

        {/* Desktop user chip */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-[13px] text-navy font-medium">
              {user.name ?? user.email}
            </div>
            <div className="text-[11px] text-gray-500">{clinic.name}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-navy/10 text-navy text-[12px] font-semibold inline-flex items-center justify-center">
            {initials}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="text-[13px] text-gray-600 hover:text-brandOrange transition-colors disabled:opacity-50"
          >
            {busy ? "…" : "Logout"}
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden inline-flex w-10 h-10 items-center justify-center rounded-lg border border-gray-200 text-navy"
          aria-label="Toggle portal menu"
          aria-expanded={menuOpen}
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
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container-narrow py-3 grid gap-1">
            <div className="px-3 py-2 text-[13px] text-gray-700 leading-tight">
              <div className="font-medium text-navy">
                {user.name ?? user.email}
              </div>
              <div className="text-[11.5px] text-gray-500">{clinic.name}</div>
            </div>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 text-sm rounded-lg ${
                  isActive(l.href)
                    ? "bg-navy/5 text-navy font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={busy}
              className="px-3 py-2.5 text-sm text-left rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {busy ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
