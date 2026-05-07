import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed · ASO Hawaii Shop",
  description:
    "Thank you for ordering from the ASO miniature collection. Your order is being prepared.",
  alternates: { canonical: "/shop/thank-you/" },
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
