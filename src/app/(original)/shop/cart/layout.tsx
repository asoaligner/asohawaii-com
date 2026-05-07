import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart · ASO Hawaii Shop",
  description:
    "Review the ASO miniature collection items in your cart before checking out via PayPal.",
  alternates: { canonical: "/shop/cart/" },
  robots: { index: false, follow: true },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
