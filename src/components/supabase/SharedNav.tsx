"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { company } from "@/data/content";

const primary = [
  { label: "Home", href: "/supabase/" },
  { label: "Product", href: "/supabase/product/" },
  { label: "About Us", href: "/supabase/about/" },
  { label: "How to Order", href: "/supabase/how-to-order/" },
  { label: "FAQ", href: "/supabase/faq/" },
  { label: "Contact Us", href: "/supabase/contact/" },
];

const more = [
  { label: "New Products", href: "/supabase/new-products/" },
  { label: "Get a Quote", href: "/supabase/get-a-quote/" },
  { label: "Pick Up Request", href: "/supabase/pick-up/" },
  { label: "Download", href: "/supabase/download/" },
];

export default function SharedNav() {
  const pathname = usePathname() ?? "/supabase/";
  const [openMore, setOpenMore] = useState(false);
  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    const clean = href.replace(/\/$/, "");
    if (clean === "/supabase")
      return pathname === "/supabase" || pathname === "/supabase/";
    return pathname.startsWith(clean);
  };

  return (
    <header className="supabase-top">
      <div className="supabase-top-utility">
        <div className="supabase-top-utility-inner">
          <a
            href={`tel:${company.phone.replace(/-/g, "")}`}
            className="supabase-utility-link"
          >
            ▸ {company.phone}
          </a>
          <span className="supabase-utility-divider" />
          <Link
            href="/supabase/pick-up/"
            className="supabase-utility-link"
          >
            Pick Up Request
          </Link>
          <span className="supabase-utility-divider" />
          <a
            href="https://easyrxcloud.com"
            target="_blank"
            rel="noopener noreferrer"
            className="supabase-utility-link"
          >
            Log In ↗
          </a>
        </div>
      </div>

      <nav className="supabase-nav">
        <Link href="/supabase/" className="supabase-nav-brand">
          <span className="supabase-logo-pill">
            <Image
              src="/images/aso/aso-logo.png"
              alt="ASO International, Inc logo"
              width={140}
              height={50}
              priority
              style={{ width: "auto", height: "28px", objectFit: "contain" }}
            />
          </span>
        </Link>

        <ul className="supabase-nav-list">
          {primary.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={
                  isActive(l.href)
                    ? "supabase-nav-link active"
                    : "supabase-nav-link"
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li
            className="supabase-nav-more"
            onMouseEnter={() => setOpenMore(true)}
            onMouseLeave={() => setOpenMore(false)}
          >
            <button
              type="button"
              onClick={() => setOpenMore((v) => !v)}
              className={`supabase-nav-link ${
                more.some((m) => isActive(m.href)) ? "active" : ""
              }`}
              aria-expanded={openMore}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              More <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
            </button>
            {openMore && (
              <div className="supabase-nav-more-menu">
                {more.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="supabase-nav-more-item"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        <div className="supabase-nav-right">
          <Link
            href="/supabase/get-a-quote/"
            className="supabase-nav-util"
          >
            Get a Quote
          </Link>
          <a
            href="https://instagram.com/aso.orthodonticslab.honolulu"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="supabase-nav-ig"
          >
            <svg
              width="16"
              height="16"
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
          <Link
            href="/supabase/contact/#invitation"
            className="supabase-nav-cta-green"
          >
            Request invitation →
          </Link>
        </div>
      </nav>
    </header>
  );
}
