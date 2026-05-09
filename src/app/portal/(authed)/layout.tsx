"use client";

/**
 * Authenticated portal shell. Guards every /portal/<authed-route>/ page
 * by calling /api/portal/auth/me on mount and bouncing to /portal/ if
 * the response is 401. While the check is in flight we render a quiet
 * loading state — never the page contents — so we don't briefly flash
 * private data before the redirect lands.
 *
 * The resolved user + clinic are exposed via PortalSessionContext so
 * child pages can render the user's name / clinic without a second
 * fetch.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/portal/client";
import PortalNav from "@/components/portal/PortalNav";
import {
  PortalSessionContext,
  type PortalSessionContextValue,
} from "./session-context";

export default function PortalAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<PortalSessionContextValue | null>(
    null,
  );
  const [status, setStatus] = useState<"checking" | "ok" | "redirecting">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((res) => {
      if (cancelled) return;
      if (res && res.authenticated) {
        setSession({ user: res.user, clinic: res.clinic });
        setStatus("ok");
        return;
      }
      setStatus("redirecting");
      router.replace("/portal/");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status !== "ok" || !session) {
    return (
      <div className="min-h-[calc(100dvh-3rem)] flex items-center justify-center bg-stone-50/40">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <PortalSessionContext.Provider value={session}>
      <div className="min-h-[100dvh] flex flex-col bg-stone-50/40">
        <PortalNav user={session.user} clinic={session.clinic} />
        <main className="flex-grow">{children}</main>
      </div>
    </PortalSessionContext.Provider>
  );
}
