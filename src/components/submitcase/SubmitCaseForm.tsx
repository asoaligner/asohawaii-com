"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { findAppliance } from "@/data/appliances";
import { findColor } from "@/data/colors";
import { FORMSPREE_ENDPOINT, FORMSPREE_READY } from "@/data/config";
import { productCatalog } from "@/data/product-catalog";
import { findSticker } from "@/data/stickers";
import Step1Practice, { step1IsValid } from "./Step1Practice";
import Step2Appliance, { step2IsValid } from "./Step2Appliance";
import Step3FilesDelivery, { step3IsValid } from "./Step3FilesDelivery";
import StepIndicator from "./StepIndicator";
import {
  INITIAL_FORM_STATE,
  type ApplianceConfig,
  type FormState,
} from "./types";

/** Best-effort mapping from product slug → appliance id used by the
 *  Stage A form. Lets `?product=<catalog-slug>` URLs preselect a row.
 *  Keys here mirror the slugs in src/data/product-catalog.ts; values
 *  are the appliance ids in src/data/appliances.ts. */
const SLUG_TO_APPLIANCE_ID: Record<string, string> = {
  "plate-type-retainer-expansion": "plate_type_retainer",
  "plate-expansion": "plate_expansion",
  "band-appliance": "band_appliance",
  "aso-aligner": "aso_aligner",
  "flat-occlusal-splint": "flat_splint",
  "lingual-retainer": "lingual_retainer",
  "invisible-retainer": "invisible_retainer",
  "study-model": "study_model",
  "functional-appliances": "functional",
  idb: "idb",
  "press-type-appliance": "press_type",
  "sleep-apnea": "sleep_apnea",
  "digital-print-only-service": "digital_print",
  "flipper-immediate-denture": "flipper",
};

type Status = "idle" | "submitting" | "success" | "error";
type Step = 1 | 2 | 3;

function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ASO-${ts}-${rand}`;
}

function describeColor(c: NonNullable<ApplianceConfig["color"]>): string {
  const ids = [c.primary, c.secondary, c.tertiary].filter(
    (v): v is number => typeof v === "number"
  );
  const names = ids
    .map((id) => findColor(id))
    .filter((c): c is NonNullable<ReturnType<typeof findColor>> => !!c)
    .map((c) => `#${c.id} ${c.name}`)
    .join(" / ");
  return c.type === "solid" ? names : `${names} [${c.type}]`;
}

function describeStickers(ids: number[]): string {
  return ids
    .map((id) => {
      const s = findSticker(id);
      return s ? `#${s.id} ${s.name}` : null;
    })
    .filter(Boolean)
    .join(", ");
}

function appliancesToText(arr: ApplianceConfig[], label: string): string {
  if (arr.length === 0) return "";
  const lines: string[] = [`${label}:`];
  for (const c of arr) {
    const a = findAppliance(c.applianceId);
    if (!a) continue;
    const skuPart = c.itemCode
      ? ` — ${c.itemCode}${c.itemName ? ` ${c.itemName}` : ""}`
      : c.itemName
        ? ` — ${c.itemName}`
        : "";
    lines.push(`  - ${a.name}${skuPart}`);
    if (c.color?.primary !== undefined)
      lines.push(`    Color: ${describeColor(c.color)}`);
    if (c.stickers && c.stickers.length > 0)
      lines.push(`    Stickers: ${describeStickers(c.stickers)}`);
    if (c.package_type) lines.push(`    Package: ${c.package_type}`);
    if (c.material) lines.push(`    Material: ${c.material}`);
    if (c.print_form) lines.push(`    Form: ${c.print_form}`);
    if (c.denture_type) lines.push(`    Denture type: ${c.denture_type}`);
    if (c.denture_stages && c.denture_stages.length > 0)
      lines.push(`    Stage(s): ${c.denture_stages.join(", ")}`);
    if (c.tooth_position?.trim())
      lines.push(`    Position: ${c.tooth_position.trim()}`);
    if (c.shade_color?.trim())
      lines.push(`    Shade: ${c.shade_color.trim()}`);
    if (c.rpe_size) lines.push(`    Size: ${c.rpe_size}`);
    if (c.metal_components && c.metal_components.length > 0)
      lines.push(`    Metal: ${c.metal_components.join(", ")}`);
    if (c.activation) lines.push(`    Activation: ${c.activation}`);
    if (c.splint_thickness)
      lines.push(`    Bite thickness: ${c.splint_thickness}`);
    if (c.canine_guidance) lines.push(`    Canine guidance: Yes`);
    if (c.free_text?.trim())
      lines.push(`    Notes: ${c.free_text.trim()}`);
  }
  return lines.join("\n");
}

