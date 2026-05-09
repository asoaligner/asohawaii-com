"use client";

/**
 * Profile screen. Splits into three independent forms:
 *   1. Personal info (name + phone)         — PATCH /api/portal/profile
 *   2. Change password (if has_password)    — POST /api/portal/profile/change-password
 *   3. Account info (read-only) + danger zone (mailto: account deletion)
 *
 * Each form keeps its own submit/error/success state so a failure in
 * one does not blow away unsaved input in another.
 *
 * Does not refetch /me after a profile save — instead trusts the PATCH
 * response (`{ user }`) and merges into local session view. /me runs on
 * next navigation anyway.
 */

import { useEffect, useState } from "react";
import {
  changePassword,
  fetchProfile,
  updateProfile,
  type PortalClinic,
  type PortalUser,
} from "@/lib/portal/client";
import { usePortalSession } from "../session-context";

export default function ProfilePage() {
  const { user: ctxUser, clinic: ctxClinic } = usePortalSession();
  // Profile screen owns its own copy of user + clinic so edits reflect
  // immediately without waiting for the parent layout to re-poll /me.
  const [user, setUser] = useState<PortalUser>(ctxUser);
  const [clinic] = useState<PortalClinic>(ctxClinic);

  // One quiet refetch on mount in case the layout's snapshot is stale
  // (e.g. user opened this page from a stale browser tab after editing
  // their profile elsewhere).
  useEffect(() => {
    fetchProfile().then((res) => {
      if (res.ok) setUser(res.user);
    });
  }, []);

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-3xl">
        <header className="mb-8">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            {clinic.name}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
            Your profile
          </h1>
          <p className="mt-2 text-[13.5px] text-gray-600">
            Manage your name, phone, and password. Email is fixed — contact
            ASO Hawaii to migrate.
          </p>
        </header>

        <PersonalInfoCard user={user} onUserUpdated={setUser} />
        {user.has_password && <ChangePasswordCard />}
        <AccountInfoCard user={user} clinic={clinic} />
      </div>
    </div>
  );
}

// ─── Personal info card ───────────────────────────────────────────────

function PersonalInfoCard({
  user,
  onUserUpdated,
}: {
  user: PortalUser;
  onUserUpdated: (u: PortalUser) => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    (name.trim() || null) !== (user.name ?? null) ||
    (phone.trim() || null) !== (user.phone ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !dirty) return;
    setBusy(true);
    setErrorMsg(null);
    const result = await updateProfile({
      name: name.trim() || null,
      phone: phone.trim() || null,
    });
    setBusy(false);
    if (result.ok) {
      onUserUpdated(result.user);
      setName(result.user.name ?? "");
      setPhone(result.user.phone ?? "");
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 3000);
      return;
    }
    setErrorMsg(result.error);
  }

  return (
    <Card title="Personal information">
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <Field
          id="profile-email"
          label="Email"
          readonly
          value={user.email}
          hint="Contact ASO Hawaii to change your email."
        />
        <Field
          id="profile-name"
          label="Name"
          value={name}
          onChange={setName}
          maxLength={100}
          placeholder="Your name"
        />
        <Field
          id="profile-phone"
          label="Phone"
          value={phone}
          onChange={setPhone}
          maxLength={30}
          placeholder="Direct line or mobile"
        />
        {errorMsg && <ErrorBanner>{errorMsg}</ErrorBanner>}
        {savedAt && <SuccessBanner>Profile updated.</SuccessBanner>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !dirty}
            className="inline-flex items-center justify-center bg-brandOrange text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
          {!dirty && !savedAt && (
            <span className="text-[12.5px] text-gray-400">No unsaved changes</span>
          )}
        </div>
      </form>
    </Card>
  );
}

