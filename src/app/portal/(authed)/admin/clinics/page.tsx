"use client";

/**
 * Admin clinics list — aso_staff only (route is also gated by
 * /portal/(authed)/admin/layout.tsx). Inline editor for every field that
 * matters for VisualDLP sync mapping (visualdlp_account_id /
 * aso_account_number) plus contact metadata (phone / address /
 * email_domain).
 *
 * No DELETE: clinics are deactivated, not deleted, so referencing
 * portal_users and portal_orders rows keep their FK intact.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createClinic,
  fetchAdminClinics,
  updateAdminClinic,
  type AdminClinicSummary,
  type UpdateClinicInput,
} from "@/lib/portal/admin";

type Include = "active" | "inactive" | "all";

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<AdminClinicSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [include, setInclude] = useState<Include>("active");
  const [editing, setEditing] = useState<AdminClinicSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (searchInput === search) return;
    const t = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchAdminClinics();
    if (res.ok) {
      setClinics(res.data.clinics);
    } else {
      setErrorMsg(res.error);
      setClinics([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (!clinics) return [];
    const q = search.trim().toLowerCase();
    return clinics.filter((c) => {
      if (include === "active" && !c.is_active) return false;
      if (include === "inactive" && c.is_active) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.contact_email.toLowerCase().includes(q) ||
        (c.email_domain ?? "").toLowerCase().includes(q) ||
        (c.aso_account_number ?? "").toLowerCase().includes(q) ||
        (c.visualdlp_account_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [clinics, search, include]);

  function flashOnce(msg: string) {
    setFlash(msg);
    window.setTimeout(() => setFlash((f) => (f === msg ? null : f)), 4500);
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-6xl">
        <header className="mb-6 sm:mb-8 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[12px] uppercase tracking-widest text-gray-500">
              ASO Staff
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
              Clinics
            </h1>
            <p className="mt-2 text-[13px] text-gray-500">
              Master record per clinic / branch. Set{" "}
              <code className="font-mono text-[12px] text-navy">
                visualdlp_account_id
              </code>{" "}
              to map sync sources, and{" "}
              <code className="font-mono text-[12px] text-navy">
                email_domain
              </code>{" "}
              to auto-associate new sign-ups.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portal/admin/"
              className="text-[13px] text-gray-500 hover:text-navy transition-colors"
            >
              ← Back to Admin
            </Link>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-navy text-white hover:bg-navy-light transition-colors"
            >
              + New clinic
            </button>
          </div>
        </header>

        {flash && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 text-[13px] text-emerald-800"
          >
            {flash}
          </div>
        )}

        <section
          className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 mb-5"
          aria-label="Filters"
        >
          <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
            <div className="sm:col-span-9">
              <label
                htmlFor="clinics-search"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Search
              </label>
              <input
                id="clinics-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, email, domain, aso_account_number, visualdlp_account_id"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="clinics-include"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Status
              </label>
              <select
                id="clinics-include"
                value={include}
                onChange={(e) => setInclude(e.target.value as Include)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg text-navy">Clinics</h2>
            <span className="text-[11.5px] uppercase tracking-widest text-gray-400">
              {visible.length} record{visible.length === 1 ? "" : "s"}
            </span>
          </div>

          {errorMsg ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[14px] text-red-700 mb-3">{errorMsg}</p>
              <button
                type="button"
                onClick={load}
                className="text-[13px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
              >
                Try again
              </button>
            </div>
          ) : loading && !clinics ? (
            <div className="px-5 py-16 text-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : visible.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500">
              No clinics match.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {visible.map((c) => (
                <ClinicRow
                  key={c.id}
                  clinic={c}
                  onEdit={() => setEditing(c)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {creating && (
        <CreateClinicModal
          onClose={() => setCreating(false)}
          onCreated={(name) => {
            setCreating(false);
            flashOnce(`Created ${name}.`);
            void load();
          }}
        />
      )}
      {editing && (
        <EditClinicModal
          clinic={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEditing(null);
            setClinics((prev) =>
              prev
                ? prev.map((c) => (c.id === updated.id ? updated : c))
                : prev,
            );
            flashOnce(`Saved ${updated.name}.`);
          }}
        />
      )}
    </div>
  );
}

function ClinicRow({
  clinic,
  onEdit,
}: {
  clinic: AdminClinicSummary;
  onEdit: () => void;
}) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-navy">{clinic.name}</span>
            {!clinic.is_active && (
              <span className="text-[10px] uppercase tracking-widest text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                Inactive
              </span>
            )}
            <span className="text-[11px] text-gray-400">#{clinic.id}</span>
          </div>
          <div className="mt-1 text-[12.5px] text-gray-600">
            {clinic.contact_email}
            {clinic.phone && ` · ${clinic.phone}`}
            {clinic.address && (
              <span className="ml-1 text-gray-500">
                · {clinic.address}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 flex-wrap text-[11.5px] text-gray-500">
            <span>
              {clinic.user_count} user{clinic.user_count === 1 ? "" : "s"}
            </span>
            {clinic.email_domain && (
              <span>
                domain <code className="font-mono">{clinic.email_domain}</code>
              </span>
            )}
            {clinic.aso_account_number && (
              <span>
                ASO #
                <code className="font-mono">{clinic.aso_account_number}</code>
              </span>
            )}
            {clinic.visualdlp_account_id ? (
              <span className="text-emerald-700">
                vdlp{" "}
                <code className="font-mono">{clinic.visualdlp_account_id}</code>
              </span>
            ) : (
              <span className="text-amber-700">no vdlp mapping</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-[12.5px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
        >
          Edit
        </button>
      </div>
    </li>
  );
}

interface ClinicFormState {
  name: string;
  contact_email: string;
  email_domain: string;
  aso_account_number: string;
  visualdlp_account_id: string;
  phone: string;
  address: string;
}

function emptyForm(): ClinicFormState {
  return {
    name: "",
    contact_email: "",
    email_domain: "",
    aso_account_number: "",
    visualdlp_account_id: "",
    phone: "",
    address: "",
  };
}

function fromClinic(c: AdminClinicSummary): ClinicFormState {
  return {
    name: c.name,
    contact_email: c.contact_email,
    email_domain: c.email_domain ?? "",
    aso_account_number: c.aso_account_number ?? "",
    visualdlp_account_id: c.visualdlp_account_id ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
  };
}

function CreateClinicModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const [form, setForm] = useState<ClinicFormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!form.name.trim()) {
      setErrorMsg("Clinic name is required.");
      return;
    }
    if (
      !form.contact_email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())
    ) {
      setErrorMsg("A valid contact email is required.");
      return;
    }
    setBusy(true);
    const res = await createClinic({
      name: form.name.trim(),
      contact_email: form.contact_email.trim(),
      email_domain: form.email_domain.trim() || undefined,
      aso_account_number: form.aso_account_number.trim() || undefined,
      visualdlp_account_id: form.visualdlp_account_id.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    });
    setBusy(false);
    if (res.ok) {
      onCreated(form.name.trim());
    } else {
      setErrorMsg(res.error);
    }
  }

  return (
    <ClinicModalShell
      title="New clinic"
      subtitle="Set the master record fields. visualdlp_account_id can be added later."
      busy={busy}
      onClose={onClose}
      submitLabel={busy ? "Creating…" : "Create clinic"}
      errorMsg={errorMsg}
      onSubmit={handleSubmit}
    >
      <ClinicFields form={form} setForm={setForm} disabled={busy} />
    </ClinicModalShell>
  );
}

function EditClinicModal({
  clinic,
  onClose,
  onSaved,
}: {
  clinic: AdminClinicSummary;
  onClose: () => void;
  onSaved: (updated: AdminClinicSummary) => void;
}) {
  const [form, setForm] = useState<ClinicFormState>(fromClinic(clinic));
  const [isActive, setIsActive] = useState(clinic.is_active);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    const input: UpdateClinicInput = {
      name: form.name.trim(),
      contact_email: form.contact_email.trim(),
      email_domain: form.email_domain.trim(),
      aso_account_number: form.aso_account_number.trim(),
      visualdlp_account_id: form.visualdlp_account_id.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      is_active: isActive,
    };
    const res = await updateAdminClinic(clinic.id, input);
    setBusy(false);
    if (res.ok) {
      if (res.data.clinic) {
        onSaved(res.data.clinic);
      } else {
        // Server returned ok but no clinic — refetch upstream.
        onSaved({ ...clinic, ...form, is_active: isActive });
      }
    } else {
      setErrorMsg(res.error);
    }
  }

  return (
    <ClinicModalShell
      title={`Edit ${clinic.name}`}
      subtitle={`#${clinic.id} · ${clinic.user_count} user${
        clinic.user_count === 1 ? "" : "s"
      }`}
      busy={busy}
      onClose={onClose}
      submitLabel={busy ? "Saving…" : "Save changes"}
      errorMsg={errorMsg}
      onSubmit={handleSubmit}
    >
      <ClinicFields form={form} setForm={setForm} disabled={busy} />
      <label className="flex items-center gap-2 mt-2 text-[13px] text-navy">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={busy}
          className="accent-navy"
        />
        <span>Active</span>
      </label>
    </ClinicModalShell>
  );
}

function ClinicFields({
  form,
  setForm,
  disabled,
}: {
  form: ClinicFormState;
  setForm: React.Dispatch<React.SetStateAction<ClinicFormState>>;
  disabled: boolean;
}) {
  function bind<K extends keyof ClinicFormState>(k: K) {
    return {
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value })),
      disabled,
    };
  }
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors disabled:opacity-60";
  const labelClass =
    "block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="clinic-name" className={labelClass}>
          Name <span className="text-red-600">*</span>
        </label>
        <input id="clinic-name" type="text" className={inputClass} {...bind("name")} />
      </div>
      <div>
        <label htmlFor="clinic-email" className={labelClass}>
          Contact email <span className="text-red-600">*</span>
        </label>
        <input
          id="clinic-email"
          type="email"
          autoComplete="off"
          className={inputClass}
          {...bind("contact_email")}
        />
      </div>
      <div>
        <label htmlFor="clinic-domain" className={labelClass}>
          Email domain
        </label>
        <input
          id="clinic-domain"
          type="text"
          placeholder="e.g. hawaiifamilydental.com"
          className={inputClass}
          {...bind("email_domain")}
        />
      </div>
      <div>
        <label htmlFor="clinic-aso" className={labelClass}>
          ASO account #
        </label>
        <input id="clinic-aso" type="text" className={inputClass} {...bind("aso_account_number")} />
      </div>
      <div>
        <label htmlFor="clinic-vdlp" className={labelClass}>
          VisualDLP AccountId
        </label>
        <input
          id="clinic-vdlp"
          type="text"
          placeholder="GUID — required for sync mapping"
          className={inputClass}
          {...bind("visualdlp_account_id")}
        />
      </div>
      <div>
        <label htmlFor="clinic-phone" className={labelClass}>
          Phone
        </label>
        <input id="clinic-phone" type="tel" className={inputClass} {...bind("phone")} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="clinic-address" className={labelClass}>
          Address
        </label>
        <input id="clinic-address" type="text" className={inputClass} {...bind("address")} />
      </div>
    </div>
  );
}

function ClinicModalShell({
  title,
  subtitle,
  busy,
  onClose,
  onSubmit,
  submitLabel,
  errorMsg,
  children,
}: {
  title: string;
  subtitle?: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  errorMsg: string | null;
  children: React.ReactNode;
}) {
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[1px] px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-xl">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="font-serif text-lg text-navy">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[12.5px] text-gray-500">{subtitle}</p>
          )}
        </div>
        <form
          onSubmit={onSubmit}
          className="px-5 sm:px-6 py-5 grid gap-4 max-h-[70vh] overflow-y-auto"
          noValidate
        >
          {children}
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
            disabled={busy}
            onClick={onSubmit}
            className="px-4 py-2 rounded-full text-[13px] font-medium bg-brandOrange text-white hover:bg-brandOrange/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
