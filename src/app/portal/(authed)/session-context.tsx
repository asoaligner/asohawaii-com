"use client";

/**
 * Resolved portal session context. Provided by /portal/(authed)/layout.tsx
 * after the /api/portal/auth/me check succeeds; consumed by child pages
 * via usePortalSession(). Lives in its own file so dashboard / profile
 * pages can import it without dragging the layout module's default export.
 */

import { createContext, useContext } from "react";
import type { PortalClinic, PortalUser } from "@/lib/portal/client";

export interface PortalSessionContextValue {
  user: PortalUser;
  clinic: PortalClinic;
}

export const PortalSessionContext =
  createContext<PortalSessionContextValue | null>(null);

export function usePortalSession(): PortalSessionContextValue {
  const ctx = useContext(PortalSessionContext);
  if (!ctx) {
    throw new Error(
      "usePortalSession must be used within an authenticated portal route.",
    );
  }
  return ctx;
}
