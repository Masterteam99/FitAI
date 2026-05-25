import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";

export const dynamic = "force-dynamic";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Abbonamenti</h1>
        <p className="text-sm text-muted-foreground mt-1">Stato subscription Stripe e metriche aggregate.</p>
      </div>
      <SubscriptionsTable />
    </div>
  );
}
