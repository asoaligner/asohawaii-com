"use client";

/**
 * Admin route guard. Sits below /portal/(authed)/layout.tsx — by the time
 * this renders, the session is already resolved and exposed via
 * PortalSessionContext, so we only need to gate on role. Non-aso_staff
 * users are bounced to the dashboard; the server-side API guard at
 * requireAsoStaff() is the actual security boundary.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePortalSession } from "../session-context";

export default function PortalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = usePortalSession();
  const router = useRouter();

  useEffect(() => {
    if (user.role !== "aso_staff") {
      router.replace("/portal/dashboard/");
    }
  }, [user.role, router]);

  if (user.role !== "aso_staff") {
    return (
      <div className="container-narrow py-12 text-center text-sm text-gray-500">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
