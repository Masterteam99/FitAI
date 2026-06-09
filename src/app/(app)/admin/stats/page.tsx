import { StatsDashboard } from "@/components/admin/StatsDashboard";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminStatsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminStats.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminStats.subtitle}</p>
      </div>
      <StatsDashboard />
    </div>
  );
}
