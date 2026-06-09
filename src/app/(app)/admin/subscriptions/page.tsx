import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminSubscriptions.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminSubscriptions.subtitle}</p>
      </div>
      <SubscriptionsTable />
    </div>
  );
}
