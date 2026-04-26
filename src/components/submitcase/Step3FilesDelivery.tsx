"use client";

import FileUploadField from "./FileUploadField";
import ReviewSummary from "./ReviewSummary";
import ToothChart from "./ToothChart";
import { DELIVERY_METHODS, type FormState } from "./types";

const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2";
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

function minDueDate(): string {
  const d = new Date();
  let added = 0;
  while (added < 5) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added += 1;
  }
  return d.toISOString().slice(0, 10);
}

export default function Step3FilesDelivery({ state, setState }: Props) {
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

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-2">
          Step 3 of 3
        </div>
        <h2 className="font-serif text-3xl text-navy leading-tight tracking-tightest">
          Tooth chart, files &amp; delivery
        </h2>
        <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed">
          Mark the teeth involved, attach STL / photos / Rx PDF, and tell us
          when and how to send the case back.
        </p>
      </div>

      {/* TOOTH CHART */}
      <section>
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
          Tooth chart
        </div>
        <ToothChart
          value={state.toothSelection}
          onChange={(next) => setState({ ...state, toothSelection: next })}
        />
      </section>

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
          <label htmlFor="d-due" className={labelClass}>
            Due Date <span className="text-brandOrange ml-1">*</span>
          </label>
          <input
            id="d-due"
            type="date"
            required
            value={state.delivery.dueDate}
            min={minDueDate()}
            onChange={(e) => setDelivery("dueDate", e.target.value)}
            className={inputClass}
          />
          <p className="mt-2 text-[12px] text-gray-600">
            Earliest available: {minDueDate()}. We recommend at least 2 weeks
            for most appliances.
          </p>
        </div>
        <div>
          <span className={labelClass}>
            Delivery method <span className="text-brandOrange ml-1">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DELIVERY_METHODS.map((m) => {
              const checked = state.delivery.method === m.value;
              return (
                <label
                  key={m.value}
                  className={`flex items-start gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                    checked
                      ? "border-navy bg-navy/[0.03]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_method"
                    value={m.value}
                    checked={checked}
                    onChange={() => setDelivery("method", m.value)}
                    required
                    className="mt-1 accent-navy"
                  />
                  <span className="text-[14px] text-navy leading-snug">
                    {m.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        {state.delivery.method !== "Pickup" && (
          <div>
            <label htmlFor="d-ship" className={labelClass}>
              Shipping address <span className="text-brandOrange ml-1">*</span>
            </label>
            <textarea
              id="d-ship"
              required
              rows={3}
              value={state.delivery.address}
              onChange={(e) => setDelivery("address", e.target.value)}
              placeholder="Street address, City, State, ZIP code"
              className={`${inputClass} resize-y`}
            />
          </div>
        )}
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
  if (!state.delivery.dueDate)
    return { ok: false, message: "Pick a due date." };
  if (state.delivery.dueDate < minDueDate())
    return {
      ok: false,
      message: `Due date must be on or after ${minDueDate()}.`,
    };
  if (state.delivery.method !== "Pickup" && !state.delivery.address.trim()) {
    return { ok: false, message: "Shipping address required." };
  }
  if (!state.consent.hipaa) {
    return { ok: false, message: "HIPAA acknowledgment required." };
  }
  return { ok: true };
}
