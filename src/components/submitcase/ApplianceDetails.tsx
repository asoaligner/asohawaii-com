"use client";

import Image from "next/image";
import { useState } from "react";
import { findAppliance, type ApplianceField } from "@/data/appliances";
import ClaspPanel from "./ClaspPanel";
import ColorPicker from "./ColorPicker";
import StickerPicker from "./StickerPicker";
import ToothChart from "./ToothChart";
import {
  EMPTY_CLASPS,
  type ApplianceConfig,
  type ClaspSelections,
  type ClaspType,
  type ColorChoice,
  type ToothSelection,
} from "./types";

/**
 * Per-SKU field gate. Returns true if the field should be rendered for
 * the currently configured SKU. Used to hide mouthguard_color on
 * non-Sports Press-Type SKUs and to suppress any other SKU-specific
 * fields without splitting the schema.
 */
function isFieldVisible(
  field: ApplianceField,
  config: ApplianceConfig
): boolean {
  if (
    config.applianceId === "press_type" &&
    field.type === "mouthguard_color"
  ) {
    const name = config.itemName ?? "";
    return name.toLowerCase().startsWith("sports mouthguard");
  }
  return true;
}

type Props = {
  config: ApplianceConfig;
  onChange: (next: ApplianceConfig) => void;
  onRemove: () => void;
  /** Case-level tooth selection rendered at the top of every expanded
   *  appliance panel — the same state is shared across panels so editing
   *  in one reflects everywhere. Per the 2026-05-12 UX iteration:
   *  embedded here (small, in-panel) rather than as a separate Step 2
   *  section or Step 3 header. */
  toothSelection: ToothSelection;
  onToothSelectionChange: (next: ToothSelection) => void;
  /** Which arch this details panel lives in (the parent ApplianceSelector
   *  is single-arch). The embedded ToothChart hides the other arch so
   *  upper retainers don't show lower teeth and vice versa. */
  arch?: "upper" | "lower";
};

const labelClass =
  "block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

function hasAnyClaspData(c: ApplianceConfig): boolean {
  const cs = c.clasps;
  return (
    !!cs &&
    (cs.labial_bow.length > 0 ||
      cs.adams.length > 0 ||
      cs.ball_clasp.length > 0 ||
      cs.c_clasp.length > 0)
  );
}

