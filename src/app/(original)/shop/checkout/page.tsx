"use client";

/**
 * Checkout summary + destination tier picker + PayPal Smart Buttons.
 *
 * The destination radio is intentionally up-front (rather than relying
 * solely on the address PayPal returns) so the buyer sees the shipping
 * fee in the breakdown BEFORE they click PayPal. The PayPal capture
 * still detects the actual destination and the lab-side notification
 * flags any mismatch — see PayPalCheckout.tsx.
 *
 * Empty cart redirects back to /shop/cart/ rather than rendering an
 * unusable checkout.
 */

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useShopCart, type CartItem } from "@/contexts/ShopCartContext";
import PayPalCheckout from "@/components/shop/PayPalCheckout";
import {
  calculateShipping,
  SHIPPING_LABELS,
  type ShippingDestination,
} from "@/components/shop/ShippingCalculator";

const PRODUCT_IMAGE: Record<CartItem["productSlug"], string> = {
  "complete-collection": "/images/aso/miniature/miniature-set.jpg",
  "individual-model": "/images/aso/miniature/miniature-hand.jpg",
};

const DESTINATIONS: ShippingDestination[] = [
  "hawaii",
  "us-mainland",
  "international",
];

function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function CheckoutPage() {
  const { items, subtotal, hydrated } = useShopCart();
  const [destination, setDestination] =
    useState<ShippingDestination>("us-mainland");
  const shippingFee = calculateShipping(destination);
  const total = subtotal + shippingFee;

  return (
    <>
      <section className="hero-gradient pt-16 pb-8 md:pt-20 md:pb-10">
        <div className="container-narrow">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
            Checkout
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tightest text-navy text-balance">
            Complete your <span className="italic text-brandOrange">order.</span>
          </h1>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-narrow max-w-4xl">
          {!hydrated ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Loading cart…
            </div>
          ) : items.length === 0 ? (
            <EmptyCheckout />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-8">
                {/* SHIPPING DESTINATION */}
                <div>
                  <h2 className="font-serif text-xl text-navy mb-4">
                    Shipping destination
                  </h2>
                  <div className="space-y-2">
                    {DESTINATIONS.map((dest) => (
                      <label
                        key={dest}
                        className={`flex items-center gap-3 cursor-pointer rounded-xl border bg-white px-4 py-3.5 transition-colors ${
                          destination === dest
                            ? "border-navy bg-navy/[0.03]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="destination"
                          value={dest}
                          checked={destination === dest}
                          onChange={() => setDestination(dest)}
                          className="accent-navy"
                        />
                        <span className="text-[14.5px] text-gray-700">
                          {SHIPPING_LABELS[dest]}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-[12.5px] text-gray-500 leading-relaxed">
                    Pick the tier matching your PayPal shipping address. We
                    verify the address on capture and contact you if the tier
                    needs adjustment.
                  </p>
                </div>

                {/* PAYPAL BUTTONS */}
                <div>
                  <h2 className="font-serif text-xl text-navy mb-4">
                    Payment
                  </h2>
                  <PayPalCheckout
                    shippingFee={shippingFee}
                    selectedDestination={destination}
                  />
                  <p className="mt-3 text-[12px] text-gray-500 leading-relaxed">
                    Pay with PayPal balance, or click a credit-card option to
                    pay as guest. Card details never touch ASO servers — PayPal
                    handles them directly.
                  </p>
                </div>

                <div>
                  <Link
                    href="/shop/cart/"
                    className="text-[13px] text-gray-500 hover:text-navy underline underline-offset-2 transition-colors"
                  >
                    ← Back to cart
                  </Link>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <aside className="lg:col-span-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 md:p-7 sticky top-28">
                  <h2 className="font-serif text-xl text-navy mb-4">
                    Order summary
                  </h2>
                  <ul className="space-y-3 mb-5">
                    {items.map((it) => (
                      <li key={it.id} className="flex gap-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                          <Image
                            src={PRODUCT_IMAGE[it.productSlug]}
                            alt={it.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[13.5px] text-navy leading-snug">
                            {it.name}
                            {it.applianceType && (
                              <span className="text-gray-500">
                                {" — "}
                                {it.applianceType}
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-gray-500 mt-0.5">
                            {formatMoney(it.price)} × {it.quantity}
                          </p>
                        </div>
                        <div className="text-[13px] text-navy font-medium whitespace-nowrap">
                          {formatMoney(it.price * it.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <dl className="space-y-1.5 text-[13.5px] pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <dt>Subtotal</dt>
                      <dd>{formatMoney(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <dt>Shipping</dt>
                      <dd>
                        {shippingFee === 0
                          ? "Free"
                          : formatMoney(shippingFee)}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 text-navy font-serif text-lg">
                      <dt>Total</dt>
                      <dd>{formatMoney(total)}</dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyCheckout() {
  return (
    <div className="text-center py-16">
      <h2 className="font-serif text-2xl text-navy">
        Your cart is empty.
      </h2>
      <p className="mt-3 text-gray-600 text-[15px] max-w-sm mx-auto">
        Add an item before checking out.
      </p>
      <div className="mt-7">
        <Link
          href="/shop/"
          className="inline-flex items-center justify-center gap-2 bg-brandOrange text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors"
        >
          Visit the shop
        </Link>
      </div>
    </div>
  );
}
