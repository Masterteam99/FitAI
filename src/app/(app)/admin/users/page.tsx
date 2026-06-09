import { UsersTable } from "@/components/admin/UsersTable";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminUsers.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminUsers.subtitle}</p>
      </div>
      <UsersTable />
    </div>
  );
}
