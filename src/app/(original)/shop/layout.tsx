"use client";

/**
 * Shop subtree layout — wraps every /shop/* route in:
 *   - PayPalScriptProvider so checkout pages can render Smart Buttons
 *     without re-loading the SDK on every navigation
 *   - ShopCartProvider so the cart icon in the nav, the cart page, and
 *     the checkout page all read from the same localStorage-backed store.
 *
 * The provider is intentionally scoped to /shop/* (not the root layout)
 * so the PayPal SDK script (~70KB gzipped) only loads when a user is
 * actually browsing the shop. NEXT_PUBLIC_PAYPAL_CLIENT_ID falls back to
 * "test" — PayPal returns a non-functional sandbox token that still
 * lets the rest of the page render in dev / preview before the real
 * keys are wired into Cloudflare Pages env vars.
 */

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture" as const,
  enableFunding: "card,credit",
  disableFunding: "venmo",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
