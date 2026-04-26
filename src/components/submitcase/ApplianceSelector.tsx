"use client";

import { useState } from "react";
import { APPLIANCES } from "@/data/appliances";
import { applianceItems } from "./applianceItems";
import ApplianceDetails from "./ApplianceDetails";
import {
  applianceConfigKey,
  type ApplianceConfig,
} from "./types";

type Props = {
  /** "Upper" or "Lower" — drives the heading. */
  archLabel: string;
  selected: ApplianceConfig[];
  onChange: (next: ApplianceConfig[]) => void;
  /** When true, the controls are disabled (used when archSync is on
   *  for the lower arch). */
  readOnly?: boolean;
  /** Initial set of expanded appliance ids — used by URL prefill so a
   *  ?product=...&item=... link auto-opens the right section. */
  initiallyExpanded?: string[];
};

export default function ApplianceSelector({
  archLabel,
  selected,
  onChange,
  readOnly = false,
  initiallyExpanded = [],
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(initiallyExpanded)
  );
  const selectedKeys = new Set(selected.map(applianceConfigKey));

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleParent(id: string) {
    if (readOnly) return;
    const key = id;
    if (selectedKeys.has(key)) {
      onChange(selected.filter((c) => applianceConfigKey(c) !== key));
    } else {
      onChange([...selected, { applianceId: id }]);
    }
  }

  function toggleSku(applianceId: string, code: string, name: string) {
    if (readOnly) return;
    const key = `${applianceId}:${code}`;
    if (selectedKeys.has(key)) {
      onChange(selected.filter((c) => applianceConfigKey(c) !== key));
    } else {
      onChange([
        ...selected,
        { applianceId, itemCode: code, itemName: name },
      ]);
    }
  }

  function updateConfig(key: string, next: ApplianceConfig) {
    onChange(
      selected.map((c) => (applianceConfigKey(c) === key ? next : c))
    );
  }

  function removeConfig(key: string) {
    onChange(selected.filter((c) => applianceConfigKey(c) !== key));
  }

  function selectedSkuCountFor(applianceId: string): number {
    return selected.filter(
      (c) => c.applianceId === applianceId && c.itemCode
    ).length;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium">
          {archLabel} appliance(s)
        </div>
        <div className="text-[11.5px] text-gray-500">
          {APPLIANCES.length} products · click to expand
        </div>
      </div>

      {readOnly ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-4 py-5 text-[13.5px] text-gray-600">
          Mirroring upper arch selection. Toggle off &quot;use same appliance
          for upper and lower&quot; to configure independently.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {APPLIANCES.map((a) => {
            const items = applianceItems(a.id);
            const hasItems = items.length > 0;
            const isOpen = expanded.has(a.id);
            const parentChecked = selectedKeys.has(a.id);
            const skuCount = selectedSkuCountFor(a.id);
            const totalChecked = parentChecked ? 1 : skuCount;

            // For appliances WITHOUT sub-items: render a flat checkbox row
            // (no expand/collapse — parent selection is the whole choice).
            if (!hasItems) {
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3 cursor-pointer transition-colors ${
                    parentChecked
                      ? "bg-navy/[0.03]"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={parentChecked}
                    onChange={() => toggleParent(a.id)}
                    className="accent-navy shrink-0"
                  />
                  <span className="text-[14px] text-navy leading-snug font-medium">
                    {a.name}
                  </span>
                  <span className="ml-auto text-[11px] uppercase tracking-widest text-gray-400">
                    no SKU subdivisions
                  </span>
                </label>
              );
            }

            // Appliance with SKUs — render a header that toggles open
            // and a sub-grid of SKU checkboxes when open.
            return (
              <div key={a.id}>
                <button
                  type="button"
                  onClick={() => toggleExpand(a.id)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center gap-3 text-left px-4 sm:px-5 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 ${
                    totalChecked > 0
                      ? "bg-brandOrange/[0.04]"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`inline-flex w-6 h-6 items-center justify-center text-gray-500 transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  >
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </span>
                  <span className="text-[14px] text-navy leading-snug font-medium">
                    {a.name}
                  </span>
                  <span className="ml-auto flex items-center gap-3">
                    {totalChecked > 0 && (
                      <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-widest bg-brandOrange/15 text-brandOrange px-2 py-0.5 rounded-full">
                        {totalChecked} selected
                      </span>
                    )}
                    <span className="text-[11.5px] text-gray-400">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 pt-1 bg-gray-50/40 border-t border-gray-100">
                    <label
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer mb-1 ${
                        parentChecked
                          ? "bg-white"
                          : "hover:bg-white/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={parentChecked}
                        onChange={() => toggleParent(a.id)}
                        className="accent-navy shrink-0"
                      />
                      <span className="text-[13px] text-gray-700 italic">
                        General inquiry — no specific SKU
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {items.map((it, i) => {
                        const code =
                          it.code ?? `__${a.id}_${i}__`; // synthetic key when codeless
                        const itemName = it.name;
                        const skuKey = `${a.id}:${code}`;
                        const checked = selectedKeys.has(skuKey);
                        return (
                          <label
                            key={skuKey}
                            className={`flex items-start gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors ${
                              checked
                                ? "bg-white border border-navy/20"
                                : "hover:bg-white/70 border border-transparent"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleSku(a.id, code, itemName)
                              }
                              className="mt-0.5 accent-navy shrink-0"
                            />
                            <span className="text-[13px] text-navy leading-snug">
                              {it.code && (
                                <span className="text-brandOrange font-semibold mr-1.5">
                                  {it.code}
                                </span>
                              )}
                              {itemName}
                              {it.note && (
                                <span className="block text-[11px] text-gray-500 mt-0.5">
                                  {it.note}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!readOnly && selected.length > 0 && (
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-gray-500">
            Configure each {archLabel.toLowerCase()} appliance
          </div>
          {selected.map((c) => {
            const key = applianceConfigKey(c);
            return (
              <ApplianceDetails
                key={key}
                config={c}
                onChange={(next) => updateConfig(key, next)}
                onRemove={() => removeConfig(key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
