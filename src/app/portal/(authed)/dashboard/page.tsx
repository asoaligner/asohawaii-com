"use client";

/**
 * Dashboard with live orders list.
 *
 * URL is the source of truth for filter + page state — every control
 * writes through router.replace so refresh/back/bookmark all behave.
 * The fetch effect keys on the URL search string and aborts in-flight
 * requests when the user changes filters mid-load.
 *
 * Search input has a 400ms debounce to avoid one request per keystroke;
 * dropdowns and date inputs commit immediately. Any filter change resets
 * page back to 1.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APPLIANCE_TYPES } from "@/lib/portal/appliance-types";
import {
  fetchOrders,
  type OrderListItem,
  type OrdersListResponse,
} from "@/lib/portal/orders";
import {
  DeliveryDateCell,
  SourceBadge,
} from "@/components/portal/OrderBadges";
import { usePortalSession } from "../session-context";

const PAGE_SIZE = 20;

interface FilterState {
  page: number;
  search: string;
  source: "" | "visualdlp" | "shop";
  applianceType: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: FilterState = {
  page: 1,
  search: "",
  source: "",
  applianceType: "",
  dateFrom: "",
  dateTo: "",
};

function readFilters(sp: URLSearchParams): FilterState {
  const sourceRaw = sp.get("source") ?? "";
  const source: FilterState["source"] =
    sourceRaw === "visualdlp" || sourceRaw === "shop" ? sourceRaw : "";
  const pageRaw = Number.parseInt(sp.get("page") ?? "", 10);
  return {
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    search: sp.get("search") ?? "",
    source,
    applianceType: sp.get("applianceType") ?? "",
    dateFrom: sp.get("dateFrom") ?? "",
    dateTo: sp.get("dateTo") ?? "",
  };
}

function filtersToSearchString(f: FilterState): string {
  const u = new URLSearchParams();
  if (f.page > 1) u.set("page", String(f.page));
  if (f.search) u.set("search", f.search);
  if (f.source) u.set("source", f.source);
  if (f.applianceType) u.set("applianceType", f.applianceType);
  if (f.dateFrom) u.set("dateFrom", f.dateFrom);
  if (f.dateTo) u.set("dateTo", f.dateTo);
  return u.toString();
}

function hasAnyFilter(f: FilterState): boolean {
  return Boolean(
    f.search || f.source || f.applianceType || f.dateFrom || f.dateTo,
  );
}

export default function DashboardPage() {
  const { user, clinic } = usePortalSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams?.toString() ?? "")),
    [searchParams],
  );

  const greetingName = user.name?.split(/\s+/)[0] ?? user.email;

  const [searchInput, setSearchInput] = useState(filters.search);
  const [data, setData] = useState<OrdersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync local search input when URL changes from outside (e.g. back button).
  const lastUrlSearch = useRef(filters.search);
  useEffect(() => {
    if (filters.search !== lastUrlSearch.current) {
      lastUrlSearch.current = filters.search;
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  // Debounce the search input → URL.
  useEffect(() => {
    if (searchInput === filters.search) return;
    const t = window.setTimeout(() => {
      pushFilters({ ...filters, search: searchInput, page: 1 });
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const pushFilters = useCallback(
    (next: FilterState) => {
      const qs = filtersToSearchString(next);
      router.replace(`/portal/dashboard/${qs ? `?${qs}` : ""}`);
    },
    [router],
  );

  // Fetch effect — reruns whenever URL params change. Aborts any in-flight
  // request on rerun so stale responses can't overwrite fresh state.
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErrorMsg(null);
    fetchOrders(
      {
        page: filters.page,
        limit: PAGE_SIZE,
        search: filters.search || undefined,
        source: filters.source || undefined,
        applianceType: filters.applianceType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      },
      ctrl.signal,
    ).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res.ok) {
        setData(res.data);
      } else if (res.status === 401) {
        router.replace("/portal/");
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
        <header className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] uppercase tracking-widest text-gray-500">
              {clinic.name}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
              Hello, {greetingName}.
            </h1>
            {user.role === "aso_staff" && (
              <p className="mt-2 text-[12.5px] text-gray-500">
                Showing orders across all clinics — ASO staff view.
              </p>
            )}
          </div>
          {user.role !== "aso_staff" && (
            <Link
              href="/portal/request-access/"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] text-navy hover:border-navy hover:text-brandOrange transition-colors"
              title="Apply to link your account to a different clinic"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Apply for clinic linking</span>
            </Link>
          )}
        </header>

        {/* Filters */}
        <section
          className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 mb-5"
          aria-label="Filters"
        >
          <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-5">
              <label
                htmlFor="orders-search"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Search
              </label>
              <div className="relative">
                <input
                  id="orders-search"
                  type="search"
                  inputMode="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Order # or patient name"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </div>
            </div>

            {/* Source */}
            <div className="sm:col-span-3">
              <label
                htmlFor="orders-source"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Source
              </label>
              <select
                id="orders-source"
                value={filters.source}
                onChange={(e) =>
                  pushFilters({
                    ...filters,
                    source: e.target.value as FilterState["source"],
                    page: 1,
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              >
                <option value="">All sources</option>
                <option value="visualdlp">VisualDLP</option>
                <option value="shop">Shop</option>
              </select>
            </div>

            {/* Appliance type */}
            <div className="sm:col-span-4">
              <label
                htmlFor="orders-appliance"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Appliance type
              </label>
              <select
                id="orders-appliance"
                value={filters.applianceType}
                onChange={(e) =>
                  pushFilters({
                    ...filters,
                    applianceType: e.target.value,
                    page: 1,
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-navy focus:border-navy focus:outline-none transition-colors"
              >
                <option value="">All appliances</option>
                {APPLIANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="sm:col-span-6">
              <label
                htmlFor="orders-from"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Order date from
              </label>
              <input
                id="orders-from"
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
                htmlFor="orders-to"
                className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
              >
                Order date to
              </label>
              <input
                id="orders-to"
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
            <h2 className="font-serif text-lg text-navy">Orders</h2>
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
              Loading orders…
            </div>
          ) : data && data.orders.length === 0 ? (
            <EmptyResults filtered={hasActiveFilters} />
          ) : (
            <>
              <DesktopTable
                orders={data?.orders ?? []}
                showClinic={user.role === "aso_staff"}
              />
              <MobileCardList
                orders={data?.orders ?? []}
                showClinic={user.role === "aso_staff"}
              />
              {showPagination && data && (
                <Pagination
                  page={data.page}
                  totalPages={totalPages}
                  onChange={(next) => pushFilters({ ...filters, page: next })}
                />
              )}
            </>
          )}
        </section>

        <p className="mt-6 text-[12px] text-gray-500 leading-relaxed">
          Need help? Email{" "}
          <a
            href="mailto:aso-digital@outlook.com"
            className="text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
          >
            aso-digital@outlook.com
          </a>{" "}
          or call 808-957-0111.
        </p>
      </div>
    </div>
  );
}

function EmptyResults({ filtered }: { filtered: boolean }) {
  return (
    <div className="px-5 py-12 text-center text-gray-500">
      {filtered
        ? "No orders match your filters. Try adjusting search or date range."
        : "No orders yet — coming soon."}
    </div>
  );
}

interface RowsProps {
  orders: OrderListItem[];
  showClinic: boolean;
}

function DesktopTable({ orders, showClinic }: RowsProps) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-gray-500 bg-gray-50/60">
            <th className="px-5 py-3 font-medium border-b border-gray-200">
              Order #
            </th>
            <th className="px-5 py-3 font-medium border-b border-gray-200">
              Patient
            </th>
            <th className="px-5 py-3 font-medium border-b border-gray-200">
              Appliance
            </th>
            <th className="px-5 py-3 font-medium border-b border-gray-200">
              Order Date
            </th>
            <th className="px-5 py-3 font-medium border-b border-gray-200">
              Delivery
            </th>
            <th className="px-5 py-3 font-medium border-b border-gray-200">
              Source
            </th>
            {showClinic && (
              <th className="px-5 py-3 font-medium border-b border-gray-200">
                Clinic
              </th>
            )}
            <th
              className="px-5 py-3 font-medium border-b border-gray-200"
              aria-hidden
            />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-gray-100 last:border-b-0">
              <td className="px-5 py-3 text-navy font-medium">
                {o.order_number ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-5 py-3 text-gray-700">
                {o.patient_name ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-5 py-3 text-gray-700">
                {o.appliance_type ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-5 py-3 text-gray-700">
                {o.order_date ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-5 py-3">
                <DeliveryDateCell date={o.delivery_date} />
              </td>
              <td className="px-5 py-3">
                <SourceBadge source={o.source} />
              </td>
              {showClinic && (
                <td className="px-5 py-3 text-[12.5px] text-gray-500">
                  #{o.clinic_id}
                </td>
              )}
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/portal/orders/?id=${o.id}`}
                  className="text-[13px] text-navy hover:text-brandOrange transition-colors underline underline-offset-2"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileCardList({ orders, showClinic }: RowsProps) {
  return (
    <ul className="sm:hidden divide-y divide-gray-100">
      {orders.map((o) => (
        <li key={o.id} className="px-5 py-4">
          <Link
            href={`/portal/orders/?id=${o.id}`}
            className="block hover:bg-gray-50/60 -mx-5 px-5 py-1 rounded-md transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-navy font-medium text-[14px]">
                {o.order_number ?? "—"}
              </span>
              <SourceBadge source={o.source} />
            </div>
            <div className="mt-1 text-[13px] text-gray-700">
              {o.patient_name ?? "—"}
            </div>
            <div className="mt-1 text-[12.5px] text-gray-500">
              {o.appliance_type ?? "—"}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <div className="text-[10.5px] uppercase tracking-widest text-gray-400">
                  Order
                </div>
                <div className="text-gray-700 mt-0.5">
                  {o.order_date ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-widest text-gray-400">
                  Delivery
                </div>
                <div className="mt-0.5">
                  <DeliveryDateCell date={o.delivery_date} />
                </div>
              </div>
            </div>
            {showClinic && (
              <div className="mt-2 text-[11.5px] text-gray-400">
                Clinic #{o.clinic_id}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
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
