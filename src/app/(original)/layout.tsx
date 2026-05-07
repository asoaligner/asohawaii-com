import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Support from "@/components/Support";
import AIChatWidget from "@/components/AIChatWidget";
import { ShopCartProvider } from "@/contexts/ShopCartContext";

export default function OriginalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopCartProvider>
      <Nav />
      <main>{children}</main>
      <Footer />
      <Support />
      <AIChatWidget />
    </ShopCartProvider>
  );
}
