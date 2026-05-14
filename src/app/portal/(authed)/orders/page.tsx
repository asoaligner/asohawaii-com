"use client";

/**
 * Order detail at /portal/orders/?id=N.
 *
 * Lives at a static route with a query-string id (rather than a dynamic
 * segment) because output: 'export' cannot pre-render DB-driven /[id]/
 * paths. The id is fetched client-side and 404 / out-of-scope rows
 * collapse to the same "Order not found." state on this side, mirroring
 * the API.
 *
 * Reorder + Ask buttons are disabled stubs in Phase 1.2 — Phase 1.5
 * wires them up.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  askOrderQuestion,
  fetchOrder,
  orderFileDownloadUrl,
  updateOrder,
  type OrderDetail,
  type PortalOrderFile,
  type UpdateOrderInput,
} from "@/lib/portal/orders";
import {
  caseReviewUrl,
  fetchCaseReviewManifest,
  matchCaseReviews,
  type CaseReviewEntry,
} from "@/lib/portal/case-reviews";
import {
  DeliveryDateCell,
  SourceBadge,
} from "@/components/portal/OrderBadges";
import { usePortalSession } from "../session-context";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; order: OrderDetail }
  | { status: "not-found" }
  | { status: "error"; message: string };

export default function OrderDetailPage() {
  const { user } = usePortalSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idRaw = searchParams?.get("id") ?? "";
  const id = Number.parseInt(idRaw, 10);
  const validId = Number.isFinite(id) && id > 0;

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!validId) {
      setState({ status: "not-found" });
      return;
    }
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetchOrder(id, ctrl.signal).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res.ok) {
        setState({ status: "ok", order: res.data });
      } else if (res.status === 401) {
        router.replace("/portal/");
      } else if (res.status === 404) {
        setState({ status: "not-found" });
      } else if (res.error !== "aborted") {
        setState({ status: "error", message: res.error });
      }
    });
    return () => ctrl.abort();
  }, [id, validId, router]);

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-4xl">
        <Link
          href="/portal/dashboard/"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-navy transition-colors"
        >
          <span aria-hidden>←</span>
          Back to dashboard
        </Link>

        {state.status === "loading" && (
          <div className="mt-10 text-center text-sm text-gray-400">
            Loading order…
          </div>
        )}

        {state.status === "not-found" && (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="font-serif text-2xl text-navy">Order not found.</p>
            <p className="mt-2 text-[13.5px] text-gray-500">
              It may have been removed, or you may not have access.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-center">
            <p className="text-[14px] text-red-700">{state.message}</p>
            <button
              type="button"
              onClick={() => {
                if (validId) {
                  // re-trigger load by toggling state
                  setState({ status: "loading" });
                  fetchOrder(id).then((res) => {
                    if (res.ok) setState({ status: "ok", order: res.data });
                    else if (res.status === 404)
                      setState({ status: "not-found" });
                    else
                      setState({
                        status: "error",
                        message: res.error,
                      });
                  });
                }
              }}
              className="mt-3 text-[13px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === "ok" && (
          <OrderView
            order={state.order}
            viewerRole={user.role}
            onOrderUpdated={(order) => setState({ status: "ok", order })}
          />
        )}
      </div>
    </div>
  );
}

interface ViewProps {
  order: OrderDetail;
  viewerRole: "member" | "admin" | "aso_staff";
  onOrderUpdated: (order: OrderDetail) => void;
}

function OrderView({ order, viewerRole, onOrderUpdated }: ViewProps) {
  return (
    <article className="mt-6">
      {/* Header */}
      <header className="rounded-2xl border border-gray-200 bg-white px-5 sm:px-7 py-5 sm:py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Order
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-0.5 leading-tight">
              {order.order_number ?? `#${order.id}`}
            </h1>
            <p className="mt-2 text-[14px] text-gray-700">
              Patient:{" "}
              <span className="text-navy font-medium">
                {order.patient_name ?? "—"}
              </span>
            </p>
          </div>
          <SourceBadge source={order.source} />
        </div>

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          {order.reorder ? (
            <Link
              href={`/portal/submit-case/?from=${order.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-navy/30 bg-white text-navy hover:bg-navy hover:text-white transition-colors"
            >
              <span aria-hidden>↺</span>
              Reorder same spec
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Only portal-submitted cases can be reordered with full spec. Submit a new case to start."
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-gray-200 bg-white text-gray-400 cursor-not-allowed"
            >
              <span aria-hidden>↺</span>
              Reorder same spec
            </button>
          )}
          <AskQuestionButton order={order} />
          <AlignerSetupButton order={order} />
          {viewerRole === "aso_staff" && (
            <EditOrderButton order={order} onUpdated={onOrderUpdated} />
          )}
        </div>
      </header>

      {/* Basics */}
      <Section title="Basics">
        <FieldGrid>
          <Field label="Order date" value={order.order_date} />
          <Field
            label="Delivery"
            valueNode={<DeliveryDateCell date={order.delivery_date} />}
          />
          <Field label="Appliance" value={order.appliance_type} />
          <Field
            label="Source"
            valueNode={<SourceBadge source={order.source} />}
          />
        </FieldGrid>
      </Section>

      {/* Shipping */}
      <Section title="Shipping">
        <FieldGrid>
          <Field
            label="Tracking number"
            value={order.tracking_number}
            mono
          />
          <Field label="Carrier" value={order.tracking_carrier} />
          <Field
            label="Notes"
            value={order.delivery_notes}
            full
            wrap
          />
        </FieldGrid>
      </Section>

      {/* Files */}
      {order.files.length > 0 && (
        <Section title="Files">
          <FileList orderId={order.id} files={order.files} />
        </Section>
      )}

      {/* Notes */}
      <Section title="Notes">
        <FieldGrid>
          <Field
            label="Design notes"
            value={order.design_notes}
            full
            wrap
          />
          <Field
            label="Additional memo"
            value={order.additional_memo}
            full
            wrap
          />
          {viewerRole === "aso_staff" &&
            order.internal_memo !== undefined && (
              <Field
                label="Internal memo (ASO staff only)"
                value={order.internal_memo}
                full
                wrap
                emphasis
              />
            )}
        </FieldGrid>
      </Section>

      <p className="mt-6 text-[12px] text-gray-400">
        Last updated {order.updated_at}
        {order.synced_at ? ` · Synced ${order.synced_at}` : null}
      </p>
    </article>
  );
}

const QUESTION_MAX_LEN = 4000;

type QuestionStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

/**
 * Surface the matching /cases/{slug}/ aligner setup review when the
 * order matches one. Match order:
 *
 *   1. order.review_slug — explicit aso_staff pin (always wins).
 *   2. Fuzzy match on the build-time manifest by clinic doctor lastname
 *      + patient first-name prefix.
 *
 * Multiple matches (same patient, several setup revisions) render the
 * newest as the primary button and the rest behind a "View N more"
 * dropdown so the doctor can compare versions without leaving the page.
 */
function AlignerSetupButton({ order }: { order: OrderDetail }) {
  const [pinned, setPinned] = useState<CaseReviewEntry | null>(null);
  const [candidates, setCandidates] = useState<CaseReviewEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCaseReviewManifest().then((manifest) => {
      if (cancelled) return;
      const result = matchCaseReviews(manifest, {
        reviewSlug: order.review_slug,
        clinicName: order.clinic_name,
        patientName: order.patient_name,
      });
      setPinned(result.pinned);
      setCandidates(result.candidates);
    });
    return () => {
      cancelled = true;
    };
  }, [order.id, order.review_slug, order.clinic_name, order.patient_name]);

  // Resolved entry that drives the primary button.
  const primary = pinned ?? candidates[0] ?? null;
  if (!primary) return null;

  const extra = pinned ? [] : candidates.slice(1);

  return (
    <div className="relative inline-flex items-center">
      <a
        href={caseReviewUrl(primary.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-brandOrange text-white hover:bg-brandOrange/90 transition-colors"
        title={
          pinned
            ? `Pinned review: ${primary.slug}`
            : primary.generated_date
              ? `Setup generated ${primary.generated_date}`
              : undefined
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12l5 5L20 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        View Aligner Setup
        <span aria-hidden className="opacity-70">↗</span>
      </a>
      {extra.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 px-2 py-2 rounded-full text-[12px] font-medium border border-gray-200 bg-white text-gray-600 hover:border-navy hover:text-navy transition-colors"
            aria-expanded={open}
            aria-haspopup="menu"
            title={`${extra.length} earlier setup${extra.length === 1 ? "" : "s"}`}
          >
            +{extra.length}
          </button>
          {open && (
            <div
              role="menu"
              className="absolute z-10 top-full right-0 mt-1.5 min-w-[260px] rounded-xl border border-gray-200 bg-white shadow-lg py-1.5"
              onMouseLeave={() => setOpen(false)}
            >
              <p className="px-3 pt-1 pb-2 text-[10.5px] uppercase tracking-widest text-gray-400">
                Earlier setups
              </p>
              {extra.map((c) => (
                <a
                  key={c.slug}
                  href={caseReviewUrl(c.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-[12.5px] text-navy hover:bg-gray-50"
                >
                  <span className="font-mono text-[11.5px] text-gray-500">
                    {c.generated_date ?? "—"}
                  </span>
                  <span className="ml-2">{c.slug}</span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AskQuestionButton({ order }: { order: OrderDetail }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<QuestionStatus>({ kind: "idle" });
  const [sentRef, setSentRef] = useState<string | null>(null);

  function close() {
    if (status.kind === "submitting") return;
    setOpen(false);
    setStatus({ kind: "idle" });
  }

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      setStatus({ kind: "error", message: "Please write a question first." });
      return;
    }
    if (trimmed.length > QUESTION_MAX_LEN) {
      setStatus({
        kind: "error",
        message: `Please keep it under ${QUESTION_MAX_LEN} characters.`,
      });
      return;
    }
    setStatus({ kind: "submitting" });
    const res = await askOrderQuestion(order.id, trimmed);
    if (res.ok) {
      setSentRef(order.order_number ?? `#${order.id}`);
      setOpen(false);
      setMessage("");
      setStatus({ kind: "idle" });
      return;
    }
    setStatus({ kind: "error", message: res.error });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSentRef(null);
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-navy/30 bg-white text-navy hover:bg-navy hover:text-white transition-colors"
      >
        <span aria-hidden>?</span>
        Ask a question
      </button>

      {sentRef && !open && (
        <span className="text-[12.5px] text-emerald-700">
          ✓ Question sent for {sentRef} — the lab will reply by email.
        </span>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ask-question-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[1px] px-4 py-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-xl">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200">
              <h2
                id="ask-question-title"
                className="font-serif text-lg text-navy"
              >
                Ask about {order.order_number ?? `#${order.id}`}
              </h2>
              <p className="mt-1 text-[12.5px] text-gray-500">
                Sends the lab a message tied to this order. They&apos;ll reply
                to your portal email address.
              </p>
            </div>
            <div className="px-5 sm:px-6 py-5">
              <label
                htmlFor="ask-question-text"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Your question
              </label>
              <textarea
                id="ask-question-text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status.kind === "error") setStatus({ kind: "idle" });
                }}
                rows={6}
                maxLength={QUESTION_MAX_LEN}
                placeholder="e.g. Can the delivery date move up by 2 days?"
                disabled={status.kind === "submitting"}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors disabled:opacity-60"
              />
              <div className="mt-1 flex items-center justify-between text-[11.5px] text-gray-400">
                <span>
                  {message.length} / {QUESTION_MAX_LEN}
                </span>
                {status.kind === "error" && (
                  <span className="text-red-600">{status.message}</span>
                )}
              </div>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={status.kind === "submitting"}
                className="px-4 py-2 rounded-full text-[13px] text-gray-600 hover:text-navy transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  status.kind === "submitting" || message.trim().length === 0
                }
                className="px-4 py-2 rounded-full text-[13px] font-medium bg-navy text-white hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status.kind === "submitting" ? "Sending…" : "Send to lab"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Files (R2-backed downloads, Phase 1.5b) ──────────────────────────

const FILE_CATEGORY_LABELS: Record<string, string> = {
  stl: "STL",
  photo: "Photo",
  rx_pdf: "Rx PDF",
  other: "Other",
};

function formatBytes(bytes: number | null): string {
  if (bytes == null || !Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileList({
  orderId,
  files,
}: {
  orderId: number;
  files: PortalOrderFile[];
}) {
  return (
    <ul className="divide-y divide-gray-100 -mx-5 sm:-mx-7">
      {files.map((file) => {
        const label =
          FILE_CATEGORY_LABELS[file.category] ?? file.category;
        return (
          <li
            key={file.id}
            className="px-5 sm:px-7 py-3 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center text-[10.5px] font-semibold uppercase tracking-widest text-navy bg-navy/5 border border-navy/20 px-2 py-0.5 rounded-full">
                  {label}
                </span>
                <span className="text-[14px] text-navy truncate">
                  {file.filename}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-gray-500">
                {formatBytes(file.size_bytes)}
                {file.content_type ? ` · ${file.content_type}` : ""}
              </div>
            </div>
            <a
              href={orderFileDownloadUrl(orderId, file.id)}
              className="shrink-0 inline-flex items-center gap-1.5 text-[13px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
              download={file.filename}
            >
              Download
              <span aria-hidden>↓</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Edit order (aso_staff only) ──────────────────────────────────────

interface EditOrderFormState {
  order_number: string;
  patient_name: string;
  appliance_type: string;
  order_date: string;
  delivery_date: string;
  tracking_number: string;
  tracking_carrier: string;
  delivery_notes: string;
  additional_memo: string;
  internal_memo: string;
}

function orderToEditForm(order: OrderDetail): EditOrderFormState {
  return {
    order_number: order.order_number ?? "",
    patient_name: order.patient_name ?? "",
    appliance_type: order.appliance_type ?? "",
    order_date: order.order_date ?? "",
    delivery_date: order.delivery_date ?? "",
    tracking_number: order.tracking_number ?? "",
    tracking_carrier: order.tracking_carrier ?? "",
    delivery_notes: order.delivery_notes ?? "",
    additional_memo: order.additional_memo ?? "",
    internal_memo:
      typeof order.internal_memo === "string" ? order.internal_memo : "",
  };
}

function diffEditForm(
  original: EditOrderFormState,
  next: EditOrderFormState,
): UpdateOrderInput {
  const out: UpdateOrderInput = {};
  (Object.keys(next) as (keyof EditOrderFormState)[]).forEach((k) => {
    if (next[k] !== original[k]) {
      // Empty string → null on the server side; we still send the empty
      // string to make the intent ("clear this field") explicit.
      (out as Record<string, string | null>)[k] = next[k];
    }
  });
  return out;
}

function EditOrderButton({
  order,
  onUpdated,
}: {
  order: OrderDetail;
  onUpdated: (order: OrderDetail) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EditOrderFormState>(() =>
    orderToEditForm(order),
  );
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const original = useMemo(() => orderToEditForm(order), [order]);

  function close() {
    if (busy) return;
    setOpen(false);
    setErrorMsg(null);
    setForm(orderToEditForm(order));
  }

  function bind<K extends keyof EditOrderFormState>(k: K) {
    return {
      value: form[k],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setForm((f) => ({ ...f, [k]: e.target.value })),
      disabled: busy,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const diff = diffEditForm(original, form);
    if (Object.keys(diff).length === 0) {
      setErrorMsg("No changes to save.");
      return;
    }
    setBusy(true);
    const res = await updateOrder(order.id, diff);
    setBusy(false);
    if (res.ok) {
      onUpdated(res.data.order);
      setFlash(`Saved ${res.data.changes} field(s).`);
      setOpen(false);
      window.setTimeout(
        () => setFlash((f) => (f && f.startsWith("Saved ") ? null : f)),
        4500,
      );
      return;
    }
    setErrorMsg(res.error);
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors disabled:opacity-60";
  const labelClass =
    "block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setForm(orderToEditForm(order));
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-amber-300 bg-amber-50/60 text-amber-900 hover:bg-amber-100 transition-colors"
      >
        <span aria-hidden>✎</span>
        Edit order
        <span className="text-[10px] uppercase tracking-widest text-amber-700">
          Staff
        </span>
      </button>

      {flash && !open && (
        <span className="text-[12.5px] text-emerald-700">✓ {flash}</span>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-order-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[1px] px-4 py-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-xl">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200">
              <h2
                id="edit-order-title"
                className="font-serif text-lg text-navy"
              >
                Edit {order.order_number ?? `#${order.id}`}
              </h2>
              <p className="mt-1 text-[12.5px] text-gray-500">
                Internal staff edit. Changes are recorded in the audit log
                with a per-field from→to diff.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="px-5 sm:px-6 py-5 grid gap-3 max-h-[70vh] overflow-y-auto"
              noValidate
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-order-number" className={labelClass}>
                    Order number
                  </label>
                  <input
                    id="edit-order-number"
                    type="text"
                    className={inputClass}
                    {...bind("order_number")}
                  />
                </div>
                <div>
                  <label htmlFor="edit-patient-name" className={labelClass}>
                    Patient name
                  </label>
                  <input
                    id="edit-patient-name"
                    type="text"
                    className={inputClass}
                    {...bind("patient_name")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="edit-appliance" className={labelClass}>
                    Appliance type
                  </label>
                  <input
                    id="edit-appliance"
                    type="text"
                    className={inputClass}
                    {...bind("appliance_type")}
                  />
                </div>
                <div>
                  <label htmlFor="edit-order-date" className={labelClass}>
                    Order date
                  </label>
                  <input
                    id="edit-order-date"
                    type="date"
                    className={inputClass}
                    {...bind("order_date")}
                  />
                </div>
                <div>
                  <label htmlFor="edit-delivery-date" className={labelClass}>
                    Delivery date
                  </label>
                  <input
                    id="edit-delivery-date"
                    type="date"
                    className={inputClass}
                    {...bind("delivery_date")}
                  />
                </div>
                <div>
                  <label htmlFor="edit-tracking-number" className={labelClass}>
                    Tracking number
                  </label>
                  <input
                    id="edit-tracking-number"
                    type="text"
                    className={inputClass}
                    {...bind("tracking_number")}
                  />
                </div>
                <div>
                  <label htmlFor="edit-tracking-carrier" className={labelClass}>
                    Carrier
                  </label>
                  <input
                    id="edit-tracking-carrier"
                    type="text"
                    placeholder="USPS / UPS / FedEx / Walking"
                    className={inputClass}
                    {...bind("tracking_carrier")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-delivery-notes" className={labelClass}>
                  Delivery notes
                </label>
                <textarea
                  id="edit-delivery-notes"
                  rows={3}
                  className={inputClass}
                  {...bind("delivery_notes")}
                />
              </div>

              <div>
                <label htmlFor="edit-additional-memo" className={labelClass}>
                  Additional memo{" "}
                  <span className="text-gray-400 normal-case">
                    (visible to the clinic)
                  </span>
                </label>
                <textarea
                  id="edit-additional-memo"
                  rows={2}
                  className={inputClass}
                  {...bind("additional_memo")}
                />
              </div>

              <div>
                <label htmlFor="edit-internal-memo" className={labelClass}>
                  Internal memo{" "}
                  <span className="text-amber-700 normal-case">
                    (ASO staff only, never returned to clinic users)
                  </span>
                </label>
                <textarea
                  id="edit-internal-memo"
                  rows={3}
                  className={`${inputClass} bg-amber-50/40 border-amber-200/70`}
                  {...bind("internal_memo")}
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
                >
                  {errorMsg}
                </div>
              )}
            </form>
            <div className="px-5 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="px-4 py-2 rounded-full text-[13px] text-gray-600 hover:text-navy transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={busy}
                className="px-4 py-2 rounded-full text-[13px] font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
      <div className="px-5 sm:px-7 py-4 border-b border-gray-200">
        <h2 className="font-serif text-lg text-navy">{title}</h2>
      </div>
      <div className="px-5 sm:px-7 py-5">{children}</div>
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</dl>
  );
}

interface FieldProps {
  label: string;
  value?: string | null;
  valueNode?: React.ReactNode;
  full?: boolean;
  wrap?: boolean;
  mono?: boolean;
  emphasis?: boolean;
}

function Field({
  label,
  value,
  valueNode,
  full,
  wrap,
  mono,
  emphasis,
}: FieldProps) {
  const empty = !valueNode && (value === null || value === undefined || value === "");
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt
        className={`text-[10.5px] uppercase tracking-widest ${
          emphasis ? "text-amber-700" : "text-gray-500"
        } mb-1`}
      >
        {label}
      </dt>
      <dd
        className={`text-[14px] ${
          empty ? "text-gray-400" : "text-navy"
        } ${mono ? "font-mono text-[13px]" : ""} ${
          wrap ? "whitespace-pre-wrap leading-relaxed" : ""
        } ${
          emphasis ? "rounded-lg bg-amber-50 border border-amber-200/70 px-3 py-2" : ""
        }`}
      >
        {valueNode ?? (empty ? "—" : value)}
      </dd>
    </div>
  );
}
