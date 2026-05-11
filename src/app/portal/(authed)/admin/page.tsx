"use client";

/**
 * Admin landing — entry point for ASO staff tools. Mixes navigation
 * (Audit Log) with one-shot actions (Run VisualDLP Sync). User management
 * / clinic CRUD / sync controls beyond this stub arrive in Phase 1.4d.
 */

import Link from "next/link";
import { useState } from "react";
import {
  triggerVisualDlpSync,
  type VisualDlpSyncResponse,
} from "@/lib/portal/admin";

interface ToolLink {
  href: string;
  label: string;
  description: string;
}

const NAV_TOOLS: ToolLink[] = [
  {
    href: "/portal/admin/audit/",
    label: "Audit Log",
    description:
      "Cross-clinic action history — logins, OAuth events, password changes, sync events, and other auditable activity.",
  },
];

export default function AdminLandingPage() {
  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-4xl">
        <header className="mb-6 sm:mb-8">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            ASO Staff
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
            Admin
          </h1>
        </header>

        <div className="grid gap-3">
          {NAV_TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-navy/40 transition-colors"
            >
              <div className="font-medium text-navy">{t.label}</div>
              <div className="mt-1 text-[13px] text-gray-600">
                {t.description}
              </div>
            </Link>
          ))}

          <VisualDlpSyncCard />
        </div>
      </div>
    </div>
  );
}

type SyncUiState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; result: VisualDlpSyncResponse }
  | { status: "error"; message: string };

function VisualDlpSyncCard() {
  const [ui, setUi] = useState<SyncUiState>({ status: "idle" });

  async function handleRun() {
    setUi({ status: "running" });
    const res = await triggerVisualDlpSync();
    if (res.ok) {
      setUi({ status: "done", result: res.data });
    } else {
      setUi({ status: "error", message: res.error });
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-medium text-navy">VisualDLP Sync</div>
          <div className="mt-1 text-[13px] text-gray-600 max-w-2xl leading-relaxed">
            Pull recent orders from VisualDLP into the portal. Runs
            automatically every 4 hours (06:00 / 10:00 / 14:00 / 18:00 /
            22:00 HST). Use this button to trigger a manual sync; results
            are recorded in the audit log.
          </div>
          <div className="mt-1 text-[11.5px] uppercase tracking-widest text-amber-700">
            Stub — Phase 1.4b-2 will wire the real fetch
          </div>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={ui.status === "running"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-navy text-white hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {ui.status === "running" ? "Running…" : "Run sync now"}
        </button>
      </div>

      {ui.status === "done" && ui.result.ok && (
        <div className="mt-4 rounded-xl bg-emerald-50/60 border border-emerald-200 px-4 py-3 text-[12.5px] text-emerald-900">
          <div className="font-medium">
            ✓ Sync completed in {ui.result.duration_ms} ms
          </div>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-emerald-800">
            <span>Fetched: {ui.result.fetched}</span>
            <span>Upserted: {ui.result.upserted}</span>
            <span>Skipped: {ui.result.skipped}</span>
            <span>Errors: {ui.result.errors}</span>
          </div>
          <div className="mt-1 text-emerald-700">{ui.result.message}</div>
        </div>
      )}

      {ui.status === "done" && !ui.result.ok && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12.5px] text-red-700">
          ✗ Sync failed in {ui.result.duration_ms} ms — {ui.result.error}
        </div>
      )}

      {ui.status === "error" && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12.5px] text-red-700">
          ✗ {ui.message}
        </div>
      )}
    </div>
  );
}
