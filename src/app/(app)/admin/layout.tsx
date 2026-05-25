import { redirect } from "next/navigation";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) {
      redirect(e.status === 401 ? "/login" : "/dashboard");
    }
    throw e;
  }
  return (
    <div className="flex gap-0 min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-4 lg:p-6">{children}</div>
    </div>
  );
}
