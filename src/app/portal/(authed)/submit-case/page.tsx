"use client";

/**
 * Portal-side Submit Case page.
 *
 * Wraps the shared <SubmitCaseForm /> with:
 *   - prefill from the resolved session (clinic name, doctor = user name,
 *     email, phone) so the practice step is one-click-through;
 *   - optional reorder prefill from `?from=<orderId>` — fetches the prior
 *     order and copies arches / appliances / tooth_selection /
 *     patient_reference into the form state (files + delivery dates are
 *     deliberately not copied);
 *   - an afterSubmitSuccess callback that writes a portal_orders row via
 *     POST /api/portal/orders/submit so the clinic sees the case on their
 *     dashboard immediately after a successful Formspree submit;
 *   - a "View in Dashboard" link on the success screen.
 *
 * Failures of the portal-side write are intentionally swallowed by
 * SubmitCaseForm: Formspree (the lab's email workflow) is the source of
 * truth and the dashboard visibility is best-effort.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SubmitCaseForm } from "@/components/submitcase/SubmitCaseForm";
import {
  formatShippingAddress,
  type ApplianceConfig,
  type Arches,
  type Dentition,
  type FormState,
  type ToothSelection,
} from "@/components/submitcase/types";
import { fetchOrder, type OrderDetail } from "@/lib/portal/orders";
import {
  uploadPortalFile,
  type PortalUploadCategory,
} from "@/lib/portal/uploads";
import { usePortalSession } from "../session-context";

type ReorderState =
  | { status: "none" }
  | { status: "loading"; fromId: number }
  | { status: "ready"; fromId: number; order: OrderDetail }
  | { status: "error"; fromId: number; message: string };

function isValidArches(v: unknown): v is Arches {
  return v === "upper" || v === "lower" || v === "both";
}

function isValidDentition(v: unknown): v is Dentition {
  return v === "permanent" || v === "mixed" || v === "primary";
}

export default function PortalSubmitCasePage() {
  const { user, clinic } = usePortalSession();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get("from") ?? null;
  const fromId = useMemo(() => {
    if (!fromParam) return null;
    const n = Number.parseInt(fromParam, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [fromParam]);

  const [reorder, setReorder] = useState<ReorderState>(() =>
    fromId == null ? { status: "none" } : { status: "loading", fromId },
  );

  useEffect(() => {
    if (fromId == null) {
      setReorder({ status: "none" });
      return;
    }
    const ctrl = new AbortController();
    setReorder({ status: "loading", fromId });
    fetchOrder(fromId, ctrl.signal).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res.ok) {
        setReorder({ status: "ready", fromId, order: res.data });
      } else if (res.error !== "aborted") {
        setReorder({
          status: "error",
          fromId,
          message:
            res.status === 404
              ? "Original order not found or not accessible."
              : res.error,
        });
      }
    });
    return () => ctrl.abort();
  }, [fromId]);

  const sessionPrefill: Partial<FormState> = {
    practice: {
      name: clinic.name,
      doctor: user.name ?? "",
      email: user.email,
      phone: user.phone || clinic.phone || "",
    },
  };

  const prefill: Partial<FormState> = useMemo(() => {
    if (reorder.status !== "ready" || !reorder.order.reorder) {
      return sessionPrefill;
    }
    const rd = reorder.order.reorder;
    const merged: Partial<FormState> = { ...sessionPrefill };
    merged.patient = {
      reference: rd.patient_reference ?? "",
    };
    if (isValidArches(rd.arches)) merged.arches = rd.arches;
    merged.archSync = rd.arch_sync;
    merged.upperAppliances = rd.appliances_upper as ApplianceConfig[];
    merged.lowerAppliances = rd.appliances_lower as ApplianceConfig[];
    if (rd.tooth_selection) {
      const ts = rd.tooth_selection;
      const dentition: Dentition = isValidDentition(ts.dentition)
        ? ts.dentition
        : "permanent";
      const toothSelection: ToothSelection = {
        dentition,
        upper: Array.isArray(ts.upper) ? ts.upper : [],
        lower: Array.isArray(ts.lower) ? ts.lower : [],
      };
      merged.toothSelection = toothSelection;
    }
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorder, clinic.name, clinic.phone, user.name, user.email, user.phone]);

  async function afterSubmitSuccess({
    state,
    reference,
    appliancesSummary,
  }: {
    state: FormState;
    reference: string;
    appliancesSummary: string;
  }) {
    // Map the in-form per-arch file buckets onto the upload+submit category
    // pair we need at the API boundary. The form keeps 'stl' / 'photos' /
    // 'rxPdf' because those map cleanly to its FileUploadField; the upload
    // endpoint uses 'stl' / 'photo' / 'rx_pdf' as the database category.
    type FormCategory = "stl" | "photos" | "rxPdf";
    interface FileWithCategory {
      file: File;
      formCategory: FormCategory;
      uploadCategory: PortalUploadCategory;
    }
    const allFiles: FileWithCategory[] = [
      ...state.files.stl.map((f) => ({
        file: f,
        formCategory: "stl" as const,
        uploadCategory: "stl" as const,
      })),
      ...state.files.photos.map((f) => ({
        file: f,
        formCategory: "photos" as const,
        uploadCategory: "photo" as const,
      })),
      ...state.files.rxPdf.map((f) => ({
        file: f,
        formCategory: "rxPdf" as const,
        uploadCategory: "rx_pdf" as const,
      })),
    ];

    // Upload to R2 in parallel, best-effort. Files that fail to upload
    // still flow to the lab via the Formspree email attachment we already
    // sent moments ago — they'll just be missing from the portal's
    // downloads section. R2 503 (bucket unbound) is the common case while
    // Phase 1.5b is rolling out.
    const uploadResults = await Promise.all(
      allFiles.map(({ file, uploadCategory }) =>
        uploadPortalFile(file, uploadCategory),
      ),
    );

    const filesForSubmit = allFiles.map((entry, i) => {
      const result = uploadResults[i];
      return {
        name: entry.file.name,
        size: entry.file.size,
        type: entry.file.type,
        category: entry.formCategory,
        r2_key: result.ok ? result.key : undefined,
      };
    });

    const doctorOverride =
      state.practice.doctor && state.practice.doctor !== user.name
        ? state.practice.doctor
        : undefined;

    const res = await fetch("/api/portal/orders/submit", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        patient_reference: state.patient.reference,
        arches: state.arches,
        arch_sync: state.archSync,
        appliances_summary: appliancesSummary,
        appliances_json: {
          upper: state.upperAppliances,
          lower: state.lowerAppliances,
        },
        tooth_selection: state.toothSelection,
        due_date: state.delivery.dueDate,
        shipping_address: formatShippingAddress(state.delivery.address),
        special_instructions: state.delivery.instructions,
        files: filesForSubmit,
        doctor_override: doctorOverride,
      }),
    });
    if (!res.ok) {
      throw new Error(`Portal submission write failed (${res.status}).`);
    }
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-3xl">
        <header className="mb-6 sm:mb-8">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            {clinic.name}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
            Submit a Case
          </h1>
          <p className="mt-2 text-[13px] text-gray-500">
            Submitting as{" "}
            <span className="text-navy">{user.name ?? user.email}</span>. Your
            case will appear in your dashboard once submitted.
          </p>
        </header>

        {reorder.status === "ready" && reorder.order.reorder && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-start justify-between gap-3 flex-wrap">
            <div className="text-[13px] text-emerald-900">
              <span className="font-medium">Reordering from</span>{" "}
              <Link
                href={`/portal/orders/?id=${reorder.order.id}`}
                className="underline underline-offset-2 hover:text-emerald-700"
              >
                {reorder.order.order_number ?? `#${reorder.order.id}`}
              </Link>
              {reorder.order.patient_name && (
                <>
                  {" · "}
                  <span className="text-emerald-800">
                    {reorder.order.patient_name}
                  </span>
                </>
              )}
              . Appliance, arches, and tooth selection have been pre-filled —
              update patient reference and files before submitting.
            </div>
          </div>
        )}

        {reorder.status === "ready" && !reorder.order.reorder && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-[13px] text-amber-900">
            This order&apos;s spec couldn&apos;t be reused (only portal-
            submitted cases carry the full form state). The form below has
            been started from blank — your practice info is still pre-filled.
          </div>
        )}

        {reorder.status === "error" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {reorder.message}
          </div>
        )}

        {reorder.status === "loading" && (
          <div className="text-center text-gray-400 text-sm py-10">
            Loading prior order…
          </div>
        )}

        {reorder.status !== "loading" && (
          <Suspense
            fallback={
              <div className="text-center text-gray-400 text-sm py-10">
                Loading form…
              </div>
            }
          >
            <SubmitCaseForm
              key={
                reorder.status === "ready" ? `reorder-${reorder.fromId}` : "blank"
              }
              prefill={prefill}
              afterSubmitSuccess={afterSubmitSuccess}
              successDashboardHref="/portal/dashboard/"
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
