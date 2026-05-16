"use client";

import { useEffect, useMemo } from "react";
import DueDatePicker from "./DueDatePicker";
import FileUploadField from "./FileUploadField";
import ReviewSummary from "./ReviewSummary";
import {
  SHIPPING_COUNTRIES,
  US_STATES,
  type FormState,
  type ShippingAddress,
} from "./types";
import {
  calculateMinDueDate,
  formatIsoDate,
  formatLongDate,
  getMaxLeadTime,
} from "@/utils/leadTimeCalculator";

// Decision-point field labels — bumped from 12px gray to 14px navy
// semibold so each "you need to choose this" section reads clearly.
const labelClass =
  "block text-sm uppercase tracking-wide font-semibold text-navy mb-2";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

const MB = 1024 * 1024;
const STL_LIMIT = 50 * MB;
const PHOTO_LIMIT = 10 * MB;
const PDF_LIMIT = 20 * MB;

type Props = {
  state: FormState;
  setState: (next: FormState) => void;
};

function selectedAppliances(state: FormState) {
  return [...state.upperAppliances, ...state.lowerAppliances];
}

function computeMinDueDate(state: FormState): Date {
  const configs = selectedAppliances(state);
  const lead = getMaxLeadTime(configs);
  return calculateMinDueDate(lead);
}

