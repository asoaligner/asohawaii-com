"use client";

/**
 * Single product card on /shop/. Two layouts in one component:
 *
 *  - "complete-collection" — bestseller layout, no appliance picker.
 *  - "individual-model"    — adds an appliance type dropdown that must
 *                            be filled before Add to Cart enables.
 *
 * Both share quantity stepper + Add to Cart wired through useShopCart().
 * After a successful add, the card flashes a "Added — view cart" link
 * so the user knows the action landed without yanking them away from
 * the shop list.
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useShopCart,
  type ApplianceType,
  type ProductSlug,
} from "@/contexts/ShopCartContext";
import IndividualModelSelector from "./IndividualModelSelector";
import QuantitySelector from "./QuantitySelector";

type Props = {
  slug: ProductSlug;
  name: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  /** When true, render the appliance type selector. */
  needsApplianceType?: boolean;
  /** Layout slot for the parent grid. */
  className?: string;
};

export default function ShopProductCard({
  slug,
  name,
  price,
  description,
  image,
  imageAlt,
  badge,
  needsApplianceType = false,
  className,
}: Props) {
  const { addItem } = useShopCart();
  const [quantity, setQuantity] = useState(1);
  const [applianceType, setApplianceType] = useState<ApplianceType | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const cannotAdd = needsApplianceType && !applianceType;

  function handleAdd() {
    if (cannotAdd) return;
    addItem({
      productSlug: slug,
      name,
      price,
      quantity,
      applianceType: applianceType ?? undefined,
    });
    setJustAdded(true);
    setQuantity(1);
    if (needsApplianceType) setApplianceType(null);
    window.setTimeout(() => setJustAdded(false), 4000);
  }

  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white overflow-hidden flex flex-col ${className ?? ""}`}
    >
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover"
        />
        {badge && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold bg-brandOrange/95 text-white px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-8 md:p-10 flex flex-col flex-grow">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h3 className="font-serif text-2xl md:text-3xl text-navy leading-snug tracking-tight">
            {name}
          </h3>
          <div className="font-serif text-3xl text-brandOrange tracking-tight">
            ${price}
          </div>
        </div>
        <p className="mt-4 text-[15px] text-gray-600 leading-relaxed">
          {description}
        </p>

        <div className="mt-7 space-y-4">
          {needsApplianceType && (
            <IndividualModelSelector
              inputId={`${slug}-appliance`}
              value={applianceType}
              onChange={setApplianceType}
            />
          )}
          <QuantitySelector
            inputId={`${slug}-qty`}
            value={quantity}
            onChange={setQuantity}
          />
        </div>

        <div className="mt-6 flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={handleAdd}
            disabled={cannotAdd}
            className="inline-flex items-center justify-center gap-2 bg-brandOrange text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 5h11l-1.4 7H4.5L3 5zM3 5L2 2H0" />
              <circle cx="6" cy="14" r="1" />
              <circle cx="12" cy="14" r="1" />
            </svg>
          </button>
          {justAdded && (
            <Link
              href="/shop/cart/"
              className="text-[13px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
            >
              ✓ Added — view cart →
            </Link>
          )}
        </div>
        {cannotAdd && (
          <p className="mt-3 text-[12px] text-gray-500">
            Select an appliance type to continue.
          </p>
        )}
      </div>
    </div>
  );
}
