import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout · ASO Hawaii Shop",
  description:
    "Complete your ASO miniature order via PayPal. Pay with PayPal balance or any credit card.",
  alternates: { canonical: "/shop/checkout/" },
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
