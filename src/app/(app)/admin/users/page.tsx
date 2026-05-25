import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Utenti</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestione utenti registrati, promozioni admin, premium gratuiti.</p>
      </div>
      <UsersTable />
    </div>
  );
}
