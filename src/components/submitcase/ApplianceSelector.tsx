"use client";

import { APPLIANCES, APPLIANCE_CATEGORIES } from "@/data/appliances";
import ApplianceDetails from "./ApplianceDetails";
import type { ApplianceConfig } from "./types";

type Props = {
  /** "Upper" or "Lower" — drives the heading. */
  archLabel: string;
  selected: ApplianceConfig[];
  onChange: (next: ApplianceConfig[]) => void;
  /** When true, the controls are disabled (used when archSync is on
   *  for the lower arch). */
  readOnly?: boolean;
};

export default function ApplianceSelector({
  archLabel,
  selected,
  onChange,
  readOnly = false,
}: Props) {
  const selectedIds = new Set(selected.map((c) => c.applianceId));

  function toggle(id: string) {
    if (readOnly) return;
    if (selectedIds.has(id)) {
      onChange(selected.filter((c) => c.applianceId !== id));
    } else {
      onChange([...selected, { applianceId: id }]);
    }
  }

  function updateConfig(applianceId: string, next: ApplianceConfig) {
    onChange(
      selected.map((c) => (c.applianceId === applianceId ? next : c))
    );
  }

  function removeConfig(applianceId: string) {
    onChange(selected.filter((c) => c.applianceId !== applianceId));
  }

  return (
    <div className="space-y-5">
      <div className="text-xs uppercase tracking-widest text-brandOrange font-medium">
        {archLabel} appliance(s)
      </div>

      {readOnly ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-4 py-5 text-[13.5px] text-gray-600">
          Mirroring upper arch selection. Toggle off &quot;use same appliance
          for upper and lower&quot; to configure independently.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-5">
          {APPLIANCE_CATEGORIES.map((cat) => {
            const inCat = APPLIANCES.filter((a) => a.category === cat.id);
            return (
              <div key={cat.id}>
                <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2.5">
                  {cat.label}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inCat.map((a) => {
                    const checked = selectedIds.has(a.id);
                    return (
                      <label
                        key={a.id}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                          checked
                            ? "border-navy bg-navy/[0.03]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(a.id)}
                          className="mt-0.5 accent-navy shrink-0"
                        />
                        <span className="text-[13.5px] text-navy leading-snug">
                          {a.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
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
          {selected.map((c) => (
            <ApplianceDetails
              key={c.applianceId}
              config={c}
              onChange={(next) => updateConfig(c.applianceId, next)}
              onRemove={() => removeConfig(c.applianceId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
