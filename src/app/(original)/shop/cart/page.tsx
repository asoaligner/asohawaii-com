"use client";

/**
 * Cart review page — list, edit qty, remove, see subtotal, then check
 * out. Shipping is intentionally NOT shown here because it depends on
 * the destination, which we collect on /shop/checkout/. We hint that
 * shipping is calculated at checkout so the total isn't surprising.
 *
 * Empty-cart state is a friendly nudge back to /shop/, not a blocker.
 */

import Link from "next/link";
import Image from "next/image";
import { useShopCart, type CartItem } from "@/contexts/ShopCartContext";
import QuantitySelector from "@/components/shop/QuantitySelector";

const PRODUCT_IMAGE: Record<CartItem["productSlug"], string> = {
  "complete-collection": "/images/aso/miniature/miniature-set.jpg",
  "individual-model": "/images/aso/miniature/miniature-hand.jpg",
};

function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, hydrated } =
    useShopCart();

  return (
    <>
      <section className="hero-gradient pt-16 pb-8 md:pt-20 md:pb-10">
        <div className="container-narrow">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
            Cart
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tightest text-navy text-balance">
            Shopping <span className="italic text-brandOrange">cart.</span>
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
            <EmptyCart />
          ) : (
            <div className="space-y-8">
              <ul className="divide-y divide-gray-100 border-y border-gray-100">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="py-6 flex flex-col sm:flex-row gap-5 sm:gap-7"
                  >
                    <div className="relative w-full sm:w-32 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        src={PRODUCT_IMAGE[item.productSlug]}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h3 className="font-serif text-lg md:text-xl text-navy leading-snug tracking-tight">
                          {item.name}
                        </h3>
                        <div className="font-serif text-lg text-navy">
                          {formatMoney(item.price * item.quantity)}
                        </div>
                      </div>
                      {item.applianceType && (
                        <p className="mt-1 text-[13px] text-gray-500">
                          {item.applianceType}
                        </p>
                      )}
                      <p className="mt-1 text-[13px] text-gray-400">
                        {formatMoney(item.price)} each
                      </p>
                      <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
                        <QuantitySelector
                          inputId={`cart-qty-${item.id}`}
                          value={item.quantity}
                          onChange={(q) => updateQuantity(item.id, q)}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[13px] text-gray-500 hover:text-red-600 underline underline-offset-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 md:p-7">
                <dl className="space-y-2 text-[14.5px]">
                  <div className="flex justify-between text-gray-700">
                    <dt>Subtotal</dt>
                    <dd className="font-medium">{formatMoney(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <dt>Shipping</dt>
                    <dd className="italic">calculated at checkout</dd>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 text-navy">
                    <dt className="font-serif text-lg">Total</dt>
                    <dd className="font-serif text-lg">
                      {formatMoney(subtotal)}
                      <span className="text-sm font-sans text-gray-500 ml-2">
                        + shipping
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Link
                    href="/shop/"
                    className="inline-flex items-center justify-center gap-2 bg-white text-navy border border-gray-300 px-5 py-3 rounded-full text-sm font-medium hover:border-navy transition-colors"
                  >
                    ← Continue shopping
                  </Link>
                  <Link
                    href="/shop/checkout/"
                    className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
                  >
                    Checkout →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5h2l2.4 11.5a2 2 0 002 1.5h8.6a2 2 0 002-1.5L22 8H6" />
          <circle cx="9" cy="20.5" r="1.4" />
          <circle cx="18" cy="20.5" r="1.4" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl text-navy">Your cart is empty.</h2>
      <p className="mt-3 text-gray-600 text-[15px] max-w-sm mx-auto">
        Browse the miniature collection and add a piece to get started.
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
