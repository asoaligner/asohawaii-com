"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FORMSPREE_ENDPOINT, FORMSPREE_READY } from "@/data/config";

type Status = "idle" | "submitting" | "success" | "error";
type Item = "set" | "single";

const labelClass =
  "block text-xs uppercase tracking-widest text-gray-500 mb-2";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

export function OrderForm() {
  const params = useSearchParams();
  const initialItem: Item = params?.get("item") === "single" ? "single" : "set";

  const [item, setItem] = useState<Item>(initialItem);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("full_name") ?? "").trim() || "—";
    data.append("_formType", "Shop Order");
    data.set("_subject", `[Shop Order] - New Order Inquiry from ${name}`);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error ?? `Request failed (${res.status}).`);
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mb-6">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h3 className="font-serif text-3xl text-navy">
          Thank you for your order inquiry!
        </h3>
        <p className="mt-5 text-gray-600 leading-relaxed max-w-lg mx-auto">
          We&apos;ve received your request and will send you a secure payment
          link via email within 24 hours.
        </p>
        <p className="mt-3 text-[14.5px] text-gray-500 leading-relaxed max-w-lg mx-auto">
          For urgent inquiries, please call us at{" "}
          <a
            href="tel:8089570111"
            className="text-navy font-medium hover:text-brandOrange transition-colors"
          >
            808-957-0111
          </a>
          .
        </p>
        <div className="mt-9">
          <Link
            href="/shop/"
            className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 8H3M7 4L3 8l4 4" />
            </svg>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!FORMSPREE_READY && (
        <div className="text-[11px] text-brandOrange bg-brandOrange/5 border border-brandOrange/20 rounded-md px-3 py-2 tracking-wide">
          <span className="font-serif italic">dev notice</span> — set{" "}
          <code className="font-mono">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> to
          enable delivery to asohawaii@hotmail.com
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="o-name" className={labelClass}>
            Full Name <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="o-name"
            name="full_name"
            type="text"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="o-email" className={labelClass}>
            Email Address <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="o-email"
            name="email"
            type="email"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="o-country" className={labelClass}>
            Country <span className="text-brandOrange ml-1">*</span>
          </label>
          <select
            id="o-country"
            name="country"
            required
            defaultValue="United States"
            className={inputClass}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Japan">Japan</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other (specify in comments)</option>
          </select>
        </div>
        <div>
          <label htmlFor="o-phone" className={labelClass}>
            Phone Number{" "}
            <span className="text-gray-400 normal-case tracking-normal">
              · optional
            </span>
          </label>
          <input
            id="o-phone"
            name="phone"
            type="tel"
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>
          Order Selection <span className="text-brandOrange ml-1">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: "set" as Item,
              title: "Complete Set",
              sub: "Set of 5 in acrylic case",
              price: "$220",
            },
            {
              key: "single" as Item,
              title: "Individual Model",
              sub: "One miniature, your choice",
              price: "$48",
            },
          ].map((opt) => {
            const checked = item === opt.key;
            return (
              <label
                key={opt.key}
                className={`flex items-start gap-3 cursor-pointer rounded-xl border px-4 py-4 transition-colors ${
                  checked
                    ? "border-navy bg-navy/[0.03]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="order_selection"
                  value={opt.key === "set" ? "Complete Set ($220)" : "Individual Model ($48)"}
                  checked={checked}
                  onChange={() => setItem(opt.key)}
                  required
                  className="mt-1 accent-navy"
                />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-navy text-[15px]">
                      {opt.title}
                    </span>
                    <span className="font-serif text-brandOrange text-lg">
                      {opt.price}
                    </span>
                  </div>
                  <div className="text-[13px] text-gray-500 mt-0.5">
                    {opt.sub}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="o-qty" className={labelClass}>
            Quantity <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="o-qty"
            name="quantity"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required
            className={inputClass}
          />
        </div>
        {item === "single" && (
          <div>
            <label htmlFor="o-color" className={labelClass}>
              Color Preference{" "}
              <span className="text-brandOrange ml-1">*</span>
            </label>
            <select
              id="o-color"
              name="color_preference"
              required
              className={inputClass}
              defaultValue=""
            >
              <option value="" disabled>
                Choose a color…
              </option>
              <option value="Blue (Functional appliance)">
                Blue (Functional appliance)
              </option>
              <option value="Green (Plate type)">Green (Plate type)</option>
              <option value="Yellow (Expander)">Yellow (Expander)</option>
              <option value="Clear (Hawley retainer)">
                Clear (Hawley retainer)
              </option>
              <option value="White (Plaster only)">
                White (Plaster only)
              </option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="o-ship" className={labelClass}>
          Shipping Address <span className="text-brandOrange ml-1">*</span>
        </label>
        <textarea
          id="o-ship"
          name="shipping_address"
          required
          rows={4}
          placeholder="Street address, City, State, ZIP/Postal Code, Country"
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="o-comments" className={labelClass}>
          Special Requests / Comments{" "}
          <span className="text-gray-400 normal-case tracking-normal">
            · optional
          </span>
        </label>
        <textarea
          id="o-comments"
          name="comments"
          rows={3}
          placeholder="Gift wrapping, custom messages, bulk orders, etc."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="o-source" className={labelClass}>
          How did you hear about us?{" "}
          <span className="text-gray-400 normal-case tracking-normal">
            · optional
          </span>
        </label>
        <select
          id="o-source"
          name="referral_source"
          defaultValue=""
          className={inputClass}
        >
          <option value="">Select…</option>
          <option value="Google Search">Google Search</option>
          <option value="Instagram">Instagram</option>
          <option value="Referred by dental clinic">
            Referred by dental clinic
          </option>
          <option value="Word of mouth">Word of mouth</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
        <input
          type="checkbox"
          name="newsletter_optin"
          value="Yes"
          className="mt-1 accent-navy"
        />
        <span className="text-[14px] text-gray-700 leading-snug">
          Yes, I&apos;d like to receive updates about new ASO products.
        </span>
      </label>

      {status === "error" && errorMsg && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center gap-2 bg-navy text-white font-medium px-6 py-3.5 rounded-full hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Submitting…" : "Submit Order Inquiry"}
        {status !== "submitting" && (
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        )}
      </button>
      <p className="text-[12.5px] text-gray-500 text-center leading-relaxed">
        This is an inquiry — no payment is taken at this step. We&apos;ll email
        you a secure payment link within 24 hours.
      </p>
    </form>
  );
}
