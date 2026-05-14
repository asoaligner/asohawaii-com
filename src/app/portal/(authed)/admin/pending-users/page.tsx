"use client";

/**
 * /portal/admin/pending-users/ — aso_staff review queue for Phase 2.1
 * access applications. Mirrors the visual style of /admin/users/.
 *
 * UX:
 *   • Default tab = Pending; counts are shown as badges on each tab so
 *     the queue size is obvious from the first frame.
 *   • Each row expands to show the full applicant payload + stated
 *     reason, plus inline Approve / Reject buttons.
 *   • Approve opens a modal asking which clinic to attach. Reject asks
 *     for a reason that will be sent verbatim in the rejection email.
 *   • Deep-link via ?id=N highlights the row and auto-scrolls.
 */

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  approvePendingUser,
  fetchAdminClinics,
  fetchPendingUsers,
  rejectPendingUser,
  type AdminClinicSummary,
  type PendingUserRow,
} from "@/lib/portal/admin";

type Status = "pending" | "approved" | "rejected" | "all";

function PendingUsersInner() {
  const params = useSearchParams();
  const focusId = params.get("id");

  const [status, setStatus] = useState<Status>("pending");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [rows, setRows] = useState<PendingUserRow[] | null>(null);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [approveTarget, setApproveTarget] = useState<PendingUserRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingUserRow | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    fetchPendingUsers({ status, q: debouncedQ }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setRows(res.data.pending_users);
        setCounts(res.data.counts);
        setLoadError(null);
      } else {
        setLoadError(res.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [status, debouncedQ, reloadToken]);

  // Auto-scroll to focused row after rows load
  useEffect(() => {
    if (!focusId || !rows) return;
    const target = document.getElementById(`pending-row-${focusId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId, rows]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-5xl">
        <header className="mb-6">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            ASO admin
          </p>
          <h1 className="font-serif text-3xl text-navy mt-1 leading-tight">
            Access applications
          </h1>
          <p className="mt-2 text-[13px] text-gray-500">
            Doctors and clinics who applied via{" "}
            <Link
              href="/portal/request-access/"
              className="underline underline-offset-2 hover:text-navy"
            >
              /portal/request-access/
            </Link>{" "}
            or were diverted from an unrecognised Google sign-in. Approve
            assigns them a clinic; reject sends a reason to the applicant.
          </p>
        </header>

        {/* Status tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(
            [
              { v: "pending" as const, label: "Pending", count: counts.pending },
              { v: "approved" as const, label: "Approved", count: counts.approved },
              { v: "rejected" as const, label: "Rejected", count: counts.rejected },
              { v: "all" as const, label: "All", count: null as number | null },
            ]
          ).map((tab) => (
            <button
              key={tab.v}
              type="button"
              onClick={() => setStatus(tab.v)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                status === tab.v
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-gray-200 hover:border-navy"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count != null && (
                <span
                  className={`rounded-full px-2 py-[1px] text-[10.5px] font-medium ${
                    status === tab.v
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search email / clinic / doctor"
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[13px] text-navy w-72 focus:border-navy focus:outline-none"
            />
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {loadError}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white">
          {rows == null ? (
            <div className="p-8 text-center text-[13px] text-gray-500">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-gray-500">
              No applications {status === "all" ? "yet" : `with status ${status}`}.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((row) => (
                <PendingRow
                  key={row.id}
                  row={row}
                  highlight={String(row.id) === focusId}
                  onApprove={() => setApproveTarget(row)}
                  onReject={() => setRejectTarget(row)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {approveTarget && (
        <ApproveModal
          row={approveTarget}
          onClose={() => setApproveTarget(null)}
          onDone={() => {
            setApproveTarget(null);
            reload();
          }}
        />
      )}
      {rejectTarget && (
        <RejectModal
          row={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onDone={() => {
            setRejectTarget(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function PendingRow({
  row,
  highlight,
  onApprove,
  onReject,
}: {
  row: PendingUserRow;
  highlight: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(highlight);
  useEffect(() => {
    if (highlight) setOpen(true);
  }, [highlight]);

  const isPending = row.status === "pending";

  return (
    <li
      id={`pending-row-${row.id}`}
      className={`p-4 sm:p-5 ${highlight ? "bg-brandOrange/5" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-navy text-[14px]">
              {row.doctor_name || row.name || "(unnamed)"}
            </span>
            <span className="text-[12.5px] text-gray-500">·</span>
            <span className="text-[13px] text-gray-700">{row.clinic_name}</span>
            {row.google_id && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-[1px] text-[10.5px] font-medium">
                Google verified
              </span>
            )}
            <span
              className={`rounded-full px-2 py-[1px] text-[10.5px] font-medium ${
                row.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : row.status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {row.status}
            </span>
          </div>
          <div className="mt-0.5 text-[12.5px] text-gray-500">
            {row.email} ·{" "}
            <span className="text-gray-400">
              applied {row.attempted_at.replace("T", " ").slice(0, 16)}
            </span>
            {row.aso_account_number && (
              <span className="text-gray-400">
                {" "}
                · ASO# {row.aso_account_number}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPending && (
            <>
              <button
                onClick={onReject}
                className="rounded-full border border-gray-200 text-gray-700 px-3 py-1.5 text-[12.5px] hover:border-red-300 hover:text-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="rounded-full bg-brandOrange text-white px-3 py-1.5 text-[12.5px] font-medium hover:bg-brandOrange/90 transition-colors"
              >
                Approve
              </button>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-gray-200 text-gray-500 px-2 py-1.5 text-[12.5px] hover:border-navy hover:text-navy transition-colors"
            aria-expanded={open}
          >
            {open ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[12.5px]">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
              EasyRx email
            </div>
            <div className="text-navy">{row.easyrx_email || "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
              Submission IP
            </div>
            <div className="text-navy font-mono">{row.ip_address || "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
              Stated reason
            </div>
            <div className="text-navy whitespace-pre-wrap">
              {row.reason || "—"}
            </div>
          </div>
          {row.status === "approved" && (
            <div className="sm:col-span-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
              Approved {row.reviewed_at?.replace("T", " ").slice(0, 16)} by{" "}
              <strong>{row.reviewer_name || row.reviewer_email}</strong> → clinic{" "}
              <strong>{row.approved_clinic_name}</strong>
            </div>
          )}
          {row.status === "rejected" && (
            <div className="sm:col-span-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-gray-400">
                Rejection reason
              </div>
              <div className="text-navy whitespace-pre-wrap">
                {row.rejection_reason}
              </div>
              <div className="mt-1 text-[11.5px] text-gray-500">
                Rejected {row.reviewed_at?.replace("T", " ").slice(0, 16)} by{" "}
                {row.reviewer_name || row.reviewer_email}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function ApproveModal({
  row,
  onClose,
  onDone,
}: {
  row: PendingUserRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [clinics, setClinics] = useState<AdminClinicSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [role, setRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminClinics().then((res) => {
      if (res.ok) setClinics(res.data.clinics);
      else setErr(res.error);
    });
  }, []);

  const filteredClinics = useMemo(() => {
    if (!clinics) return [];
    const s = search.trim().toLowerCase();
    if (!s) {
      // Try to surface the closest match by name first
      const target = row.clinic_name.toLowerCase();
      return [...clinics].sort((a, b) => {
        const aHit = a.name.toLowerCase().includes(target.slice(0, 5)) ? 1 : 0;
        const bHit = b.name.toLowerCase().includes(target.slice(0, 5)) ? 1 : 0;
        return bHit - aHit;
      });
    }
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.aso_account_number || "").toLowerCase().includes(s) ||
        (c.contact_email || "").toLowerCase().includes(s),
    );
  }, [clinics, search, row.clinic_name]);

  async function handleApprove() {
    if (!clinicId) {
      setErr("Pick a clinic to attach this user to.");
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await approvePendingUser(row.id, { clinic_id: clinicId, role });
    setBusy(false);
    if (res.ok) {
      onDone();
    } else {
      setErr(res.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl text-navy">Approve application</h2>
        <p className="mt-1 text-[13px] text-gray-500">
          Attach <strong>{row.email}</strong> to a clinic.
        </p>
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-900">
          Applicant typed clinic name: <strong>{row.clinic_name}</strong>
          {row.aso_account_number && (
            <>
              {" "}
              · ASO# <strong>{row.aso_account_number}</strong>
            </>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
            Clinic
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name / account # / email"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-[14px] text-navy focus:border-navy focus:outline-none"
          />
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200">
            {clinics == null ? (
              <div className="p-3 text-[12.5px] text-gray-500">Loading…</div>
            ) : filteredClinics.length === 0 ? (
              <div className="p-3 text-[12.5px] text-gray-500">
                No matches.
              </div>
            ) : (
              filteredClinics.slice(0, 60).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setClinicId(c.id)}
                  className={`w-full text-left px-3 py-2 text-[13px] border-b border-gray-100 last:border-0 ${
                    clinicId === c.id
                      ? "bg-brandOrange/10 text-navy"
                      : "hover:bg-gray-50 text-navy"
                  }`}
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[11.5px] text-gray-500">
                    {c.aso_account_number
                      ? `ASO# ${c.aso_account_number} · `
                      : ""}
                    {c.contact_email || ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
            Role
          </label>
          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13.5px] text-navy cursor-pointer">
              <input
                type="radio"
                className="accent-navy"
                checked={role === "member"}
                onChange={() => setRole("member")}
              />
              <span>Member</span>
            </label>
            <label className="flex-1 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13.5px] text-navy cursor-pointer">
              <input
                type="radio"
                className="accent-navy"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
              />
              <span>Clinic admin</span>
            </label>
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {err}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-full text-gray-600 px-4 py-2 text-[13px] hover:text-navy"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={busy || !clinicId}
            className="rounded-full bg-brandOrange text-white px-5 py-2 text-[13px] font-medium hover:bg-brandOrange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Approving…" : "Approve + email applicant"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  row,
  onClose,
  onDone,
}: {
  row: PendingUserRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleReject() {
    const r = reason.trim();
    if (!r) {
      setErr("Please give the applicant a reason — they'll see it in the email.");
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await rejectPendingUser(row.id, r);
    setBusy(false);
    if (res.ok) onDone();
    else setErr(res.error);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl text-navy">Reject application</h2>
        <p className="mt-1 text-[13px] text-gray-500">
          From <strong>{row.email}</strong>. The reason below is shown
          verbatim in the rejection email so they know what to fix.
        </p>
        <textarea
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. We couldn't match your ASO account number — please call us at 808-957-0111."
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[14px] text-navy focus:border-navy focus:outline-none resize-none"
        />
        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {err}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-full text-gray-600 px-4 py-2 text-[13px] hover:text-navy"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={busy}
            className="rounded-full bg-red-600 text-white px-5 py-2 text-[13px] font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Reject + email applicant"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingUsersPage() {
  return (
    <Suspense fallback={null}>
      <PendingUsersInner />
    </Suspense>
  );
}
