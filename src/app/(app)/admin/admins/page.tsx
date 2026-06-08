import { AdminsManager } from "@/components/admin/AdminsManager";

export const dynamic = "force-dynamic";

export default function AdminAdminsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Gestione admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Chi può accedere all&apos;area admin.</p>
      </div>
      <AdminsManager />
    </div>
  );
}
