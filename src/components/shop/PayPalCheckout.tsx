"use client";

/**
 * PayPal Smart Buttons wrapper for /shop/checkout/.
 *
 * Two-phase flow:
 *  1. createOrder builds purchase_units from cart + shippingFee. We pin
 *     shipping_preference to GET_FROM_FILE so PayPal fetches the buyer's
 *     stored address — we read that back in onApprove to detect the
 *     destination (Hawaii / mainland / international) and reconcile the
 *     fee we charged.
 *  2. onApprove captures, then runs three side-effects in order:
 *       a. detect the actual destination from the captured address.
 *          If it differs from what we charged, we still proceed —
 *          flagging the discrepancy in the notification email so the
 *          lab can refund/upcharge manually. (Catching it pre-capture
 *          would require server-side order patching — Phase 2.)
 *       b. send the lab notification email (Formspree). Failures here
 *          do not block the buyer — capture already succeeded.
 *       c. clearCart + router.push("/shop/thank-you/?orderId=…").
 *
 * forceReRender keys the SDK on subtotal+shippingFee+itemCount so
 * editing the cart on a stale tab doesn't ship the previous total.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useShopCart } from "@/contexts/ShopCartContext";
import type { ShippingDestination } from "@/components/shop/ShippingCalculator";
import {
  sendOrderNotification,
  type PayPalCaptureSummary,
} from "@/lib/orderNotification";

type Props = {
  shippingFee: number;
  /** Currently-selected destination tier so we can compare against the
   *  detected tier post-capture and flag mismatches in the email. */
  selectedDestination: ShippingDestination;
  /** Disable rendering when cart is empty / SDK failed to init.
   *  Buttons still mount but call onClick guard which aborts. */
  disabled?: boolean;
};

export default function PayPalCheckout({
  shippingFee,
  selectedDestination,
  disabled,
}: Props) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useShopCart();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const total = subtotal + shippingFee;
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  if (itemCount === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Add an item to your cart to continue with PayPal checkout.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {errorMsg}
        </div>
      )}
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
          height: 48,
        }}
        disabled={disabled}
        forceReRender={[total, itemCount, selectedDestination]}
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: total.toFixed(2),
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: subtotal.toFixed(2),
                    },
                    shipping: {
                      currency_code: "USD",
                      value: shippingFee.toFixed(2),
                    },
                  },
                },
                items: items.map((it) => ({
                  name: it.applianceType
                    ? `${it.name} — ${it.applianceType}`
                    : it.name,
                  quantity: it.quantity.toString(),
                  unit_amount: {
                    currency_code: "USD",
                    value: it.price.toFixed(2),
                  },
                  category: "PHYSICAL_GOODS",
                })),
              },
            ],
            application_context: {
              shipping_preference: "GET_FROM_FILE",
              brand_name: "ASO Hawaii",
              user_action: "PAY_NOW",
            },
          });
        }}
        onApprove={async (_data, actions) => {
          if (!actions.order) {
            setErrorMsg("Order capture unavailable. Please try again.");
            return;
          }
          try {
            const details = (await actions.order.capture()) as PayPalCaptureSummary;

            // TODO(Phase 2): surface destination-tier mismatch in the lab
            // notification email. Compare detectDestination() applied to
            // details.purchase_units[0].shipping.address against
            // selectedDestination; if they differ, extend
            // sendOrderNotification to accept the mismatch + selected tier
            // and emit a "TIER MISMATCH" line in the email body so the lab
            // can manually refund/upcharge before shipping. Today the
            // mismatch is silently dropped — capture still succeeds, but
            // the lab has no signal to reconcile fees.

            try {
              await sendOrderNotification(details, items, shippingFee);
            } catch (notifyErr) {
              // Don't fail the buyer flow — capture already succeeded.
              // eslint-disable-next-line no-console
              console.error("Order notification failed:", notifyErr);
            }

            const orderId = details.id ?? "";
            clearCart();
            router.push(
              `/shop/thank-you/?orderId=${encodeURIComponent(orderId)}`
            );
          } catch (err) {
            setErrorMsg(
              err instanceof Error
                ? `Capture failed: ${err.message}`
                : "Capture failed."
            );
          }
        }}
        onError={(err) => {
          // eslint-disable-next-line no-console
          console.error("PayPal error:", err);
          setErrorMsg(
            "Payment failed. Please try again or contact us at 808-957-0111."
          );
        }}
        onCancel={() => {
          setErrorMsg(null);
        }}
      />
    </div>
  );
}
