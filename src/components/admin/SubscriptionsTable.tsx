"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminMetricCard } from "./AdminMetricCard";

type Row = {
  id: string;
  email: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  subscriptionCurrentPeriodEnd: string | null;
  stripeCustomerId: string | null;
};

type Response = {
  metrics: { premiumActive: number; mrrEur: number; churn30dPct: number; renewalsNext7d: number };
  list: Row[];
  page: number;
  totalPages: number;
};

export function SubscriptionsTable() {
  const [data, setData] = useState<Response | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/subscriptions?page=${page}&status=${status}`)
      .then(async (res) => { if (res.ok) setData(await res.json()); })
      .finally(() => setLoading(false));
  }, [page, status]);

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard label="Premium attivi" value={data.metrics.premiumActive} tone="success" />
        <AdminMetricCard label="MRR stimato" value={`€ ${data.metrics.mrrEur}`} tone="premium" />
        <AdminMetricCard label="Churn 30g" value={`${data.metrics.churn30dPct}%`} tone="danger" />
        <AdminMetricCard label="Rinnovi 7g" value={data.metrics.renewalsNext7d} tone="info" />
      </div>

      <div className="flex gap-1 flex-wrap">
        {["all", "active", "trialing", "past_due", "canceled"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s === "all" ? "Tutti" : s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {loading && <div className="text-sm text-muted-foreground">Aggiornamento…</div>}

      <div className="space-y-2">
        {data.list.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-3 flex justify-between items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{s.email}</div>
                <div className="text-xs text-muted-foreground">
                  {s.subscriptionCurrentPeriodEnd && `Periodo fino ${new Date(s.subscriptionCurrentPeriodEnd).toLocaleDateString("it-IT")}`}
                  {s.stripeCustomerId && (
                    <a
                      className="ml-2 text-cyan-600 underline"
                      href={`https://dashboard.stripe.com/customers/${s.stripeCustomerId}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      Stripe →
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <Badge variant="outline">{s.subscriptionStatus}</Badge>
                {s.subscriptionPlan && <Badge>{s.subscriptionPlan}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Pagina {data.page} di {data.totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
