import SharedNav from "@/components/supabase/SharedNav";
import SharedFooter from "@/components/supabase/SharedFooter";
import FloatingContact from "@/components/supabase/FloatingContact";

export default function SupabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="supabase-root">
      <SharedNav />
      <main>{children}</main>
      <SharedFooter />
      <FloatingContact />
    </div>
  );
}
