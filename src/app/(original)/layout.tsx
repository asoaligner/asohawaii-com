import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Support from "@/components/Support";
import AIChatWidget from "@/components/AIChatWidget";

export default function OriginalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <Support />
      <AIChatWidget />
    </>
  );
}
