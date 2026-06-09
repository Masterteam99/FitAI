import { AdminsManager } from "@/components/admin/AdminsManager";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminAdminsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminAdmins.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminAdmins.subtitle}</p>
      </div>
      <AdminsManager />
    </div>
  );
}
