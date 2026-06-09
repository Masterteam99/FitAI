import { AiUsagePanel } from "@/components/admin/AiUsagePanel";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminAiUsagePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminAiUsage.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminAiUsage.subtitle}</p>
      </div>
      <AiUsagePanel />
    </div>
  );
}
