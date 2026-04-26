"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  applianceValueFor,
  buildApplianceOptionGroups,
} from "@/data/appliance-options";
import { FORMSPREE_ENDPOINT, FORMSPREE_READY } from "@/data/config";

type Status = "idle" | "submitting" | "success" | "error";

const DELIVERY_METHODS = [
  { value: "Pickup", label: "Pickup at ASO Hawaii (Honolulu only)" },
  {
    value: "Local Delivery",
    label: "Local delivery (Honolulu area, some remote zones excluded)",
  },
  { value: "USPS Priority Mail", label: "USPS Priority Mail" },
];

const COLOR_CHARTS = [
  {
    src: "/images/aso/colors/charts/traditional-glitter.jpg",
    alt: "Acrylic color chart — traditional and glitter samples",
  },
  {
    src: "/images/aso/colors/charts/neon-stickers.jpg",
    alt: "Neon colors and sticker designs reference chart",
  },
];

const MB = 1024 * 1024;
const STL_LIMIT = 50 * MB;
const PHOTO_LIMIT = 10 * MB;
const PDF_LIMIT = 20 * MB;
const STL_ACCEPT = ".stl,.ply,.obj,.dcm";
const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";
const PDF_ACCEPT = ".pdf";

function formatSize(bytes: number) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ASO-${ts}-${rand}`;
}

const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2";
const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors";

type FileSlotProps = {
  label: string;
  description: string;
  multiple: boolean;
  accept: string;
  maxSize: number;
  files: File[];
  onChange: (next: File[]) => void;
};

function FileSlot({
  label,
  description,
  multiple,
  accept,
  maxSize,
  files,
  onChange,
}: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const f of list) {
      if (f.size > maxSize) {
        rejected.push(`${f.name} (${formatSize(f.size)} > ${formatSize(maxSize)})`);
        continue;
      }
      accepted.push(f);
    }
    if (rejected.length > 0) {
      setError(`Too large: ${rejected.join(", ")}`);
    } else {
      setError(null);
    }
    onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  }

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-brandOrange bg-brandOrange/5"
            : "border-gray-300 bg-gray-50/40 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="text-[13.5px] text-gray-700 leading-snug">
          <span className="font-medium text-navy">Drop files here</span> or
          click to browse
        </div>
        <div className="text-[12px] text-gray-500 mt-1">{description}</div>
      </div>
      {error && (
        <div className="mt-2 text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px]"
            >
              <span className="truncate text-navy">{f.name}</span>
              <span className="shrink-0 text-gray-500 text-[12px]">
                {formatSize(f.size)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(files.filter((_, j) => j !== i));
                  }}
                  className="ml-3 text-gray-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 rounded"
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SubmitCaseForm() {
  const params = useSearchParams();
  const applianceGroups = useMemo(() => buildApplianceOptionGroups(), []);
  const initialAppliance = useMemo(() => {
    const slug = params?.get("product");
    const code = params?.get("item");
    return applianceValueFor(slug, code) ?? "";
  }, [params]);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");
  const [submittedDoctor, setSubmittedDoctor] = useState<string>("");
  const [submittedAppliance, setSubmittedAppliance] = useState<string>("");
  const [easyRxUser, setEasyRxUser] = useState(false);
  const [appliance, setAppliance] = useState<string>(initialAppliance);
  const [delivery, setDelivery] = useState<string>("USPS Priority Mail");
  const [stlFiles, setStlFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [chartIdx, setChartIdx] = useState<number | null>(null);

  // If the URL params change after mount (rare, but possible if the user
  // navigates between catalog item buttons that all link to /submit-case/),
  // resync the appliance selection with whatever the URL now requests —
  // but only when the user hasn't already started editing the value.
  useEffect(() => {
    if (!initialAppliance) return;
    setAppliance((prev) => prev || initialAppliance);
  }, [initialAppliance]);

  // Compute the soonest valid due-date (5 business days from today).
  const minDueDate = (() => {
    const d = new Date();
    let added = 0;
    while (added < 5) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) added += 1;
    }
    return d.toISOString().slice(0, 10);
  })();

  useEffect(() => {
    if (chartIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setChartIdx(null);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [chartIdx]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const practice = String(data.get("practice_name") ?? "").trim();
    const doctor = String(data.get("doctor_name") ?? "").trim();
    const appliance = String(data.get("appliance_type") ?? "").trim();
    const patientRef = String(data.get("patient_reference") ?? "").trim() || "—";

    const ref = generateReference();
    data.append("_formType", "Submit Case (Quick Order)");
    data.set(
      "_subject",
      `[Quick Order] ${practice || "(no practice)"} — ${appliance} — ${patientRef}`
    );
    data.set("reference_id", ref);

    // File slots — append manually because the controlled inputs are
    // hidden inside drop zones and aren't part of `form` automatically.
    for (const f of stlFiles) data.append("stl_files", f, f.name);
    for (const f of photos) data.append("photos", f, f.name);
    for (const f of pdfFiles) data.append("rx_pdf", f, f.name);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setReference(ref);
        setSubmittedDoctor(doctor || "Doctor");
        setSubmittedAppliance(appliance || "your case");
        setStatus("success");
        setStlFiles([]);
        setPhotos([]);
        setPdfFiles([]);
        form.reset();
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
      <div className="text-center">
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
          Thank you, <span className="font-medium text-navy">{submittedDoctor}</span>.
          We&apos;ve received your case submission for{" "}
          <span className="font-medium text-navy">{submittedAppliance}</span>.
        </p>
        <div className="mt-8 mx-auto max-w-lg text-left rounded-2xl bg-gray-50/60 border border-gray-200 p-6">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
            What happens next
          </div>
          <ol className="space-y-2 text-[14.5px] text-gray-700 leading-relaxed list-decimal list-inside">
            <li>You&apos;ll receive a confirmation email within minutes.</li>
            <li>Our team will review your submission within 1 business day.</li>
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
              setStatus("idle");
              setErrorMsg(null);
              setReference("");
              setSubmittedDoctor("");
              setSubmittedAppliance("");
            }}
            className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Submit another case
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
    <>
      <form onSubmit={handleSubmit} className="space-y-12" noValidate>
        {!FORMSPREE_READY && (
          <div className="text-[11.5px] text-brandOrange bg-brandOrange/5 border border-brandOrange/20 rounded-md px-3 py-2 tracking-wide">
            <span className="font-serif italic">dev notice</span> — set{" "}
            <code className="font-mono">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code>{" "}
            to enable delivery.
          </div>
        )}

        {/* SECTION 1 — Practice */}
        <fieldset className="space-y-5">
          <legend className="font-serif text-2xl text-navy mb-1">
            Practice information
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sc-practice" className={labelClass}>
                Practice / Clinic Name <span className="text-brandOrange ml-1">*</span>
              </label>
              <input
                id="sc-practice"
                name="practice_name"
                type="text"
                required
                aria-required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="sc-doctor" className={labelClass}>
                Doctor&apos;s Name <span className="text-brandOrange ml-1">*</span>
              </label>
              <input
                id="sc-doctor"
                name="doctor_name"
                type="text"
                required
                aria-required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="sc-email" className={labelClass}>
                Email Address <span className="text-brandOrange ml-1">*</span>
              </label>
              <input
                id="sc-email"
                name="email"
                type="email"
                required
                aria-required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="sc-phone" className={labelClass}>
                Phone Number <span className="text-brandOrange ml-1">*</span>
              </label>
              <input
                id="sc-phone"
                name="phone"
                type="tel"
                required
                aria-required
                className={inputClass}
              />
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              name="easyrx_user"
              value="Yes"
              checked={easyRxUser}
              onChange={(e) => setEasyRxUser(e.target.checked)}
              className="mt-1 accent-navy"
            />
            <span className="text-[14px] text-gray-700 leading-snug">
              Yes, I have an EasyRx account
            </span>
          </label>
          {easyRxUser && (
            <div className="rounded-md bg-brandOrange/5 border border-brandOrange/20 px-4 py-3 text-[13px] text-gray-700 leading-relaxed">
              <span className="font-medium text-navy">Tip:</span> For EasyRx
              users, submitting through your EasyRx account is faster and
              gives you full case traceability.{" "}
              <Link
                href="/how-to-order"
                className="underline underline-offset-2 text-navy hover:text-brandOrange transition-colors"
              >
                Learn more →
              </Link>
            </div>
          )}
        </fieldset>

        {/* SECTION 2 — Case */}
        <fieldset className="space-y-5">
          <legend className="font-serif text-2xl text-navy mb-1">
            Case information
          </legend>
          <div>
            <label htmlFor="sc-patient" className={labelClass}>
              Patient Reference{" "}
              <span className="text-gray-400 normal-case tracking-normal">
                · optional
              </span>
            </label>
            <input
              id="sc-patient"
              name="patient_reference"
              type="text"
              placeholder="Patient initials or chart number"
              aria-describedby="sc-patient-help"
              className={inputClass}
            />
            <p
              id="sc-patient-help"
              className="mt-2 text-[12px] text-gray-600 leading-snug"
            >
              <span aria-hidden>⚠️</span> Please use initials or chart number
              only. Avoid full patient names for HIPAA compliance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sc-appliance" className={labelClass}>
                Appliance Type <span className="text-brandOrange ml-1">*</span>
              </label>
              <select
                id="sc-appliance"
                name="appliance_type"
                required
                aria-required
                value={appliance}
                onChange={(e) => setAppliance(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select appliance type…
                </option>
                {applianceGroups.map((g) => (
                  <optgroup key={g.slug} label={g.groupLabel}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-2 text-[12px] text-gray-500 leading-snug">
                Pick the closest match. Specific items (e.g. &quot;804 — Wrap-Around (Begg)&quot;)
                are listed under each category. Choose &quot;general inquiry&quot; if
                you&apos;re unsure.
              </p>
            </div>
            <div>
              <label htmlFor="sc-jaw" className={labelClass}>
                Jaw Type <span className="text-brandOrange ml-1">*</span>
              </label>
              <select
                id="sc-jaw"
                name="jaw_type"
                required
                aria-required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="Upper (U)">Upper (U)</option>
                <option value="Lower (L)">Lower (L)</option>
                <option value="Both (UL)">Both (UL)</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="sc-spec" className={labelClass}>
              Specifications / Design{" "}
              <span className="text-gray-400 normal-case tracking-normal">
                · optional
              </span>
            </label>
            <textarea
              id="sc-spec"
              name="specifications"
              rows={4}
              placeholder="Describe the design, modifications, or special requirements"
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label htmlFor="sc-color" className={labelClass}>
              Color / Customization{" "}
              <span className="text-gray-400 normal-case tracking-normal">
                · optional
              </span>
            </label>
            <textarea
              id="sc-color"
              name="color_customization"
              rows={2}
              placeholder="Specify color number(s), glitter, stickers, or custom combinations"
              aria-describedby="sc-color-help"
              className={`${inputClass} resize-y`}
            />
            <p
              id="sc-color-help"
              className="mt-2 text-[12px] text-gray-600 leading-snug"
            >
              <span aria-hidden>📋</span>{" "}
              <button
                type="button"
                onClick={() => setChartIdx(0)}
                className="text-brandOrange font-medium hover:text-brandOrange/80 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 rounded"
              >
                View Color Chart
              </button>{" "}
              — opens in a modal. Reference numbers from the printed chart on
              the form (e.g. &quot;#5 Green&quot;).
            </p>
          </div>
        </fieldset>

        {/* SECTION 3 — Files */}
        <fieldset className="space-y-5">
          <legend className="font-serif text-2xl text-navy mb-1">
            File attachments
          </legend>
          <p className="text-[12.5px] text-gray-600 leading-snug -mt-3">
            <span aria-hidden>📁</span> All files are transmitted over
            HTTPS. Maximum 50 MB per STL file. For larger files, please send
            via EasyRx or contact us.
          </p>
          <FileSlot
            label="STL Files · optional"
            description="Up to 50 MB each · .stl, .ply, .obj, .dcm"
            multiple
            accept={STL_ACCEPT}
            maxSize={STL_LIMIT}
            files={stlFiles}
            onChange={setStlFiles}
          />
          <FileSlot
            label="Photos · optional"
            description="Up to 10 MB each · .jpg, .jpeg, .png, .webp"
            multiple
            accept={PHOTO_ACCEPT}
            maxSize={PHOTO_LIMIT}
            files={photos}
            onChange={setPhotos}
          />
          <FileSlot
            label="Rx PDF · optional"
            description="Up to 20 MB · single .pdf"
            multiple={false}
            accept={PDF_ACCEPT}
            maxSize={PDF_LIMIT}
            files={pdfFiles}
            onChange={setPdfFiles}
          />
        </fieldset>

        {/* SECTION 4 — Delivery */}
        <fieldset className="space-y-5">
          <legend className="font-serif text-2xl text-navy mb-1">
            Delivery &amp; timeline
          </legend>
          <div>
            <label htmlFor="sc-due" className={labelClass}>
              Due Date <span className="text-brandOrange ml-1">*</span>
            </label>
            <input
              id="sc-due"
              name="due_date"
              type="date"
              required
              aria-required
              min={minDueDate}
              aria-describedby="sc-due-help"
              className={inputClass}
            />
            <p id="sc-due-help" className="mt-2 text-[12px] text-gray-600">
              We recommend at least 2 weeks for most appliances. Earliest
              available: {minDueDate}.
            </p>
          </div>
          <div>
            <span className={labelClass}>
              Delivery Method <span className="text-brandOrange ml-1">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERY_METHODS.map((m) => {
                const checked = delivery === m.value;
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
                      onChange={() => setDelivery(m.value)}
                      required
                      aria-required
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
          {delivery !== "Pickup" && (
            <div>
              <label htmlFor="sc-ship" className={labelClass}>
                Shipping Address{" "}
                <span className="text-brandOrange ml-1">*</span>
              </label>
              <textarea
                id="sc-ship"
                name="shipping_address"
                required
                aria-required
                rows={3}
                placeholder="Street address, City, State, ZIP code"
                className={`${inputClass} resize-y`}
              />
            </div>
          )}
          <div>
            <label htmlFor="sc-notes" className={labelClass}>
              Special Instructions{" "}
              <span className="text-gray-400 normal-case tracking-normal">
                · optional
              </span>
            </label>
            <textarea
              id="sc-notes"
              name="special_instructions"
              rows={3}
              placeholder="Rush delivery, specific packaging, special handling requirements, etc."
              className={`${inputClass} resize-y`}
            />
          </div>
        </fieldset>

        {/* SECTION 5 — Confirmation */}
        <fieldset className="space-y-4">
          <legend className="font-serif text-2xl text-navy mb-1">
            Confirmation
          </legend>
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              name="hipaa_acknowledgment"
              value="Yes"
              required
              aria-required
              className="mt-1 accent-navy"
            />
            <span className="text-[14px] text-gray-700 leading-snug">
              I confirm that any patient information shared follows HIPAA
              guidelines and that I have authorization to submit this case.{" "}
              <span className="text-brandOrange">*</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              name="newsletter_optin"
              value="Yes"
              className="mt-1 accent-navy"
            />
            <span className="text-[14px] text-gray-700 leading-snug">
              Subscribe to ASO Hawaii product updates (optional).
            </span>
          </label>
        </fieldset>

        {status === "error" && errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full inline-flex items-center justify-center gap-2 bg-brandOrange text-white font-medium px-6 py-4 rounded-full hover:bg-brandOrange/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting…" : "Submit case"}
            {status !== "submitting" && (
              <svg
                className="w-4 h-4"
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
          <p className="mt-3 text-[12.5px] text-gray-500 text-center">
            Our team will review and confirm your submission within 1
            business day.
          </p>
        </div>
      </form>

      {/* Color chart lightbox */}
      {chartIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ASO color chart"
          onClick={() => setChartIdx(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setChartIdx(null)}
            aria-label="Close color chart"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-navy shadow-lg flex items-center justify-center hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/60 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4L4 12" />
            </svg>
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[88vh] w-full flex flex-col items-stretch gap-3"
          >
            <Image
              src={COLOR_CHARTS[chartIdx].src}
              alt={COLOR_CHARTS[chartIdx].alt}
              width={1400}
              height={1082}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="w-full h-auto max-h-[78vh] object-contain rounded-lg bg-white"
              priority
            />
            <div className="flex items-center justify-center gap-2">
              {COLOR_CHARTS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChartIdx(i)}
                  aria-label={`Show chart ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === chartIdx
                      ? "w-8 bg-brandOrange"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
