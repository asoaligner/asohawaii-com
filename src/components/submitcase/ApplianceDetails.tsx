"use client";

import { findAppliance, type ApplianceField } from "@/data/appliances";
import ColorPicker from "./ColorPicker";
import StickerPicker from "./StickerPicker";
import type { ApplianceConfig, ColorChoice } from "./types";

type Props = {
  config: ApplianceConfig;
  onChange: (next: ApplianceConfig) => void;
  onRemove: () => void;
};

const labelClass =
  "block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

export default function ApplianceDetails({ config, onChange, onRemove }: Props) {
  const appliance = findAppliance(config.applianceId);
  if (!appliance) return null;

  function update<K extends keyof ApplianceConfig>(
    key: K,
    value: ApplianceConfig[K]
  ) {
    onChange({ ...config, [key]: value });
  }

  function renderField(field: ApplianceField) {
    switch (field.type) {
      case "color":
        return (
          <div key={field.key}>
            <div className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </div>
            <ColorPicker
              value={config.color}
              onChange={(c: ColorChoice | undefined) => update("color", c)}
            />
          </div>
        );
      case "stickers":
        return (
          <div key={field.key}>
            <div className={labelClass}>{field.label}</div>
            <StickerPicker
              value={config.stickers ?? []}
              onChange={(ids) => update("stickers", ids)}
            />
          </div>
        );
      case "material":
        return (
          <div key={field.key}>
            <label className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </label>
            <select
              value={config.material ?? ""}
              onChange={(e) => update("material", e.target.value || undefined)}
              required={field.required}
              className={inputClass}
            >
              <option value="">Select material…</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      case "rpe_size":
        return (
          <div key={field.key}>
            <div className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(field.options ?? []).map((opt) => {
                const checked = config.rpe_size === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("rpe_size", opt)}
                    aria-pressed={checked}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                      checked
                        ? "bg-navy text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-navy"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "metal_components": {
        const selected = config.metal_components ?? [];
        return (
          <div key={field.key}>
            <div className={labelClass}>{field.label}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(field.options ?? []).map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-[13px] transition-colors ${
                      checked
                        ? "border-navy bg-navy/[0.03] text-navy"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        update(
                          "metal_components",
                          checked
                            ? selected.filter((s) => s !== opt)
                            : [...selected, opt]
                        )
                      }
                      className="accent-navy"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        );
      }
      case "activation":
        return (
          <div key={field.key}>
            <div className={labelClass}>{field.label}</div>
            <div className="flex flex-wrap gap-2">
              {(field.options ?? []).map((opt) => {
                const checked = config.activation === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("activation", opt)}
                    aria-pressed={checked}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                      checked
                        ? "bg-navy text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-navy"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "free_text":
        return (
          <div key={field.key}>
            <label className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </label>
            <textarea
              value={config.free_text ?? ""}
              onChange={(e) => update("free_text", e.target.value)}
              rows={2}
              placeholder={field.hint ?? ""}
              required={field.required}
              className={`${inputClass} resize-y`}
            />
          </div>
        );
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="font-serif text-base sm:text-lg text-navy leading-snug">
            {appliance.name}
          </div>
          <div className="text-[12.5px] text-gray-500 leading-snug mt-0.5">
            {appliance.description}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${appliance.name}`}
          className="text-gray-400 hover:text-red-600 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {appliance.fields.map((f) => renderField(f))}
      </div>
    </div>
  );
}
