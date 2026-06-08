import { StatsDashboard } from "@/components/admin/StatsDashboard";

export const dynamic = "force-dynamic";

export default function AdminStatsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Statistiche d&apos;uso</h1>
        <p className="text-sm text-muted-foreground mt-1">Aggregati globali sull&apos;utilizzo dell&apos;app.</p>
      </div>
      <StatsDashboard />
    </div>
  );
}
