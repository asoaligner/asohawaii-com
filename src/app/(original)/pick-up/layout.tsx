import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pick-Up Request · ASO Hawaii — Oahu Case Pickup",
  description:
    "Request a case pickup from ASO International Hawaii. Oahu afternoon pickup (1pm–4pm) Monday–Friday. Same-day pickup requires a request before 12pm noon.",
};

export default function PickUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
