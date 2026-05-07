"use client";

/**
 * Header cart pill — small cart glyph + quantity badge.
 *
 * Reads from useShopCartOptional() so it gracefully renders nothing if
 * the surrounding tree isn't wrapped by ShopCartProvider (e.g. an
 * adjacent variant layout). Hidden during hydration to avoid a flash
 * of "0" on first paint when localStorage actually has items.
 */

import Link from "next/link";
import { useShopCartOptional } from "@/contexts/ShopCartContext";

type Props = {
  /** Tailwind classes that control whether the icon shows on this
   *  breakpoint — passed in so desktop and mobile can differ. */
  className?: string;
};

export default function ShopCartIcon({ className }: Props) {
  const cart = useShopCartOptional();
  if (!cart) return null;

  const { totalQuantity, hydrated } = cart;
  const showBadge = hydrated && totalQuantity > 0;

  return (
    <Link
      href="/shop/cart/"
      aria-label={`Shopping cart${showBadge ? `, ${totalQuantity} items` : ""}`}
      className={`relative inline-flex w-9 h-9 items-center justify-center rounded-full text-navy hover:bg-navy/5 transition-colors ${className ?? ""}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 5h2l2.4 11.5a2 2 0 002 1.5h8.6a2 2 0 002-1.5L22 8H6" />
        <circle cx="9" cy="20.5" r="1.4" />
        <circle cx="18" cy="20.5" r="1.4" />
      </svg>
      {showBadge && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-brandOrange text-white text-[10px] font-semibold px-1 leading-none"
        >
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      )}
    </Link>
  );
}
