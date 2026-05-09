import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASO Hawaii Doctor Portal",
  description:
    "Sign in to track your case submissions, view delivery dates, and manage your clinic's account with ASO Hawaii.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/portal/" },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