export function SubmitCaseForm() {
  const params = useSearchParams();
  const [state, setState] = useState<FormState>(INITIAL_FORM_STATE);
  const [step, setStep] = useState<Step>(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");
  const [submittedDoctor, setSubmittedDoctor] = useState<string>("");

  // Preselect appliance(s) from URL on mount. When `?item=<value>`
  // is also present we look up the SKU under the matching product
  // catalog and pin it to itemCode/itemName so the parent opens
  // pre-checked. The value matches `code` first (e.g. "301", "COMPLETE")
  // and falls back to a case-insensitive `name` match (e.g. "Keyless
  // Expander", "SomnoDent Flex") so deep-links from New Products tiles
  // — whose items typically don't have numeric codes — still resolve.
  const initialPrefill = useMemo(() => {
    const slug = params?.get("product");
    const itemParam = params?.get("item");
    if (!slug) return null;
    const applianceId = SLUG_TO_APPLIANCE_ID[slug];
    if (!applianceId) return null;
    if (!itemParam) return { applianceId };
    const product = productCatalog.find((p) => p.slug === slug);
    const needle = itemParam.toLowerCase();
    const item = product?.items?.find(
      (it) =>
        (it.code && it.code === itemParam) ||
        (it.name && it.name.toLowerCase() === needle)
    );
    if (!item) return { applianceId };
    return { applianceId, itemCode: item.code, itemName: item.name };
  }, [params]);

  useEffect(() => {
    if (!initialPrefill) return;
    setState((prev) => {
      // Only preselect if both arches are still empty (don't clobber user edits).
      if (
        prev.upperAppliances.length === 0 &&
        prev.lowerAppliances.length === 0
      ) {
        return {
          ...prev,
          upperAppliances: [initialPrefill],
          lowerAppliances:
            prev.arches === "both" && prev.archSync
              ? [initialPrefill]
              : prev.lowerAppliances,
        };
      }
      return prev;
    });
  }, [initialPrefill]);

  function go(next: Step) {
    setStep(next);
    setVisited((s) => new Set(s).add(next));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function nextStep() {
    setErrorMsg(null);
    if (step === 1) {
      if (!step1IsValid(state)) {
        setErrorMsg("Please fill in all required practice information.");
        return;
      }
      go(2);
      return;
    }
    if (step === 2) {
      const v = step2IsValid(state);
      if (!v.ok) {
        setErrorMsg(v.message ?? "Please review the appliance selection.");
        return;
      }
      go(3);
      return;
    }
  }

  async function handleSubmit() {
    setErrorMsg(null);
    const v3 = step3IsValid(state);
    if (!v3.ok) {
      setErrorMsg(v3.message ?? "Please review the final step.");
      return;
    }
    setStatus("submitting");
    const ref = generateReference();
    const data = new FormData();
    data.append("_formType", "Submit Case (Detailed Form)");
    data.append(
      "_subject",
      `[Quick Order] ${state.practice.name || "(no practice)"} — ${
        state.patient.reference || "no ref"
      }`
    );
    data.append("reference_id", ref);

    // Practice
    data.append("practice_name", state.practice.name);
    data.append("doctor_name", state.practice.doctor);
    data.append("email", state.practice.email);
    data.append("phone", state.practice.phone);

    // Patient + arches
    data.append("patient_reference", state.patient.reference);
    data.append("arches", state.arches);
    data.append("arch_sync", state.archSync ? "Yes" : "No");

    // Appliances — append a JSON blob and a human-readable summary
    data.append(
      "appliances_json",
      JSON.stringify({
        upper: state.upperAppliances,
        lower: state.lowerAppliances,
      })
    );
    const summaryParts: string[] = [];
    const upperText = appliancesToText(state.upperAppliances, "Upper");
    const lowerText = appliancesToText(state.lowerAppliances, "Lower");
    if (upperText) summaryParts.push(upperText);
    if (lowerText) summaryParts.push(lowerText);
    data.append("appliances_summary", summaryParts.join("\n\n"));

    // Tooth selection
    data.append("dentition", state.toothSelection.dentition);
    data.append("teeth_upper", state.toothSelection.upper.join(","));
    data.append("teeth_lower", state.toothSelection.lower.join(","));

    // Files
    for (const f of state.files.stl) data.append("stl_files", f, f.name);
    for (const f of state.files.photos) data.append("photos", f, f.name);
    for (const f of state.files.rxPdf) data.append("rx_pdf", f, f.name);

    // Delivery
    data.append("due_date", state.delivery.dueDate);
    if (state.delivery.address.trim())
      data.append("shipping_address", state.delivery.address);
    if (state.delivery.instructions)
      data.append("special_instructions", state.delivery.instructions);

    // Consent
    data.append("hipaa_acknowledgment", state.consent.hipaa ? "Yes" : "No");
    data.append("newsletter_optin", state.consent.newsletter ? "Yes" : "No");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setReference(ref);
        setSubmittedDoctor(state.practice.doctor || "Doctor");
        setStatus("success");
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
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-brandOrange/15 text-brandOrange flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8"
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
        <h2 className="font-serif text-3xl text-navy">
          Case submitted successfully
        </h2>
        <p className="mt-4 text-gray-600 leading-relaxed max-w-lg mx-auto">
          Thank you,{" "}
          <span className="font-medium text-navy">{submittedDoctor}</span>.
          We&apos;ve received your submission and will reply within 1
          business day.
        </p>
        <div className="mt-8 mx-auto max-w-lg text-left rounded-2xl bg-gray-50/60 border border-gray-200 p-6">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
            What happens next
          </div>
          <ol className="space-y-2 text-[14.5px] text-gray-700 leading-relaxed list-decimal list-inside">
            <li>Confirmation email within minutes.</li>
            <li>Team review within 1 business day.</li>
            <li>We&apos;ll contact you to confirm details and timeline.</li>
            <li>Production begins after confirmation.</li>
          </ol>
          <div className="mt-5 pt-5 border-t border-gray-200/70 flex items-center justify-between gap-3">
            <span className="text-[12px] uppercase tracking-widest text-gray-500">
              Reference
            </span>
            <code className="text-[13.5px] text-navy font-mono">{reference}</code>
          </div>
        </div>
        <div className="mt-9 flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              setState(INITIAL_FORM_STATE);
              setStep(1);
              setVisited(new Set([1]));
              setStatus("idle");
              setReference("");
              setSubmittedDoctor("");
            }}
            className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Submit another case
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-navy border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!FORMSPREE_READY && (
        <div className="mb-6 text-[11.5px] text-brandOrange bg-brandOrange/5 border border-brandOrange/20 rounded-md px-3 py-2 tracking-wide">
          <span className="font-serif italic">dev notice</span> — set{" "}
          <code className="font-mono">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> to
          enable delivery.
        </div>
      )}

      <div className="mb-8">
        <StepIndicator
          current={step}
          visited={visited}
          onJump={(s) => go(s)}
        />
      </div>

      <div className="mb-8">
        {step === 1 && <Step1Practice state={state} setState={setState} />}
        {step === 2 && (
          <Step2Appliance
            state={state}
            setState={setState}
            pinnedApplianceId={initialPrefill?.applianceId}
          />
        )}
        {step === 3 && (
          <Step3FilesDelivery state={state} setState={setState} />
        )}
      </div>

      {errorMsg && (
        <div className="mb-5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => go((step - 1) as Step)}
            className="inline-flex items-center gap-2 bg-white text-navy border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:border-navy transition-colors"
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
            Back
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Next
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "submitting"}
            className="inline-flex items-center gap-2 bg-brandOrange text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting…" : "Submit case"}
            {status !== "submitting" && (
              <svg
                className="w-3.5 h-3.5"
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
        )}
      </div>
    </div>
  );
}
