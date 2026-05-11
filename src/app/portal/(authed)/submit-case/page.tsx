"use client";

/**
 * Portal-side Submit Case page.
 *
 * Wraps the shared <SubmitCaseForm /> with:
 *   - prefill from the resolved session (clinic name, doctor = user name,
 *     email, phone) so the practice step is one-click-through;
 *   - an afterSubmitSuccess callback that writes a portal_orders row via
 *     POST /api/portal/orders/submit so the clinic sees the case on their
 *     dashboard immediately after a successful Formspree submit;
 *   - a "View in Dashboard" link on the success screen.
 *
 * Failures of the portal-side write are intentionally swallowed by
 * SubmitCaseForm: Formspree (the lab's email workflow) is the source of
 * truth and the dashboard visibility is best-effort.
 */

import { Suspense } from "react";
import { SubmitCaseForm } from "@/components/submitcase/SubmitCaseForm";
import type { FormState } from "@/components/submitcase/types";
import { usePortalSession } from "../session-context";

export default function PortalSubmitCasePage() {
  const { user, clinic } = usePortalSession();

  const prefill = {
    practice: {
      name: clinic.name,
      doctor: user.name ?? "",
      email: user.email,
      phone: user.phone || clinic.phone || "",
    },
  };

  async function afterSubmitSuccess({
    state,
    reference,
    appliancesSummary,
  }: {
    state: FormState;
    reference: string;
    appliancesSummary: string;
  }) {
    const stlFiles = state.files.stl.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      category: "stl" as const,
    }));
    const photoFiles = state.files.photos.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      category: "photos" as const,
    }));
    const rxPdfFiles = state.files.rxPdf.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      category: "rxPdf" as const,
    }));

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
        shipping_address: state.delivery.address,
        special_instructions: state.delivery.instructions,
        files: [...stlFiles, ...photoFiles, ...rxPdfFiles],
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

        <Suspense
          fallback={
            <div className="text-center text-gray-400 text-sm py-10">
              Loading form…
            </div>
          }
        >
          <SubmitCaseForm
            prefill={prefill}
            afterSubmitSuccess={afterSubmitSuccess}
            successDashboardHref="/portal/dashboard/"
          />
        </Suspense>
      </div>
    </div>
  );
}