export default function ApplianceDetails({
  config,
  onChange,
  onRemove,
  toothSelection,
  onToothSelectionChange,
  arch,
}: Props) {
  const appliance = findAppliance(config.applianceId);
  // Active clasp lives in component state — it's purely a UI cursor
  // ("which clasp do my clicks edit right now?") and doesn't need to
  // survive form serialization. The actual per-clasp tooth lists live
  // in config.clasps which is part of FormState.
  const [activeClasp, setActiveClasp] = useState<ClaspType | null>(null);
  // Doctors on non-Hawley-style appliances (ASO Aligner, Band Appliance,
  // etc.) don't need the clasp picker. Default visible so the feature
  // is discoverable; once dismissed the panel hides for this appliance
  // instance and any clasp data is dropped. Reordering an old case
  // that already has clasp data keeps the panel open.
  const [claspsDismissed, setClaspsDismissed] = useState(false);
  if (!appliance) return null;

  const claspSelections = config.clasps ?? EMPTY_CLASPS;
  // Only Hawley-style appliances and removable dentures get the clasp
  // picker — aligners / bands / splints / IDB / etc. don't carry clasps.
  // The schema flag is the source of truth (set per-appliance in
  // src/data/appliances.ts) so adding new clasp-bearing appliances
  // doesn't require a code change here.
  const claspsSupported = appliance.supportsClasps === true;
  const showClaspPanel =
    claspsSupported && (!claspsDismissed || hasAnyClaspData(config));
  function setClaspTeeth(type: ClaspType, next: string[]) {
    const current = config.clasps ?? EMPTY_CLASPS;
    const updated: ClaspSelections = { ...current, [type]: next };
    onChange({ ...config, clasps: updated });
  }
  function clearClasp(type: ClaspType) {
    setClaspTeeth(type, []);
    if (activeClasp === type) setActiveClasp(null);
  }
  function updateClaspOptions(partial: Partial<ClaspSelections>) {
    const current = config.clasps ?? EMPTY_CLASPS;
    onChange({ ...config, clasps: { ...current, ...partial } });
  }
  function dismissClasps() {
    // Drop the structured clasps payload entirely so submissions don't
    // carry phantom data after the doctor has explicitly opted out.
    const { clasps: _drop, ...rest } = config;
    void _drop;
    onChange(rest);
    setActiveClasp(null);
    setClaspsDismissed(true);
  }
  function restoreClasps() {
    setClaspsDismissed(false);
  }

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
            <div className="grid grid-cols-2 gap-2">
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
      case "splint_thickness":
        return (
          <div key={field.key}>
            <div className={labelClass}>{field.label}</div>
            <div className="flex flex-wrap gap-2">
              {(field.options ?? []).map((opt) => {
                const checked = config.splint_thickness === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("splint_thickness", opt)}
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
      case "canine_guidance":
        return (
          <div key={field.key}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.canine_guidance ?? false}
                onChange={(e) =>
                  update("canine_guidance", e.target.checked)
                }
                className="accent-navy"
              />
              <span className="text-[13.5px] text-navy leading-snug">
                {field.label}
              </span>
            </label>
          </div>
        );
      case "mouthguard_color":
        return (
          <div key={field.key}>
            <div className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/40 p-3 mb-3">
              <Image
                src="/images/aso/press-type/sports-mouthguard-colors.png"
                alt="Sports mouthguard color reference"
                width={1280}
                height={920}
                sizes="(max-width: 768px) 100vw, 480px"
                className="w-full h-auto rounded"
              />
              <p className="mt-2 text-[11.5px] text-gray-500 leading-snug">
                Reference photo. Pick the closest swatch — patterns
                (e.g. Red / White / Blue) come laminated.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(field.options ?? []).map((opt) => {
                const checked = config.mouthguard_color === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      update("mouthguard_color", checked ? undefined : opt)
                    }
                    aria-pressed={checked}
                    className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${
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
            {field.description && (
              <p className="-mt-1 mb-2 text-[12.5px] text-gray-600 leading-snug">
                {field.description}
              </p>
            )}
            <textarea
              value={config.free_text ?? ""}
              onChange={(e) => update("free_text", e.target.value)}
              rows={field.description ? 3 : 2}
              placeholder={field.hint ?? ""}
              required={field.required}
              className={`${inputClass} resize-y`}
            />
          </div>
        );
      case "package_type":
      case "print_form":
      case "denture_type": {
        const valueKey = field.type as
          | "package_type"
          | "print_form"
          | "denture_type";
        const current = config[valueKey] ?? "";
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
                const checked = current === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update(valueKey, opt)}
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
      }
      case "denture_stages": {
        const selected = config.denture_stages ?? [];
        return (
          <div key={field.key}>
            <div className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(field.options ?? []).map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-[13px] transition-colors ${
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
                          "denture_stages",
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
      case "shade_color":
        return (
          <div key={field.key}>
            <label className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </label>
            <input
              type="text"
              value={config.shade_color ?? ""}
              onChange={(e) => update("shade_color", e.target.value)}
              placeholder={field.hint ?? ""}
              required={field.required}
              className={inputClass}
            />
          </div>
        );
      case "tooth_position":
        return (
          <div key={field.key}>
            <label className={labelClass}>
              {field.label}
              {field.required && (
                <span className="text-brandOrange ml-1">*</span>
              )}
            </label>
            <input
              type="text"
              value={config.tooth_position ?? ""}
              onChange={(e) => update("tooth_position", e.target.value)}
              placeholder={field.hint ?? ""}
              required={field.required}
              className={inputClass}
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
            {config.itemCode && (
              <span className="ml-2 inline-flex items-center text-[11px] font-semibold uppercase tracking-widest bg-brandOrange/15 text-brandOrange px-2 py-0.5 rounded-full align-middle">
                {config.itemCode}
              </span>
            )}
          </div>
          <div className="text-[12.5px] text-gray-500 leading-snug mt-0.5">
            {config.itemName ?? appliance.description}
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

      {/* Fields render in their declared order with the tooth chart
          spliced in directly after the stickers row (so Color and
          Stickers — the "visual identity" fields — come first, then
          tooth selection, then the appliance-specific variant /
          wires / size / etc. fields). If the appliance has no
          stickers field the chart drops to the very end. */}
      <div className="space-y-4">
        {(() => {
          const visible = appliance.fields.filter((f) =>
            isFieldVisible(f, config),
          );
          const stickersIdx = visible.findIndex((f) => f.type === "stickers");
          const toothChartNode = (
            <div key="tooth-chart">
              <div className="flex items-center gap-3 mb-1.5">
                <div className={labelClass + " !mb-0"}>Teeth involved</div>
                {claspsSupported && !showClaspPanel && (
                  <button
                    type="button"
                    onClick={restoreClasps}
                    className="text-[12px] text-navy hover:text-brandOrange underline underline-offset-2 transition-colors"
                  >
                    + Add clasps
                  </button>
                )}
              </div>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
                <div className="flex-1 min-w-0">
                  <ToothChart
                    value={toothSelection}
                    onChange={onToothSelectionChange}
                    arch={arch}
                    claspSelections={showClaspPanel ? claspSelections : undefined}
                    activeClasp={showClaspPanel ? activeClasp : null}
                    onClaspChange={showClaspPanel ? setClaspTeeth : undefined}
                  />
                </div>
                {showClaspPanel && (
                  <div className="shrink-0">
                    <ClaspPanel
                      value={claspSelections}
                      active={activeClasp}
                      onActiveChange={setActiveClasp}
                      onClear={clearClasp}
                      dentition={toothSelection.dentition}
                      arch={arch}
                      onOptionChange={updateClaspOptions}
                      onDismiss={dismissClasps}
                    />
                  </div>
                )}
              </div>
            </div>
          );
          const nodes: React.ReactNode[] = [];
          visible.forEach((field, i) => {
            nodes.push(renderField(field));
            if (i === stickersIdx) {
              nodes.push(toothChartNode);
            }
          });
          if (stickersIdx === -1) {
            nodes.push(toothChartNode);
          }
          return nodes;
        })()}
      </div>
    </div>
  );
}
