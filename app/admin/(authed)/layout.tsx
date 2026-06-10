import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isAdminApiConfigured } from "@/lib/data/env";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  if (isAdminApiConfigured()) {
    const session = await getAdminSession();
    if (!session) {
      redirect("/admin/login");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="min-h-[calc(100vh-64px)] bg-background">{children}</main>
    </div>
  );
}
