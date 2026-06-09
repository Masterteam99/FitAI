import { ActivityLog } from "@/components/admin/ActivityLog";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminActivityPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminActivity.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminActivity.subtitle}</p>
      </div>
      <ActivityLog />
    </div>
  );
}