// ─── Change password card ────────────────────────────────────────────

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (next.length < 10) {
      setErrorMsg("New password must be at least 10 characters.");
      return;
    }
    if (next !== confirm) {
      setErrorMsg("New password and confirmation don't match.");
      return;
    }
    if (next === current) {
      setErrorMsg("New password must differ from the current one.");
      return;
    }

    setBusy(true);
    const result = await changePassword({
      currentPassword: current,
      newPassword: next,
    });
    setBusy(false);
    if (result.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
      const tail =
        result.otherSessionsRevoked > 0
          ? ` Logged out of ${result.otherSessionsRevoked} other session${result.otherSessionsRevoked === 1 ? "" : "s"}.`
          : "";
      setSuccessMsg(`Password updated.${tail}`);
      window.setTimeout(() => setSuccessMsg(null), 6000);
      return;
    }
    setErrorMsg(result.error);
  }

  return (
    <Card title="Change password">
      <p className="text-[12.5px] text-gray-500 leading-relaxed mb-5">
        Changing your password signs out every other device that was logged
        in to this account. This session stays signed in.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <Field
          id="profile-pw-current"
          label="Current password"
          type="password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          required
        />
        <Field
          id="profile-pw-new"
          label="New password"
          type="password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          required
          hint="At least 10 characters."
        />
        <Field
          id="profile-pw-confirm"
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          required
        />
        {errorMsg && <ErrorBanner>{errorMsg}</ErrorBanner>}
        {successMsg && <SuccessBanner>{successMsg}</SuccessBanner>}
        <div>
          <button
            type="submit"
            disabled={busy || !current || !next || !confirm}
            className="inline-flex items-center justify-center bg-navy text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </Card>
  );
}

// ─── Account info + danger zone ──────────────────────────────────────

function AccountInfoCard({
  user,
  clinic,
}: {
  user: PortalUser;
  clinic: PortalClinic;
}) {
  const provider =
    user.auth_provider === "google"
      ? "Google"
      : user.auth_provider === "password"
        ? "Email & password"
        : user.auth_provider ?? "Unknown";

  return (
    <Card title="Account">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-[14px]">
        <ReadonlyField label="Auth method" value={provider} />
        <ReadonlyField
          label="Role"
          value={user.role === "aso_staff" ? "ASO staff" : user.role}
        />
        <ReadonlyField label="Clinic" value={clinic.name} />
        <ReadonlyField label="Member since" value={user.created_at} />
        <ReadonlyField
          label="Last login"
          value={user.last_login_at ?? "—"}
        />
      </dl>

      <div className="mt-7 pt-5 border-t border-gray-200">
        <p className="text-[12px] uppercase tracking-widest text-amber-700 mb-2">
          Danger zone
        </p>
        <a
          href={`mailto:aso-digital@outlook.com?subject=${encodeURIComponent(
            "ASO Portal account deletion request",
          )}&body=${encodeURIComponent(
            `Please delete my ASO Portal account.\n\nEmail: ${user.email}\nClinic: ${clinic.name}\n\nReason (optional):\n`,
          )}`}
          className="inline-flex items-center text-[13px] text-amber-700 hover:text-amber-800 underline underline-offset-2 transition-colors"
        >
          Request account deletion via email →
        </a>
      </div>
    </Card>
  );
}

// ─── Tiny presentation primitives ────────────────────────────────────

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white mb-5 last:mb-0">
      <div className="px-5 sm:px-7 py-4 border-b border-gray-200">
        <h2 className="font-serif text-lg text-navy">{title}</h2>
      </div>
      <div className="px-5 sm:px-7 py-5">{children}</div>
    </section>
  );
}

interface FieldBaseProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
}
type FieldProps = FieldBaseProps &
  (
    | {
        readonly: true;
        value: string;
      }
    | {
        readonly?: false;
        type?: "text" | "password";
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
        maxLength?: number;
        autoComplete?: string;
      }
  );

function Field(props: FieldProps) {
  const { id, label, hint } = props;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
      >
        {label}
      </label>
      {props.readonly ? (
        <input
          id={id}
          value={props.value}
          readOnly
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-600 cursor-not-allowed"
        />
      ) : (
        <input
          id={id}
          type={props.type ?? "text"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          maxLength={props.maxLength}
          autoComplete={props.autoComplete}
          required={props.required}
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
        />
      )}
      {hint && (
        <p className="mt-1 text-[11.5px] text-gray-500 leading-snug">{hint}</p>
      )}
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-widest text-gray-500 mb-1">
        {label}
      </dt>
      <dd className="text-navy">{value}</dd>
    </div>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
    >
      {children}
    </div>
  );
}

function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-700"
    >
      {children}
    </div>
  );
}
