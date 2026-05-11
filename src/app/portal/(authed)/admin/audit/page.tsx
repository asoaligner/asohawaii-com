"use client";

/**
 * Audit log viewer (aso_staff only).
 *
 * URL is the source of truth for filter + page state — every control
 * writes through router.replace so refresh / back / bookmark all behave.
 * Search input has a 400ms debounce; dropdowns commit immediately. Any
 * filter change resets page to 1.
 *
 * metadata is rendered inside a collapsible <details> so the table stays
 * scannable even when one row carries a 1KB JSON blob.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAuditLog,
  type AuditListResponse,
  type AuditLogEntry,
} from "@/lib/portal/admin";

const PAGE_SIZE = 50;

interface FilterState {
  page: number;
  action: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const EMPTY_FILTERS: FilterState = {
  page: 1,
  action: "",
  userId: "",
  dateFrom: "",
  dateTo: "",
  search: "",
};

function readFilters(sp: URLSearchParams): FilterState {
  const pageRaw = Number.parseInt(sp.get("page") ?? "", 10);
  return {
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    action: sp.get("action") ?? "",
    userId: sp.get("userId") ?? "",
    dateFrom: sp.get("dateFrom") ?? "",
    dateTo: sp.get("dateTo") ?? "",
    search: sp.get("search") ?? "",
  };
}

function filtersToSearchString(f: FilterState): string {
  const u = new URLSearchParams();
  if (f.page > 1) u.set("page", String(f.page));
  if (f.action) u.set("action", f.action);
  if (f.userId) u.set("userId", f.userId);
  if (f.dateFrom) u.set("dateFrom", f.dateFrom);
  if (f.dateTo) u.set("dateTo", f.dateTo);
  if (f.search) u.set("search", f.search);
  return u.toString();
}

function hasAnyFilter(f: FilterState): boolean {
  return Boolean(
    f.action || f.userId || f.dateFrom || f.dateTo || f.search,
  );
}

export default function AuditLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams?.toString() ?? "")),
    [searchParams],
  );

  const [searchInput, setSearchInput] = useState(filters.search);
  const [data, setData] = useState<AuditListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pushFilters = useCallback(
    (next: FilterState) => {
      const qs = filtersToSearchString(next);
      router.replace(`/portal/admin/audit/${qs ? `?${qs}` : ""}`);
    },
    [router],
  );

  // Sync local search input when URL changes externally (back button etc.).
  const lastUrlSearch = useRef(filters.search);
  useEffect(() => {
    if (filters.search !== lastUrlSearch.current) {
      lastUrlSearch.current = filters.search;
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  // Debounce search input → URL.
  useEffect(() => {
    if (searchInput === filters.search) return;
    const t = window.setTimeout(() => {
      pushFilters({ ...filters, search: searchInput, page: 1 });
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Fetch effect — aborts in-flight on filter change.
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErrorMsg(null);
    fetchAuditLog(
      {
        page: filters.page,
        limit: PAGE_SIZE,
        action: filters.action || undefined,
        userId: filters.userId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined,
      },
      ctrl.signal,
    ).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res.ok) {
        setData(res.data);
      } else if (res.status === 401) {
        router.replace("/portal/");
      } else if (res.status === 403) {
        router.replace("/portal/dashboard/");
      } else if (res.error !== "aborted") {
        setErrorMsg(res.error);
      }
      setLoading(false);
    });
    return () => ctrl.abort();
  }, [filters, router]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const showPagination = data ? data.total > PAGE_SIZE : false;
  const hasActiveFilters = hasAnyFilter(filters);

  function handleResetFilters() {
    setSearchInput("");
    pushFilters(EMPTY_FILTERS);
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-6xl">
        <header className="mb-6 sm:mb-8">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            ASO Staff
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
            Audit Log
          </h1>
          <p className="mt-2 text-[13px] text-gray-500">
            Append-only record of authentication and account events across
            all clinics. Page size {PAGE_SIZE}.
          </p>
        </header>

        {/* Filters */}
        <section
          className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 mb-5"
          aria-label="Filters"
        >
          <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
            <div className="sm:col-span-5">
              <label
                htmlFor="audit-search"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Search
              </label>
              <input
                id="audit-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Action or metadata content"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="audit-action"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Action
              </label>
              <select
                id="audit-action"
                value={filters.action}
                onChange={(e) =>
                  pushFilters({
                    ...filters,
                    action: e.target.value,
                    page: 1,
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              >
                <option value="">All actions</option>
                {(data?.actions ?? []).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="audit-user"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                User
              </label>
              <input
                id="audit-user"
                type="text"
                value={filters.userId}
                onChange={(e) =>
                  pushFilters({
                    ...filters,
                    userId: e.target.value.trim(),
                    page: 1,
                  })
                }
                placeholder="User ID or 'system'"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="audit-from"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                From
              </label>
              <input
                id="audit-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  pushFilters({
                    ...filters,
                    dateFrom: e.target.value,
                    page: 1,
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              />
            </div>
            <div className="sm:col-span-6">
              <label
                htmlFor="audit-to"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                To
              </label>
              <input
                id="audit-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  pushFilters({ ...filters, dateTo: e.target.value, page: 1 })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[12.5px] text-gray-500 hover:text-brandOrange transition-colors underline underline-offset-2"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        {/* Results */}
        <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg text-navy">Events</h2>
            <span className="text-[11.5px] uppercase tracking-widest text-gray-400">
              {data ? `${data.total} record${data.total === 1 ? "" : "s"}` : "—"}
            </span>
          </div>

          {errorMsg ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[14px] text-red-700 mb-3">{errorMsg}</p>
              <button
                type="button"
                onClick={() => pushFilters({ ...filters })}
                className="text-[13px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
              >
                Try again
              </button>
            </div>
          ) : loading && !data ? (
            <div className="px-5 py-16 text-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : data && data.logs.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500">
              No events match.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(data?.logs ?? []).map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
            </ul>
          )}

          {showPagination && data && (
            <Pagination
              page={data.page}
              totalPages={totalPages}
              onChange={(next) => pushFilters({ ...filters, page: next })}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function AuditRow({ log }: { log: AuditLogEntry }) {
  const tsMs = Date.parse(log.created_at.replace(" ", "T") + "Z");
  const displayTs = Number.isNaN(tsMs)
    ? log.created_at
    : new Date(tsMs).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

  const who = log.user_email
    ? log.user_name
      ? `${log.user_name} <${log.user_email}>`
      : log.user_email
    : log.user_id !== null
      ? `User #${log.user_id}`
      : "system";

  const hasMeta = log.metadata != null;
  const metaText = hasMeta
    ? typeof log.metadata === "string"
      ? log.metadata
      : JSON.stringify(log.metadata, null, 2)
    : "";

  return (
    <li className="px-5 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]">
        <span className="text-gray-500 tabular-nums">{displayTs}</span>
        <span className="font-medium text-navy">{log.action}</span>
        <span className="text-gray-700">{who}</span>
        {log.resource_type && (
          <span className="text-gray-500">
            {log.resource_type}
            {log.resource_id ? ` #${log.resource_id}` : ""}
          </span>
        )}
        {log.ip_address && (
          <span className="text-gray-400 text-[12px]">{log.ip_address}</span>
        )}
      </div>
      {hasMeta && (
        <details className="mt-1">
          <summary className="text-[12px] text-gray-500 cursor-pointer hover:text-navy">
            Details
          </summary>
          <pre className="mt-1 text-[11.5px] text-gray-700 bg-gray-50 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
            {metaText}
          </pre>
        </details>
      )}
    </li>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const prev = page > 1;
  const next = page < totalPages;
  return (
    <div className="px-5 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between text-[13px]">
      <button
        type="button"
        onClick={() => prev && onChange(page - 1)}
        disabled={!prev}
        className="text-navy hover:text-brandOrange transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      <span className="text-gray-500">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => next && onChange(page + 1)}
        disabled={!next}
        className="text-navy hover:text-brandOrange transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
