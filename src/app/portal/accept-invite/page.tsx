"use client";

/**
 * /portal/accept-invite/?token=... — claim a Doctor Portal invitation.
 *
 * On mount we hit /api/portal/auth/invite-info to render the invite
 * context (clinic, inviter, role). If the token is invalid / expired /
 * already-used the GET collapses to 404 with a generic message and we
 * show the same error in place. On submit we POST the password to
 * /api/portal/auth/accept-invite — the server creates the user + session
 * and the Set-Cookie comes back in the response, so we just push to the
 * dashboard.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AuthShell from "@/components/portal/AuthShell";
import PasswordInput from "@/components/portal/PasswordInput";
import {
  acceptInvitation,
  fetchInvitationInfo,
  type InvitationInfo,
} from "@/lib/portal/client";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Accept invitation" subtitle="Loading…">
          <div className="text-center text-sm text-gray-400 py-2">Loading…</div>
        </AuthShell>
      }
    >
      <AcceptInviteInner />
    </Suspense>
  );
}

function roleLabel(role: string): string {
  if (role === "admin") return "clinic admin";
  if (role === "aso_staff") return "ASO staff";
  return "team member";
}

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const tokenPresent = token.length > 0;
  const mismatchError = searchParams?.get("error") === "email_mismatch";
  const invitedEmailFromUrl = searchParams?.get("invited") ?? "";

  const [status, setStatus] = useState<
    | { kind: "loading" }
    | { kind: "ready"; info: InvitationInfo }
    | { kind: "invalid"; message: string }
  >({ kind: "loading" });

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenPresent) {
      setStatus({
        kind: "invalid",
        message: "The invitation URL did not include a token.",
      });
      return;
    }
    let cancelled = false;
    fetchInvitationInfo(token).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setStatus({ kind: "ready", info: res.info });
        if (res.info.name) setName(res.info.name);
      } else {
        setStatus({
          kind: "invalid",
          message: res.error,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, tokenPresent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || status.kind !== "ready") return;
    setErrorMsg(null);

    if (password.length < 10) {
      setErrorMsg("Password must be at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Password and confirmation don't match.");
      return;
    }

    setBusy(true);
    const result = await acceptInvitation({
      token,
      password,
      name: name.trim() || undefined,
    });
    setBusy(false);
    if (result.ok) {
      router.replace(result.redirect);
      return;
    }
    setErrorMsg(result.error);
  }

  if (status.kind === "loading") {
    return (
      <AuthShell title="Accept invitation" subtitle="Checking invitation…">
        <div className="text-center text-sm text-gray-400 py-2">Loading…</div>
      </AuthShell>
    );
  }

  if (status.kind === "invalid") {
    return (
      <AuthShell
        title="Accept invitation"
        subtitle="This invitation can't be used."
        footer={
          <>
            Need a new invitation?{" "}
            <Link
              href="/portal/"
              className="text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
            >
              Back to sign in
            </Link>{" "}
            and contact ASO Hawaii.
          </>
        }
      >
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13.5px] text-amber-800"
        >
          {status.message}
        </div>
      </AuthShell>
    );
  }

  const info = status.info;
  const invitedEmail = invitedEmailFromUrl || info.email;

  return (
    <AuthShell
      title="Accept invitation"
      subtitle={`Welcome — claim your access to ${info.clinic_name ?? "the portal"}.`}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/portal/"
            className="text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
          .
        </>
      }
    >
      <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-[13px] text-gray-700 leading-relaxed">
        <div>
          <span className="text-gray-500">Email</span>{" "}
          <span className="text-navy font-medium">{info.email}</span>
        </div>
        <div className="mt-1">
          <span className="text-gray-500">Clinic</span>{" "}
          <span className="text-navy">{info.clinic_name ?? "—"}</span>
        </div>
        <div className="mt-1">
          <span className="text-gray-500">Role</span>{" "}
          <span className="text-navy">{roleLabel(info.role)}</span>
        </div>
        {info.inviter_name && (
          <div className="mt-1">
            <span className="text-gray-500">Invited by</span>{" "}
            <span className="text-navy">{info.inviter_name}</span>
          </div>
        )}
      </div>

      {mismatchError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 leading-relaxed"
        >
          <div className="font-medium">That Google account didn&apos;t match.</div>
          <div className="mt-1">
            This invitation was sent to{" "}
            <strong className="text-navy">{invitedEmail}</strong>. Please sign
            in with that Google account, or set a password below instead.
          </div>
        </div>
      )}

      {/* Continue with Google — recommended path for Gmail / Workspace
          accounts. Posts the raw invite token to the OAuth entry which
          embeds it in the state JWT and validates email match in the
          callback. */}
      <form
        method="POST"
        action="/api/portal/auth/google"
        className="mt-5"
      >
        <input type="hidden" name="invite_token" value={token} />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[14px] font-medium text-navy hover:border-navy hover:bg-navy/[0.03] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        <p className="mt-2 text-center text-[11.5px] text-gray-500">
          Recommended if your invited email is on Gmail or Google Workspace
          — no password to remember.
        </p>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-gray-400">
        <div className="flex-grow h-px bg-gray-200"></div>
        <span>or set a password</span>
        <div className="flex-grow h-px bg-gray-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div>
          <label
            htmlFor="accept-name"
            className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
          >
            Your name
          </label>
          <input
            id="accept-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-colors"
            placeholder="How should we address you?"
          />
        </div>
        <PasswordInput
          id="accept-password"
          name="new-password"
          label="Choose a password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          hint="At least 10 characters."
        />
        <PasswordInput
          id="accept-confirm"
          name="confirm-password"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          required
        />
        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
          >
            {errorMsg}
          </div>
        )}
        <button
          type="submit"
          disabled={busy || !password || !confirm}
          className="w-full inline-flex items-center justify-center bg-brandOrange text-white px-4 py-3 rounded-full text-[14px] font-medium hover:bg-brandOrange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Setting up your account…" : "Claim account"}
        </button>
      </form>
    </AuthShell>
  );
}
