"use client";

import { useEffect, useState } from "react";
import { AdminMetricCard } from "./AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <AdminMetricCard label="Costo stimato mese" value={`€ ${data.costEur}`} hint="basato su stime token" tone="premium" />
        <AdminMetricCard label="Utenti FREE al limite" value={`${data.percentFreeAtLimit}%`} hint="almeno 1 quota maxata" tone="warning" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Uso per feature (mese corrente)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.byFeatureNow.length === 0 && <div className="text-muted-foreground">Nessuna chiamata questo mese</div>}
          {data.byFeatureNow.map((r) => (
            <div key={r.feature} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{r.feature}</span>
              <span className="text-muted-foreground">{r.count} chiamate</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Uso per mese (ultimi 6)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.byPeriod.length === 0 && <div className="text-muted-foreground">Nessun dato storico</div>}
          {data.byPeriod.map((p) => (
            <div key={p.period} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{p.period}</span>
              <span className="text-muted-foreground">{p.count} chiamate</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top 10 utenti per uso AI (mese corrente)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.topUsers.length === 0 && <div className="text-muted-foreground">Nessun utente attivo</div>}
          {data.topUsers.map((u) => (
            <div key={u.userId} className="flex justify-between border-b border-border py-1 last:border-0">
              <span className="truncate max-w-[200px]">{u.email}</span>
              <span className="text-muted-foreground">{u.count} chiamate</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
