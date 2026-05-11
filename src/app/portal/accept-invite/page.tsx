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
  return (
    <AuthShell
      title="Accept invitation"
      subtitle={`Choose a password to claim your access to ${info.clinic_name ?? "the portal"}.`}
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

      <form onSubmit={handleSubmit} className="grid gap-4 mt-5" noValidate>
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
