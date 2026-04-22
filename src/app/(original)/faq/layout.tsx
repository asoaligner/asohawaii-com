import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ · ASO Hawaii — Orthodontic Lab Questions Answered",
  description:
    "Frequently asked questions about ASO International Hawaii: turnaround time, scanner compatibility, Oahu pickup, case submission, and more.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
