"use client";

/**
 * Order detail at /portal/orders/?id=N.
 *
 * Lives at a static route with a query-string id (rather than a dynamic
 * segment) because output: 'export' cannot pre-render DB-driven /[id]/
 * paths. The id is fetched client-side and 404 / out-of-scope rows
 * collapse to the same "Order not found." state on this side, mirroring
 * the API.
 *
 * Reorder + Ask buttons are disabled stubs in Phase 1.2 — Phase 1.5
 * wires them up.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchOrder,
  type OrderDetail,
} from "@/lib/portal/orders";
import {
  DeliveryDateCell,
  SourceBadge,
} from "@/components/portal/OrderBadges";
import { usePortalSession } from "../session-context";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; order: OrderDetail }
  | { status: "not-found" }
  | { status: "error"; message: string };

export default function OrderDetailPage() {
  const { user } = usePortalSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idRaw = searchParams?.get("id") ?? "";
  const id = Number.parseInt(idRaw, 10);
  const validId = Number.isFinite(id) && id > 0;

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!validId) {
      setState({ status: "not-found" });
      return;
    }
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetchOrder(id, ctrl.signal).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res.ok) {
        setState({ status: "ok", order: res.data });
      } else if (res.status === 401) {
        router.replace("/portal/");
      } else if (res.status === 404) {
        setState({ status: "not-found" });
      } else if (res.error !== "aborted") {
        setState({ status: "error", message: res.error });
      }
    });
    return () => ctrl.abort();
  }, [id, validId, router]);

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-4xl">
        <Link
          href="/portal/dashboard/"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-navy transition-colors"
        >
          <span aria-hidden>←</span>
          Back to dashboard
        </Link>

        {state.status === "loading" && (
          <div className="mt-10 text-center text-sm text-gray-400">
            Loading order…
          </div>
        )}

        {state.status === "not-found" && (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="font-serif text-2xl text-navy">Order not found.</p>
            <p className="mt-2 text-[13.5px] text-gray-500">
              It may have been removed, or you may not have access.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-center">
            <p className="text-[14px] text-red-700">{state.message}</p>
            <button
              type="button"
              onClick={() => {
                if (validId) {
                  // re-trigger load by toggling state
                  setState({ status: "loading" });
                  fetchOrder(id).then((res) => {
                    if (res.ok) setState({ status: "ok", order: res.data });
                    else if (res.status === 404)
                      setState({ status: "not-found" });
                    else
                      setState({
                        status: "error",
                        message: res.error,
                      });
                  });
                }
              }}
              className="mt-3 text-[13px] text-navy underline underline-offset-2 hover:text-brandOrange transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === "ok" && (
          <OrderView order={state.order} viewerRole={user.role} />
        )}
      </div>
    </div>
  );
}

interface ViewProps {
  order: OrderDetail;
  viewerRole: "member" | "admin" | "aso_staff";
}

function OrderView({ order, viewerRole }: ViewProps) {
  return (
    <article className="mt-6">
      {/* Header */}
      <header className="rounded-2xl border border-gray-200 bg-white px-5 sm:px-7 py-5 sm:py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Order
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-0.5 leading-tight">
              {order.order_number ?? `#${order.id}`}
            </h1>
            <p className="mt-2 text-[14px] text-gray-700">
              Patient:{" "}
              <span className="text-navy font-medium">
                {order.patient_name ?? "—"}
              </span>
            </p>
          </div>
          <SourceBadge source={order.source} />
        </div>

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-gray-200 bg-white text-gray-400 cursor-not-allowed"
          >
            <span aria-hidden>↺</span>
            Reorder same spec
            <span className="text-[10px] uppercase tracking-widest text-gray-400">
              Soon
            </span>
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-gray-200 bg-white text-gray-400 cursor-not-allowed"
          >
            <span aria-hidden>?</span>
            Ask a question
            <span className="text-[10px] uppercase tracking-widest text-gray-400">
              Soon
            </span>
          </button>
        </div>
      </header>

      {/* Basics */}
      <Section title="Basics">
        <FieldGrid>
          <Field label="Order date" value={order.order_date} />
          <Field
            label="Delivery"
            valueNode={<DeliveryDateCell date={order.delivery_date} />}
          />
          <Field label="Appliance" value={order.appliance_type} />
          <Field
            label="Source"
            valueNode={<SourceBadge source={order.source} />}
          />
        </FieldGrid>
      </Section>

      {/* Shipping */}
      <Section title="Shipping">
        <FieldGrid>
          <Field
            label="Tracking number"
            value={order.tracking_number}
            mono
          />
          <Field label="Carrier" value={order.tracking_carrier} />
          <Field
            label="Notes"
            value={order.delivery_notes}
            full
            wrap
          />
        </FieldGrid>
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <FieldGrid>
          <Field
            label="Design notes"
            value={order.design_notes}
            full
            wrap
          />
          <Field
            label="Additional memo"
            value={order.additional_memo}
            full
            wrap
          />
          {viewerRole === "aso_staff" &&
            order.internal_memo !== undefined && (
              <Field
                label="Internal memo (ASO staff only)"
                value={order.internal_memo}
                full
                wrap
                emphasis
              />
            )}
        </FieldGrid>
      </Section>

      <p className="mt-6 text-[12px] text-gray-400">
        Last updated {order.updated_at}
        {order.synced_at ? ` · Synced ${order.synced_at}` : null}
      </p>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
      <div className="px-5 sm:px-7 py-4 border-b border-gray-200">
        <h2 className="font-serif text-lg text-navy">{title}</h2>
      </div>
      <div className="px-5 sm:px-7 py-5">{children}</div>
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</dl>
  );
}

interface FieldProps {
  label: string;
  value?: string | null;
  valueNode?: React.ReactNode;
  full?: boolean;
  wrap?: boolean;
  mono?: boolean;
  emphasis?: boolean;
}

function Field({
  label,
  value,
  valueNode,
  full,
  wrap,
  mono,
  emphasis,
}: FieldProps) {
  const empty = !valueNode && (value === null || value === undefined || value === "");
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt
        className={`text-[10.5px] uppercase tracking-widest ${
          emphasis ? "text-amber-700" : "text-gray-500"
        } mb-1`}
      >
        {label}
      </dt>
      <dd
        className={`text-[14px] ${
          empty ? "text-gray-400" : "text-navy"
        } ${mono ? "font-mono text-[13px]" : ""} ${
          wrap ? "whitespace-pre-wrap leading-relaxed" : ""
        } ${
          emphasis ? "rounded-lg bg-amber-50 border border-amber-200/70 px-3 py-2" : ""
        }`}
      >
        {valueNode ?? (empty ? "—" : value)}
      </dd>
    </div>
  );
}
