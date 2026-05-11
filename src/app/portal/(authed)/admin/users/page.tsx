"use client";

/**
 * Admin users list — aso_staff only (route is also gated by
 * /portal/(authed)/admin/layout.tsx). Lists every portal_users row with
 * clinic info, last login, and per-row actions (change role + activate /
 * deactivate). Self-row actions are intentionally disabled — the server
 * blocks self-demote / self-deactivate, but the UI mirrors the policy
 * for clarity.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdminUsers,
  updateAdminUser,
  type AdminUserSummary,
} from "@/lib/portal/admin";
import { usePortalSession } from "../../session-context";

type Include = "active" | "inactive" | "all";

interface RowBusyState {
  [userId: number]: boolean;
}

export default function AdminUsersPage() {
  const { user: me } = usePortalSession();

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "member" | "admin" | "aso_staff">("");
  const [include, setInclude] = useState<Include>("active");

  const [users, setUsers] = useState<AdminUserSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<RowBusyState>({});
  const [rowError, setRowError] = useState<Record<number, string>>({});
  const [flash, setFlash] = useState<string | null>(null);

  // Debounce search input → applied filter.
  useEffect(() => {
    if (searchInput === search) return;
    const t = window.setTimeout(() => setSearch(searchInput), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchAdminUsers({
      q: search || undefined,
      role: roleFilter || undefined,
      include,
    });
    if (res.ok) {
      setUsers(res.data.users);
    } else {
      setErrorMsg(res.error);
      setUsers([]);
    }
    setLoading(false);
  }, [search, roleFilter, include]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(
    user: AdminUserSummary,
    input: { role?: "member" | "admin"; is_active?: boolean },
    optimisticLabel: string,
  ) {
    setBusy((b) => ({ ...b, [user.id]: true }));
    setRowError((re) => {
      const next = { ...re };
      delete next[user.id];
      return next;
    });
    const res = await updateAdminUser(user.id, input);
    setBusy((b) => {
      const next = { ...b };
      delete next[user.id];
      return next;
    });
    if (res.ok && res.data.user) {
      setUsers((prev) =>
        prev
          ? prev.map((u) => (u.id === user.id ? res.data.user! : u))
          : prev,
      );
      const parts: string[] = [
        `${optimisticLabel} for ${res.data.user.email}.`,
      ];
      if (res.data.revoked_sessions > 0) {
        parts.push(
          `${res.data.revoked_sessions} active session(s) revoked.`,
        );
      }
      setFlash(parts.join(" "));
      window.setTimeout(
        () => setFlash((f) => (f === parts.join(" ") ? null : f)),
        4500,
      );
    } else if (!res.ok) {
      setRowError((re) => ({ ...re, [user.id]: res.error }));
    }
  }

  const totalLabel = useMemo(() => {
    if (users == null) return "—";
    return `${users.length} record${users.length === 1 ? "" : "s"}`;
  }, [users]);

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-6xl">
        <header className="mb-6 sm:mb-8 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[12px] uppercase tracking-widest text-gray-500">
              ASO Staff
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
              Users
            </h1>
            <p className="mt-2 text-[13px] text-gray-500">
              Portal accounts across all clinics. Promote / demote between
              member and clinic admin, or deactivate an account to revoke
              every session.
            </p>
          </div>
          <Link
            href="/portal/admin/"
            className="text-[13px] text-gray-500 hover:text-navy transition-colors"
          >
            ← Back to Admin
          </Link>
        </header>

        {flash && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 text-[13px] text-emerald-800"
          >
            {flash}
          </div>
        )}

        {/* Filters */}
        <section
          className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 mb-5"
          aria-label="Filters"
        >
          <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
            <div className="sm:col-span-6">
              <label
                htmlFor="users-search"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Search
              </label>
              <input
                id="users-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Email or name"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="users-role"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Role
              </label>
              <select
                id="users-role"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as typeof roleFilter)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              >
                <option value="">All roles</option>
                <option value="member">Member</option>
                <option value="admin">Clinic admin</option>
                <option value="aso_staff">ASO staff</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="users-include"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Status
              </label>
              <select
                id="users-include"
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
            <h2 className="font-serif text-lg text-navy">Accounts</h2>
            <span className="text-[11.5px] uppercase tracking-widest text-gray-400">
              {totalLabel}
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
          ) : loading && !users ? (
            <div className="px-5 py-16 text-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : users && users.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500">
              No users match.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-gray-500 bg-gray-50/60">
                    <th className="px-5 py-3 font-medium border-b border-gray-200">
                      User
                    </th>
                    <th className="px-5 py-3 font-medium border-b border-gray-200">
                      Clinic
                    </th>
                    <th className="px-5 py-3 font-medium border-b border-gray-200">
                      Role
                    </th>
                    <th className="px-5 py-3 font-medium border-b border-gray-200">
                      Last login
                    </th>
                    <th className="px-5 py-3 font-medium border-b border-gray-200">
                      Status
                    </th>
                    <th
                      className="px-5 py-3 font-medium border-b border-gray-200"
                      aria-hidden
                    />
                  </tr>
                </thead>
                <tbody>
                  {(users ?? []).map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      isSelf={u.id === me.id}
                      busy={!!busy[u.id]}
                      rowError={rowError[u.id]}
                      onPatch={patch}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface UserRowProps {
  user: AdminUserSummary;
  isSelf: boolean;
  busy: boolean;
  rowError?: string;
  onPatch: (
    user: AdminUserSummary,
    input: { role?: "member" | "admin"; is_active?: boolean },
    optimisticLabel: string,
  ) => Promise<void>;
}

function UserRow({ user, isSelf, busy, rowError, onPatch }: UserRowProps) {
  const isAsoStaff = user.role === "aso_staff";

  const lastLogin =
    user.last_login_at && Date.parse(user.last_login_at.replace(" ", "T") + "Z")
      ? new Date(user.last_login_at.replace(" ", "T") + "Z").toLocaleDateString(
          undefined,
          { year: "numeric", month: "short", day: "numeric" },
        )
      : "—";

  return (
    <>
      <tr className="border-b border-gray-100 last:border-b-0 align-top">
        <td className="px-5 py-3">
          <div className="text-navy font-medium">{user.name ?? user.email}</div>
          {user.name && (
            <div className="text-[12px] text-gray-500">{user.email}</div>
          )}
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
            <span>id #{user.id}</span>
            {isSelf && (
              <span className="text-[10px] uppercase tracking-widest text-navy bg-navy/5 px-1.5 py-0.5 rounded">
                You
              </span>
            )}
            {!user.has_password && user.auth_provider === "google" && (
              <span className="text-[10px] uppercase tracking-widest text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Google
              </span>
            )}
          </div>
        </td>
        <td className="px-5 py-3 text-gray-700">
          {user.clinic_name ?? <span className="text-gray-400">—</span>}
          <div className="text-[11px] text-gray-400">#{user.clinic_id}</div>
        </td>
        <td className="px-5 py-3">
          <RoleBadge role={user.role} />
        </td>
        <td className="px-5 py-3 text-gray-700 tabular-nums">{lastLogin}</td>
        <td className="px-5 py-3">
          {user.is_active ? (
            <span className="inline-flex items-center text-[11px] uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full font-semibold">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] uppercase tracking-widest text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
              Inactive
            </span>
          )}
        </td>
        <td className="px-5 py-3 text-right whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            {!isAsoStaff && !isSelf && user.is_active && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onPatch(
                    user,
                    { role: user.role === "admin" ? "member" : "admin" },
                    user.role === "admin"
                      ? "Demoted to member"
                      : "Promoted to clinic admin",
                  )
                }
                className="text-[12.5px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors disabled:text-gray-400"
              >
                {user.role === "admin" ? "Demote" : "Promote"}
              </button>
            )}
            {!isSelf && user.is_active && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onPatch(user, { is_active: false }, "Deactivated")
                }
                className="text-[12.5px] text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors disabled:text-gray-400"
              >
                Deactivate
              </button>
            )}
            {!isSelf && !user.is_active && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onPatch(user, { is_active: true }, "Reactivated")
                }
                className="text-[12.5px] text-emerald-700 underline underline-offset-2 hover:text-emerald-900 transition-colors disabled:text-gray-400"
              >
                Reactivate
              </button>
            )}
            {busy && (
              <span className="text-[11.5px] text-gray-400">…</span>
            )}
          </div>
        </td>
      </tr>
      {rowError && (
        <tr>
          <td colSpan={6} className="px-5 pb-3">
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[12.5px] text-red-700">
              {rowError}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function RoleBadge({ role }: { role: "member" | "admin" | "aso_staff" }) {
  if (role === "aso_staff") {
    return (
      <span className="inline-flex items-center text-[11px] uppercase tracking-widest text-navy bg-navy/10 border border-navy/30 px-2 py-0.5 rounded-full font-semibold">
        ASO Staff
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span className="inline-flex items-center text-[11px] uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full font-semibold">
        Clinic Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[11px] uppercase tracking-widest text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
      Member
    </span>
  );
}
