"use client";

import { findAppliance } from "@/data/appliances";
import ApplianceSelector from "./ApplianceSelector";
import ToothChart from "./ToothChart";
import type { ApplianceConfig, Arches, FormState } from "./types";

const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

type Props = {
  state: FormState;
  setState: (next: FormState) => void;
  /** When the user arrives via /submit-case?product=<slug>, this is the
   *  matching appliance id. The selector hides the rest of the
   *  catalogue behind a "See other products" button so the form opens
   *  focused on the product the user just clicked. */
  pinnedApplianceId?: string;
};

export default function Step2Appliance({
  state,
  setState,
  pinnedApplianceId,
}: Props) {
  function setArches(arches: Arches) {
    // When switching to a single-arch view, drop the unused arch's
    // selections so the form output stays consistent with the user's
    // last visible choice.
    let { upperAppliances, lowerAppliances, archSync } = state;
    if (arches === "upper") lowerAppliances = [];
    if (arches === "lower") upperAppliances = [];
    if (arches !== "both") archSync = false;
    setState({
      ...state,
      arches,
      archSync,
      upperAppliances,
      lowerAppliances,
    });
  }

  function setUpper(next: ApplianceConfig[]) {
    if (state.arches === "both" && state.archSync) {
      setState({ ...state, upperAppliances: next, lowerAppliances: next });
    } else {
      setState({ ...state, upperAppliances: next });
    }
  }
  function setLower(next: ApplianceConfig[]) {
    setState({ ...state, lowerAppliances: next });
  }
  function setArchSync(on: boolean) {
    if (on) {
      setState({
        ...state,
        archSync: true,
        lowerAppliances: state.upperAppliances,
      });
    } else {
      setState({ ...state, archSync: false });
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-2">
          Step 2 of 3
        </div>
        <h2 className="font-serif text-3xl text-navy leading-tight tracking-tightest">
          Appliance selection
        </h2>
        <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed">
          Pick which arch the case is for, then choose one or more appliances.
          Each appliance opens its own customisation panel.
        </p>
      </div>

      {/* Patient reference */}
      <div>
        <label htmlFor="p-patient" className={labelClass}>
          Patient Reference{" "}
          <span className="text-gray-400 normal-case tracking-normal">
            · optional
          </span>
        </label>
        <input
          id="p-patient"
          type="text"
          value={state.patient.reference}
          onChange={(e) =>
            setState({
              ...state,
              patient: { ...state.patient, reference: e.target.value },
            })
          }
          placeholder="Patient initials or chart number"
          className={inputClass}
          aria-describedby="p-patient-help"
        />
        <p
          id="p-patient-help"
          className="mt-2 text-[12px] text-gray-600 leading-snug"
        >
          <span aria-hidden>⚠️</span> Use initials or chart number only — avoid
          full patient names for HIPAA compliance.
        </p>
      </div>

      {/* Arch selector */}
      <div>
        <div className={labelClass}>Which arches?</div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "upper", label: "Upper only" },
              { id: "lower", label: "Lower only" },
              { id: "both", label: "Both arches" },
            ] as { id: Arches; label: string }[]
          ).map((opt) => {
            const checked = state.arches === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setArches(opt.id)}
                aria-pressed={checked}
                className={`rounded-lg border px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  checked
                    ? "border-navy bg-navy text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-navy"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {state.arches === "both" && (
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={state.archSync}
            onChange={(e) => setArchSync(e.target.checked)}
            className="mt-1 accent-navy"
          />
          <span className="text-[13.5px] text-gray-700 leading-snug">
            Use same appliance(s) for upper and lower
          </span>
        </label>
      )}

      {/* Tooth chart — moved up from Step 3 so the doctor can mark teeth
          BEFORE picking each appliance. Defaults to Range mode for the
          common case of marking a span. */}
      <section>
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
          Tooth chart
        </div>
        <ToothChart
          value={state.toothSelection}
          onChange={(next) => setState({ ...state, toothSelection: next })}
        />
      </section>

      {/* Upper */}
      {(state.arches === "upper" || state.arches === "both") && (
        <ApplianceSelector
          archLabel="Upper"
          selected={state.upperAppliances}
          onChange={setUpper}
          pinnedApplianceId={pinnedApplianceId}
          initiallyExpanded={Array.from(
            new Set(state.upperAppliances.map((c) => c.applianceId))
          )}
        />
      )}

      {/* Lower */}
      {(state.arches === "lower" || state.arches === "both") && (
        <ApplianceSelector
          archLabel="Lower"
          selected={state.lowerAppliances}
          onChange={setLower}
          readOnly={state.arches === "both" && state.archSync}
          pinnedApplianceId={pinnedApplianceId}
          initiallyExpanded={Array.from(
            new Set(state.lowerAppliances.map((c) => c.applianceId))
          )}
        />
      )}
    </div>
  );
}

export function step2IsValid(state: FormState): {
  ok: boolean;
  message?: string;
} {
  const upper = state.upperAppliances;
  const lower = state.lowerAppliances;
  const needsUpper = state.arches === "upper" || state.arches === "both";
  const needsLower = state.arches === "lower" || state.arches === "both";

  if (needsUpper && upper.length === 0)
    return { ok: false, message: "Select at least one upper appliance." };
  if (needsLower && lower.length === 0)
    return { ok: false, message: "Select at least one lower appliance." };

  // Required dynamic fields: each selected appliance with required fields
  // must have those filled in.
  function checkConfig(c: ApplianceConfig, label: string) {
    const a = findAppliance(c.applianceId);
    if (!a) return null;
    for (const f of a.fields) {
      if (!f.required) continue;
      const v = (c as Record<string, unknown>)[f.key];
      const empty =
        v === undefined ||
        v === "" ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        return `${label}: ${a.name} requires ${f.label.toLowerCase()}.`;
      }
    }
    return null;
  }

  for (const c of upper) {
    const err = checkConfig(c, "Upper");
    if (err) return { ok: false, message: err };
  }
  for (const c of lower) {
    const err = checkConfig(c, "Lower");
    if (err) return { ok: false, message: err };
  }
  return { ok: true };
}
