"use client";

/**
 * Phase 1.1 dashboard. The orders table is intentionally empty — the
 * portal_orders sync pipeline ships in Phase 1.4. We show a zero-state
 * card and the user's clinic so the round-trip auth flow is verifiable
 * end-to-end without any seed orders.
 */

import { usePortalSession } from "../session-context";

const COLUMNS = [
  "Order #",
  "Patient",
  "Appliance",
  "Order Date",
  "Delivery Date",
  "",
];

export default function DashboardPage() {
  const { user, clinic } = usePortalSession();
  const greetingName = user.name?.split(/\s+/)[0] ?? user.email;

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <p className="text-[12px] uppercase tracking-widest text-gray-500">
            {clinic.name}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-navy mt-1 leading-tight">
            Hello, {greetingName}.
          </h1>
          <p className="mt-2 text-[14px] text-gray-600 leading-relaxed max-w-xl">
            Your case history will appear here once order sync goes live. For
            now your account is set up and ready.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg text-navy">Orders</h2>
            <span className="text-[11.5px] uppercase tracking-widest text-gray-400">
              0 records
            </span>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-gray-500 bg-gray-50/60">
                  {COLUMNS.map((c, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 font-medium border-b border-gray-200"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-12 text-center text-gray-500 italic"
                  >
                    No orders yet — coming soon.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="sm:hidden px-5 py-10 text-center text-[14px] text-gray-500 italic">
            No orders yet — coming soon.
          </div>
        </section>

        <p className="mt-6 text-[12px] text-gray-500 leading-relaxed">
          Need help right now? Email{" "}
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
