"use client";

import type { FormState } from "./types";

const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

type Props = {
  state: FormState;
  setState: (next: FormState) => void;
};

export default function Step1Practice({ state, setState }: Props) {
  function update<K extends keyof FormState["practice"]>(
    key: K,
    value: FormState["practice"][K]
  ) {
    setState({ ...state, practice: { ...state.practice, [key]: value } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-navy leading-tight tracking-tightest">
          Practice information
        </h2>
        <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed">
          Tell us who&apos;s submitting. We&apos;ll reply at the email below
          within 1 business day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="p-practice" className={labelClass}>
            Practice / Clinic Name <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="p-practice"
            type="text"
            required
            aria-required
            value={state.practice.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="p-doctor" className={labelClass}>
            Doctor&apos;s Name <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="p-doctor"
            type="text"
            required
            aria-required
            value={state.practice.doctor}
            onChange={(e) => update("doctor", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="p-email" className={labelClass}>
            Email Address <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="p-email"
            type="email"
            required
            aria-required
            value={state.practice.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="p-phone" className={labelClass}>
            Phone Number <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="p-phone"
            type="tel"
            required
            aria-required
            value={state.practice.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
        <input
          type="checkbox"
          checked={state.practice.easyRxUser}
          onChange={(e) => update("easyRxUser", e.target.checked)}
          className="mt-1 accent-navy"
        />
        <span className="text-[14px] text-gray-700 leading-snug">
          Yes, I have an EasyRx account
        </span>
      </label>
      {state.practice.easyRxUser && (
        <div className="rounded-md bg-brandOrange/5 border border-brandOrange/20 px-4 py-3 text-[13px] text-gray-700 leading-relaxed">
          <span className="font-medium text-navy">Tip:</span> EasyRx submissions
          are faster end-to-end and give you full case traceability. This
          form is great when you want to send a one-off without logging in.
        </div>
      )}
    </div>
  );
}

export function step1IsValid(state: FormState): boolean {
  const { name, doctor, email, phone } = state.practice;
  return (
    name.trim() !== "" &&
    doctor.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    /\S+@\S+\.\S+/.test(email)
  );
}