export default function Step3FilesDelivery({ state, setState }: Props) {
  const minDate = useMemo(() => computeMinDueDate(state), [
    state.upperAppliances,
    state.lowerAppliances,
  ]);
  const minDateIso = formatIsoDate(minDate);
  const minDateLong = formatLongDate(minDate);
  const leadKey = useMemo(
    () => getMaxLeadTime(selectedAppliances(state)),
    [state.upperAppliances, state.lowerAppliances]
  );
  const leadLabel = leadKey === "2weeks" ? "approx. 2 weeks" : "approx. 1 week";

  // If the appliance selection changes and the previously chosen due
  // date is now earlier than the new minimum, clear it so the user
  // re-picks rather than silently submitting an under-lead-time date.
  useEffect(() => {
    if (state.delivery.dueDate && state.delivery.dueDate < minDateIso) {
      setState({
        ...state,
        delivery: { ...state.delivery, dueDate: "" },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDateIso]);

  function setDelivery<K extends keyof FormState["delivery"]>(
    key: K,
    value: FormState["delivery"][K]
  ) {
    setState({ ...state, delivery: { ...state.delivery, [key]: value } });
  }

  function setConsent<K extends keyof FormState["consent"]>(
    key: K,
    value: FormState["consent"][K]
  ) {
    setState({ ...state, consent: { ...state.consent, [key]: value } });
  }

  const dueDateBeforeMin =
    !!state.delivery.dueDate && state.delivery.dueDate < minDateIso;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-2">
          Step 3 of 3
        </div>
        <h2 className="font-serif text-3xl text-navy leading-tight tracking-tightest">
          Files &amp; delivery
        </h2>
        <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed">
          Attach STL / photos / Rx PDF, and tell us when and how to send the
          case back.
        </p>
      </div>

      {/* FILES */}
      <section className="space-y-5">
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium">
          File attachments
        </div>
        <p className="text-[12.5px] text-gray-600 leading-snug -mt-3">
          <span aria-hidden>📁</span> Files are transmitted over HTTPS. STL ≤
          50 MB each. For larger files send via EasyRx or contact us.
        </p>
        <FileUploadField
          label="STL files · optional"
          description="Up to 50 MB each · .stl, .ply, .obj, .dcm"
          multiple
          accept=".stl,.ply,.obj,.dcm"
          maxSize={STL_LIMIT}
          files={state.files.stl}
          onChange={(stl) =>
            setState({ ...state, files: { ...state.files, stl } })
          }
        />
        <FileUploadField
          label="Photos · optional"
          description="Up to 10 MB each · .jpg, .jpeg, .png, .webp"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          maxSize={PHOTO_LIMIT}
          files={state.files.photos}
          onChange={(photos) =>
            setState({ ...state, files: { ...state.files, photos } })
          }
        />
        <FileUploadField
          label="Rx PDF · optional"
          description="Up to 20 MB · single .pdf"
          multiple={false}
          accept=".pdf"
          maxSize={PDF_LIMIT}
          files={state.files.rxPdf}
          onChange={(rxPdf) =>
            setState({ ...state, files: { ...state.files, rxPdf } })
          }
        />
      </section>

      {/* DELIVERY */}
      <section className="space-y-5">
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium">
          Delivery &amp; timeline
        </div>
        <div>
          <label
            htmlFor="d-due"
            className="block text-lg font-semibold text-navy mb-3"
          >
            Due Date <span className="text-brandOrange ml-1">*</span>
          </label>
          <DueDatePicker
            inputId="d-due"
            value={state.delivery.dueDate}
            minDate={minDate}
            onChange={(iso) => setDelivery("dueDate", iso)}
          />
          <p className="mt-2 text-[13px] text-gray-700">
            Standard lead time for the selected appliance(s):{" "}
            <strong>{leadLabel}</strong>. Earliest available date:{" "}
            <strong>{minDateLong}</strong>.
          </p>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-2">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Need it sooner?</strong>
              <br />
              Contact us for Rush Case handling:
              <br />
              📞{" "}
              <a
                href="tel:8089570111"
                className="underline underline-offset-2 hover:no-underline"
              >
                808-957-0111
              </a>
              <br />
              📧{" "}
              <a
                href="mailto:aso-digital@outlook.com"
                className="underline underline-offset-2 hover:no-underline"
              >
                aso-digital@outlook.com
              </a>
            </p>
          </div>
          {dueDateBeforeMin && (
            <div
              role="alert"
              className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 leading-snug"
            >
              ⚠️ This date is before our standard lead time for the selected
              appliance(s). For Rush Case service, please contact us directly
              at{" "}
              <a href="tel:8089570111" className="underline">
                808-957-0111
              </a>{" "}
              or{" "}
              <a href="mailto:aso-digital@outlook.com" className="underline">
                aso-digital@outlook.com
              </a>
              .
            </div>
          )}
        </div>
        <div>
          <div className={labelClass}>
            Shipping address <span className="text-brandOrange ml-1">*</span>
          </div>
          <p className="-mt-1 mb-3 text-[12.5px] text-gray-500 leading-snug">
            Once you submit, your browser will offer to autofill these
            fields on future visits.
          </p>
          <ShippingAddressForm
            value={state.delivery.address}
            onChange={(next) => setDelivery("address", next)}
            inputClass={inputClass}
            labelClass={labelClass}
          />
        </div>
        <div>
          <label htmlFor="d-notes" className={labelClass}>
            Special instructions{" "}
            <span className="text-gray-400 normal-case tracking-normal">
              · optional
            </span>
          </label>
          <textarea
            id="d-notes"
            rows={3}
            value={state.delivery.instructions}
            onChange={(e) => setDelivery("instructions", e.target.value)}
            placeholder="Rush delivery, packaging, special handling, etc."
            className={`${inputClass} resize-y`}
          />
        </div>
      </section>

      {/* CONSENT */}
      <section className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            required
            checked={state.consent.hipaa}
            onChange={(e) => setConsent("hipaa", e.target.checked)}
            className="mt-1 accent-navy"
          />
          <span className="text-[14px] text-gray-700 leading-snug">
            I confirm that any patient information shared follows HIPAA
            guidelines and that I have authorisation to submit this case.{" "}
            <span className="text-brandOrange">*</span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={state.consent.newsletter}
            onChange={(e) => setConsent("newsletter", e.target.checked)}
            className="mt-1 accent-navy"
          />
          <span className="text-[14px] text-gray-700 leading-snug">
            Subscribe to ASO Hawaii product updates (optional).
          </span>
        </label>
      </section>

      {/* REVIEW */}
      <section>
        <ReviewSummary state={state} />
      </section>
    </div>
  );
}

export function step3IsValid(state: FormState): {
  ok: boolean;
  message?: string;
} {
  const minIso = formatIsoDate(computeMinDueDate(state));
  if (!state.delivery.dueDate)
    return { ok: false, message: "Pick a due date." };
  if (state.delivery.dueDate < minIso) {
    return {
      ok: false,
      message:
        "Due date is earlier than the standard lead time for the selected appliance(s). Contact us at 808-957-0111 for Rush Case service.",
    };
  }
  const addr = state.delivery.address;
  if (!addr.line1.trim()) {
    return { ok: false, message: "Street address is required." };
  }
  if (!addr.city.trim()) {
    return { ok: false, message: "City is required." };
  }
  if (!addr.state.trim()) {
    return { ok: false, message: "State is required." };
  }
  if (!addr.zip.trim()) {
    return { ok: false, message: "ZIP / postal code is required." };
  }
  if (!addr.country.trim()) {
    return { ok: false, message: "Country is required." };
  }
  if (!state.consent.hipaa) {
    return { ok: false, message: "HIPAA acknowledgment required." };
  }
  return { ok: true };
}

/** Structured 6-field shipping address with browser autofill hints. The
 *  parent owns the value; this component only renders + bubbles per-
 *  field changes via onChange(next). State + Country are <select>s
 *  with text values that match what browsers store under the
 *  address-level1 / country-name autocomplete tokens, so Chrome will
 *  pre-pick the right option on revisits. */
function ShippingAddressForm({
  value,
  onChange,
  inputClass,
  labelClass,
}: {
  value: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  inputClass: string;
  labelClass: string;
}) {
  function set<K extends keyof ShippingAddress>(
    key: K,
    next: ShippingAddress[K],
  ) {
    onChange({ ...value, [key]: next });
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 sm:gap-4">
      <div className="sm:col-span-6">
        <label htmlFor="d-addr-line1" className={labelClass}>
          Street address <span className="text-brandOrange ml-1">*</span>
        </label>
        <input
          id="d-addr-line1"
          type="text"
          required
          autoComplete="address-line1"
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          placeholder="123 Main St"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-6">
        <label htmlFor="d-addr-line2" className={labelClass}>
          Apt / Suite / Floor{" "}
          <span className="text-gray-400 normal-case tracking-normal">
            · optional
          </span>
        </label>
        <input
          id="d-addr-line2"
          type="text"
          autoComplete="address-line2"
          value={value.line2}
          onChange={(e) => set("line2", e.target.value)}
          placeholder="Apt 4B, Suite 200, ..."
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="d-addr-city" className={labelClass}>
          City <span className="text-brandOrange ml-1">*</span>
        </label>
        <input
          id="d-addr-city"
          type="text"
          required
          autoComplete="address-level2"
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Honolulu"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="d-addr-state" className={labelClass}>
          State <span className="text-brandOrange ml-1">*</span>
        </label>
        <select
          id="d-addr-state"
          required
          autoComplete="address-level1"
          value={value.state}
          onChange={(e) => set("state", e.target.value)}
          className={inputClass}
        >
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="d-addr-zip" className={labelClass}>
          ZIP code <span className="text-brandOrange ml-1">*</span>
        </label>
        <input
          id="d-addr-zip"
          type="text"
          inputMode="numeric"
          required
          autoComplete="postal-code"
          value={value.zip}
          onChange={(e) => set("zip", e.target.value)}
          placeholder="96813"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="d-addr-country" className={labelClass}>
          Country <span className="text-brandOrange ml-1">*</span>
        </label>
        <select
          id="d-addr-country"
          required
          autoComplete="country-name"
          value={value.country}
          onChange={(e) => set("country", e.target.value)}
          className={inputClass}
        >
          {SHIPPING_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
