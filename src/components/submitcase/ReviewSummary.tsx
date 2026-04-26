"use client";

import { findAppliance } from "@/data/appliances";
import { findColor } from "@/data/colors";
import { findSticker } from "@/data/stickers";
import type { ApplianceConfig, FormState } from "./types";

type Props = {
  state: FormState;
};

function summarizeColor(c: ApplianceConfig["color"]): string {
  if (!c || c.primary === undefined) return "—";
  const ids = [c.primary, c.secondary, c.tertiary].filter(
    (v): v is number => typeof v === "number"
  );
  const names = ids
    .map((id) => findColor(id))
    .filter((c): c is NonNullable<ReturnType<typeof findColor>> => !!c)
    .map((c) => `#${c.id} ${c.name}`)
    .join(" / ");
  return c.type === "solid" ? names : `${names} (${c.type})`;
}

function summarizeStickers(ids: number[] | undefined): string {
  if (!ids || ids.length === 0) return "—";
  return ids
    .map((id) => {
      const s = findSticker(id);
      return s ? `#${s.id} ${s.name}` : null;
    })
    .filter(Boolean)
    .join(", ");
}

function ApplianceLine({ config }: { config: ApplianceConfig }) {
  const a = findAppliance(config.applianceId);
  if (!a) return null;
  const lines: { label: string; value: string }[] = [];
  for (const f of a.fields) {
    let v: string;
    switch (f.type) {
      case "color":
        v = summarizeColor(config.color);
        break;
      case "stickers":
        v = summarizeStickers(config.stickers);
        break;
      case "metal_components":
        v = (config.metal_components ?? []).join(", ") || "—";
        break;
      case "free_text":
        v = config.free_text?.trim() || "—";
        break;
      default:
        v =
          (config[f.key as keyof ApplianceConfig] as string | undefined) ??
          "—";
    }
    if (v === "—") continue;
    lines.push({ label: f.label, value: v });
  }
  return (
    <div className="rounded-lg bg-gray-50/60 border border-gray-200 px-3.5 py-3">
      <div className="font-serif text-[15px] text-navy leading-snug">
        {a.name}
      </div>
      {lines.length > 0 && (
        <dl className="mt-2 space-y-0.5 text-[12.5px]">
          {lines.map((l) => (
            <div key={l.label} className="flex gap-2">
              <dt className="w-32 shrink-0 text-gray-500">{l.label}</dt>
              <dd className="text-gray-700 break-words">{l.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function ReviewSummary({ state }: Props) {
  const totalUpper = state.upperAppliances.length;
  const totalLower = state.lowerAppliances.length;
  const totalFiles =
    state.files.stl.length +
    state.files.photos.length +
    state.files.rxPdf.length;

  function teethList(arr: string[]): string {
    if (arr.length === 0) return "—";
    return arr
      .slice()
      .sort()
      .map((id) => {
        const arch = id[0] === "U" ? "Upper" : "Lower";
        return `${arch} ${id.slice(1)}`;
      })
      .join(", ");
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-5">
      <div>
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-2">
          Review
        </div>
        <h3 className="font-serif text-xl text-navy leading-tight tracking-tightest">
          Confirm your submission
        </h3>
        <p className="text-[12.5px] text-gray-500 mt-1">
          Use the back buttons above to edit any section.
        </p>
      </div>

      <section>
        <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
          Practice
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-gray-700">
          <div className="flex gap-2">
            <dt className="w-20 text-gray-500 shrink-0">Practice</dt>
            <dd>{state.practice.name || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 text-gray-500 shrink-0">Doctor</dt>
            <dd>{state.practice.doctor || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 text-gray-500 shrink-0">Email</dt>
            <dd className="break-all">{state.practice.email || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 text-gray-500 shrink-0">Phone</dt>
            <dd>{state.practice.phone || "—"}</dd>
          </div>
          {state.practice.easyRxUser && (
            <div className="flex gap-2 sm:col-span-2">
              <dt className="w-20 text-gray-500 shrink-0">EasyRx</dt>
              <dd>Account confirmed</dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
          Patient
        </div>
        <div className="text-[13px] text-gray-700">
          {state.patient.reference?.trim() || "—"}{" "}
          <span className="text-gray-400">
            · {state.arches} arch{state.arches === "both" ? "es" : ""}
          </span>
        </div>
      </section>

      {totalUpper > 0 && (
        <section>
          <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
            Upper appliance(s) — {totalUpper}
          </div>
          <div className="space-y-2">
            {state.upperAppliances.map((c) => (
              <ApplianceLine key={`u-${c.applianceId}`} config={c} />
            ))}
          </div>
        </section>
      )}

      {totalLower > 0 && (
        <section>
          <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
            Lower appliance(s) — {totalLower}
            {state.archSync && (
              <span className="ml-2 text-[10px] text-brandOrange">
                (mirrored from upper)
              </span>
            )}
          </div>
          <div className="space-y-2">
            {state.lowerAppliances.map((c) => (
              <ApplianceLine key={`l-${c.applianceId}`} config={c} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
          Tooth selection ({state.toothSelection.dentition})
        </div>
        <div className="text-[13px] text-gray-700 space-y-0.5">
          <div>
            <span className="text-gray-500 mr-2">Upper:</span>
            {teethList(state.toothSelection.upper)}
          </div>
          <div>
            <span className="text-gray-500 mr-2">Lower:</span>
            {teethList(state.toothSelection.lower)}
          </div>
        </div>
      </section>

      <section>
        <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
          Files — {totalFiles}
        </div>
        <ul className="text-[13px] text-gray-700 space-y-0.5 list-disc list-inside">
          {state.files.stl.map((f, i) => (
            <li key={`stl-${i}`}>{f.name} (STL)</li>
          ))}
          {state.files.photos.map((f, i) => (
            <li key={`ph-${i}`}>{f.name} (photo)</li>
          ))}
          {state.files.rxPdf.map((f, i) => (
            <li key={`pdf-${i}`}>{f.name} (Rx PDF)</li>
          ))}
          {totalFiles === 0 && (
            <li className="text-gray-400 list-none">No files attached.</li>
          )}
        </ul>
      </section>

      <section>
        <div className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-2">
          Delivery
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-gray-700">
          <div className="flex gap-2">
            <dt className="w-20 text-gray-500 shrink-0">Due</dt>
            <dd>{state.delivery.dueDate || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 text-gray-500 shrink-0">Method</dt>
            <dd>{state.delivery.method}</dd>
          </div>
          {state.delivery.method !== "Pickup" &&
            state.delivery.address.trim() && (
              <div className="flex gap-2 sm:col-span-2">
                <dt className="w-20 text-gray-500 shrink-0">Ship to</dt>
                <dd className="whitespace-pre-line">
                  {state.delivery.address}
                </dd>
              </div>
            )}
          {state.delivery.instructions.trim() && (
            <div className="flex gap-2 sm:col-span-2">
              <dt className="w-20 text-gray-500 shrink-0">Notes</dt>
              <dd className="whitespace-pre-line">
                {state.delivery.instructions}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
