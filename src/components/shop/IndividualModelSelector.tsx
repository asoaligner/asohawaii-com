"use client";

import type { ApplianceType } from "@/contexts/ShopCartContext";

const APPLIANCE_TYPES: ApplianceType[] = [
  "Clear Retainer",
  "Wrap-around Retainer",
  "Nance Holding Arch",
  "Lingual Arch",
  "Expansion Plate",
];

type Props = {
  value: ApplianceType | null;
  onChange: (next: ApplianceType) => void;
  inputId?: string;
};

export default function IndividualModelSelector({
  value,
  onChange,
  inputId,
}: Props) {
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
      >
        Appliance type <span className="text-brandOrange ml-1">*</span>
      </label>
      <select
        id={inputId}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as ApplianceType)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors"
      >
        <option value="" disabled>
          Choose an appliance…
        </option>
        {APPLIANCE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
