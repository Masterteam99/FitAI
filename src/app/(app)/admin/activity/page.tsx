import { ActivityLog } from "@/components/admin/ActivityLog";

export const dynamic = "force-dynamic";

export default function AdminActivityPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Attività recente</h1>
        <p className="text-sm text-muted-foreground mt-1">Storico delle azioni admin sul sistema.</p>
      </div>
      <ActivityLog />
    </div>
  );
}
