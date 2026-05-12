"use client";

/**
 * Admin landing — entry point for ASO staff tools. Mixes navigation
 * (Audit Log) with one-shot actions (Invite a user, Run VisualDLP Sync).
 * Clinic CRUD / cross-clinic order management arrive in later 1.4d steps.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminClinics,
  inviteUser,
  triggerVisualDlpSync,
  type AdminClinicSummary,
  type VisualDlpSyncResponse,
} from "@/lib/portal/admin";

interface ToolLink {
  href: string;
  label: string;
  description: string;
}

const NAV_TOOLS: ToolLink[] = [
  {
    href: "/portal/admin/users/",
    label: "Users",
    description:
      "Portal accounts across all clinics. Promote / demote, deactivate, and see last-login activity.",
  },
  {
    href: "/portal/admin/clinics/",
    label: "Clinics",
    description:
      "Clinic master records — contact info, ASO account number, and visualdlp_account_id used for sync mapping.",
  },
  {
    href: "/portal/admin/audit/",
    label: "Audit Log",
    description:
      "Cross-clinic action history — logins, OAuth events, password changes, sync events, invitations, and other auditable activity.",
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

          <InviteUserCard />
          <VisualDlpSyncCard />
        </div>
      </div>
    </div>
  );
}

// ─── Invite a user ────────────────────────────────────────────────────

interface InviteUserResult {
  email: string;
  expiresAt: string;
}

function InviteUserCard() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<InviteUserResult | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-medium text-navy">Invite a user</div>
          <div className="mt-1 text-[13px] text-gray-600 max-w-2xl leading-relaxed">
            Send an invitation email so a clinic doctor or staff member can
            claim a Doctor Portal account. The link expires in 7 days.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-navy text-white hover:bg-navy-light transition-colors"
        >
          + Invite
        </button>
      </div>

      {last && (
        <div className="mt-4 rounded-xl bg-emerald-50/60 border border-emerald-200 px-4 py-3 text-[12.5px] text-emerald-900">
          ✓ Invitation sent to <strong>{last.email}</strong>. Expires{" "}
          {last.expiresAt}.
        </div>
      )}

      {open && (
        <InviteUserModal
          onClose={() => setOpen(false)}
          onSent={(r) => {
            setLast(r);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

type ClinicSelection =
  | { kind: "existing"; clinic_id: number | null }
  | { kind: "new"; name: string };

interface ModalProps {
  onClose: () => void;
  onSent: (r: InviteUserResult) => void;
}

function InviteUserModal({ onClose, onSent }: ModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [clinicSel, setClinicSel] = useState<ClinicSelection>({
    kind: "existing",
    clinic_id: null,
  });

  const [clinics, setClinics] = useState<AdminClinicSummary[] | null>(null);
  const [clinicsError, setClinicsError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminClinics().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setClinics(res.data.clinics);
        setClinicSel((sel) =>
          sel.kind === "existing" && sel.clinic_id == null
            ? {
                kind: "existing",
                clinic_id: res.data.clinics[0]?.id ?? null,
              }
            : sel,
        );
      } else {
        setClinicsError(res.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const close = useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setErrorMsg("Enter a valid email address.");
      return;
    }

    let clinicArgs: { clinic_id?: number; new_clinic_name?: string };
    if (clinicSel.kind === "existing") {
      if (!clinicSel.clinic_id) {
        setErrorMsg("Pick an existing clinic or switch to a new one.");
        return;
      }
      clinicArgs = { clinic_id: clinicSel.clinic_id };
    } else {
      const trimmedName = clinicSel.name.trim();
      if (!trimmedName) {
        setErrorMsg("Enter the new clinic's name.");
        return;
      }
      clinicArgs = { new_clinic_name: trimmedName };
    }

    setBusy(true);
    const res = await inviteUser({
      email: emailTrim,
      name: name.trim() || undefined,
      role,
      ...clinicArgs,
    });
    setBusy(false);
    if (res.ok) {
      onSent({ email: emailTrim, expiresAt: res.data.expires_at });
      return;
    }
    setErrorMsg(res.error);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-user-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[1px] px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-xl">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200">
          <h2 id="invite-user-title" className="font-serif text-lg text-navy">
            Invite a user
          </h2>
          <p className="mt-1 text-[12.5px] text-gray-500">
            They&apos;ll get an email with a 7-day link to set their password.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-5 sm:px-6 py-5 grid gap-4"
          noValidate
        >
          <div>
            <label
              htmlFor="invite-email"
              className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
            >
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={busy}
              placeholder="dr.smith@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="invite-name"
              className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
            >
              Name <span className="text-gray-400 normal-case">(optional)</span>
            </label>
            <input
              id="invite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={busy}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors disabled:opacity-60"
            />
          </div>

          <fieldset disabled={busy}>
            <legend className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
              Clinic
            </legend>
            <div className="grid gap-2">
              <label className="flex items-start gap-3 cursor-pointer rounded-xl border bg-white px-3 py-2.5 text-[13.5px] text-navy">
                <input
                  type="radio"
                  name="clinic-kind"
                  className="mt-0.5 accent-navy"
                  checked={clinicSel.kind === "existing"}
                  onChange={() =>
                    setClinicSel({
                      kind: "existing",
                      clinic_id: clinics?.[0]?.id ?? null,
                    })
                  }
                />
                <span className="flex-1">
                  Existing clinic
                  {clinicSel.kind === "existing" && (
                    <select
                      value={clinicSel.clinic_id ?? ""}
                      onChange={(e) =>
                        setClinicSel({
                          kind: "existing",
                          clinic_id: e.target.value
                            ? Number.parseInt(e.target.value, 10)
                            : null,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13.5px] text-navy"
                    >
                      {clinics == null ? (
                        <option value="">Loading clinics…</option>
                      ) : clinics.length === 0 ? (
                        <option value="">No clinics yet — create a new one</option>
                      ) : (
                        clinics.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {!c.is_active ? " (inactive)" : ""}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  {clinicsError && clinicSel.kind === "existing" && (
                    <span className="block mt-1 text-[12px] text-red-700">
                      {clinicsError}
                    </span>
                  )}
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer rounded-xl border bg-white px-3 py-2.5 text-[13.5px] text-navy">
                <input
                  type="radio"
                  name="clinic-kind"
                  className="mt-0.5 accent-navy"
                  checked={clinicSel.kind === "new"}
                  onChange={() => setClinicSel({ kind: "new", name: "" })}
                />
                <span className="flex-1">
                  New clinic
                  {clinicSel.kind === "new" && (
                    <input
                      type="text"
                      value={clinicSel.name}
                      onChange={(e) =>
                        setClinicSel({ kind: "new", name: e.target.value })
                      }
                      placeholder="Clinic name"
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13.5px] text-navy"
                    />
                  )}
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
              Role
            </legend>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center gap-2 cursor-pointer rounded-xl border bg-white px-3 py-2.5 text-[13.5px] text-navy">
                <input
                  type="radio"
                  name="invite-role"
                  className="accent-navy"
                  checked={role === "member"}
                  onChange={() => setRole("member")}
                />
                <span>Member</span>
              </label>
              <label className="flex-1 flex items-center gap-2 cursor-pointer rounded-xl border bg-white px-3 py-2.5 text-[13.5px] text-navy">
                <input
                  type="radio"
                  name="invite-role"
                  className="accent-navy"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />
                <span>Clinic admin</span>
              </label>
            </div>
            <p className="mt-1 text-[12px] text-gray-500">
              ASO staff role can&apos;t be assigned through this flow — use
              the seed script for internal hires.
            </p>
          </fieldset>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
            >
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
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
              disabled={busy}
              className="px-4 py-2 rounded-full text-[13px] font-medium bg-brandOrange text-white hover:bg-brandOrange/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? "Sending…" : "Send invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── VisualDLP sync ───────────────────────────────────────────────────

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
            VisualDLP orders are ingested from the local pipeline
            (sync_visualdlp_to_portal.py) every 4 hours — see the audit
            log for{" "}
            <code className="font-mono text-[12px] text-navy">
              sync_visualdlp_ingested
            </code>{" "}
            events to inspect each run. The button below hits the
            no-op trigger from Phase 1.4b-1; it's useful for verifying
            the audit pipeline but does not pull new data.
          </div>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={ui.status === "running"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {ui.status === "running" ? "Running…" : "Run no-op probe"}
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
