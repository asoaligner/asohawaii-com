"use client";

import Link from "next/link";
import { useState } from "react";
import { OriginalForm, OrigField } from "@/components/OriginalForm";

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PickUpPage() {
  const [minDate] = useState(todayIso);
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Oahu · afternoon pickup
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Pick-up <span className="italic text-brandOrange">request.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Our driver covers Oahu, Monday–Friday, 1:00 pm – 4:00 pm. Pickups
              cannot be scheduled to a precise time — the driver arrives based
              on that day&apos;s route.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-20 md:pb-28 bg-white">
        <div className="container-narrow max-w-3xl">
          <div className="rounded-2xl border-l-4 border-brandOrange bg-brandOrange/5 p-6 md:p-7 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path d="M12 8v4M12 16h0" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-1">
                  Same-day after 12:00 pm
                </div>
                <p className="text-[15px] text-navy leading-relaxed">
                  For same-day pickup requests after 12:00 pm, please call{" "}
                  <a
                    href="tel:8089570111"
                    className="font-semibold underline underline-offset-2 hover:text-brandOrange transition-colors"
                  >
                    808-957-0111
                  </a>
                  . Form submissions after noon may not be picked up the same
                  day.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gray-50/60 border border-gray-200 p-7 sm:p-9">
            <OriginalForm
              formType="Pick-Up Request"
              submitLabel="Submit pick-up request"
              successBody="Our courier team will contact you to confirm the pickup window within one business day (or sooner if it's a same-day request phoned in)."
            >
              <OrigField
                id="pu-doc"
                name="doctor_name"
                label="Doctor's Name"
                required
              />
              <OrigField
                id="pu-prac"
                name="practice_name"
                label="Practice Name"
              />
              <OrigField
                id="pu-email"
                name="email"
                type="email"
                label="Email Address"
                required
                placeholder="Where we'll send the pickup confirmation"
              />
              <OrigField
                id="pu-addr"
                name="address"
                label="Address"
                required
                placeholder="Pickup street address"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OrigField
                  id="pu-phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  required
                />
                <OrigField
                  id="pu-date"
                  name="pickup_date"
                  type="date"
                  label="Pick-Up Date"
                  required
                  min={minDate}
                />
              </div>
              <OrigField
                id="pu-notes"
                name="notes"
                label="Notes"
                as="textarea"
                placeholder="Items to pick up, gate codes, special instructions…"
              />
            </OriginalForm>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-to-order"
              className="text-sm text-gray-500 hover:text-navy transition-colors"
            >
              ← How to order details
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
