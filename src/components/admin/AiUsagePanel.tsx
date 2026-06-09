"use client";

import { useEffect, useState } from "react";
import { AdminMetricCard } from "./AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/content/copy";

type Data = {
  costEur: number;
  percentFreeAtLimit: number;
  byFeatureNow: Array<{ feature: string; count: number }>;
  byPeriod: Array<{ period: string; count: number }>;
  topUsers: Array<{ userId: string; email: string; count: number }>;
  knownFeatures: string[];
};

export function AiUsagePanel() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-usage").then(async (res) => {
      if (res.ok) setData(await res.json());
    });
  }, []);

  if (!data) return <div className="text-sm text-muted-foreground">{copy.adminAiUsage.panel.loading}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <AdminMetricCard label={copy.adminAiUsage.panel.metricCost} value={`€ ${data.costEur}`} hint={copy.adminAiUsage.panel.metricCostHint} tone="premium" />
        <AdminMetricCard label={copy.adminAiUsage.panel.metricFreeAtLimit} value={`${data.percentFreeAtLimit}%`} hint={copy.adminAiUsage.panel.metricFreeAtLimitHint} tone="warning" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminAiUsage.panel.byFeatureTitle}</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.byFeatureNow.length === 0 && <div className="text-muted-foreground">{copy.adminAiUsage.panel.byFeatureEmpty}</div>}
          {data.byFeatureNow.map((r) => (
            <div key={r.feature} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{r.feature}</span>
              <span className="text-muted-foreground">{copy.adminAiUsage.panel.callsUnit(r.count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminAiUsage.panel.byPeriodTitle}</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.byPeriod.length === 0 && <div className="text-muted-foreground">{copy.adminAiUsage.panel.byPeriodEmpty}</div>}
          {data.byPeriod.map((p) => (
            <div key={p.period} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{p.period}</span>
              <span className="text-muted-foreground">{copy.adminAiUsage.panel.callsUnit(p.count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminAiUsage.panel.topUsersTitle}</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.topUsers.length === 0 && <div className="text-muted-foreground">{copy.adminAiUsage.panel.topUsersEmpty}</div>}
          {data.topUsers.map((u) => (
            <div key={u.userId} className="flex justify-between border-b border-border py-1 last:border-0">
              <span className="truncate max-w-[200px]">{u.email}</span>
              <span className="text-muted-foreground">{copy.adminAiUsage.panel.callsUnit(u.count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
