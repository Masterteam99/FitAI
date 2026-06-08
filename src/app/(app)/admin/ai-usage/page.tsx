import { AiUsagePanel } from "@/components/admin/AiUsagePanel";

export const dynamic = "force-dynamic";

export default function AdminAiUsagePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI Usage</h1>
        <p className="text-sm text-muted-foreground mt-1">Uso e costi stimati delle feature AI.</p>
      </div>
      <AiUsagePanel />
    </div>
  );
}
