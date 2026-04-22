import Nav from "@/components/Nav";
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
      <Support />
      <AIChatWidget />
    </>
  );
}
