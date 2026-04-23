import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us · ASO Hawaii — Honolulu Orthodontic Laboratory",
  description:
    "Contact ASO International Hawaii at 808-957-0111 or asohawaii@hotmail.com. Located at 1441 Kapiolani Blvd #1112, Honolulu HI 96814. Instagram, Dropbox upload, STL submission.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
