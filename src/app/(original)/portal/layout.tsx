import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASO Hawaii Doctor Portal - Coming Soon",
  description:
    "ASO Hawaii is developing a dedicated doctor portal for partner clinics. Currently use EasyRx for case management.",
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
