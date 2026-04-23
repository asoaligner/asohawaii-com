import AdminChatsClient from "./AdminChatsClient";

export const metadata = {
  title: "Chat logs · ASO Hawaii Admin",
  robots: { index: false, follow: false },
};

export default function AdminChatsPage() {
  return <AdminChatsClient />;
}
