import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote · ASO Hawaii — Pricing for Orthodontic Appliances",
  description:
    "Request a quote from ASO International Hawaii. Pricing for retainers, aligners, expanders, splints, and custom orthodontic appliances. Reply within one business day.",
  alternates: { canonical: "/get-a-quote/" },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
