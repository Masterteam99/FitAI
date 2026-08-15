"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { AdaptiveBodyMap } from "@/components/wow";
import { copy } from "@/content/copy";

interface ImbalanceItem { muscle: string; deficitPct: number; daysSinceLast: number | null; message: string }

export function BodyBalanceCard() {
  const c = copy.allenamento.bodyBalance;
  const [items, setItems] = useState<ImbalanceItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/me/body-map?mode=balance&days=30")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d: { data: ImbalanceItem[] }) => setItems(d.data ?? []))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{c.balanced}</p>
        ) : (
          <div className="grid sm:grid-cols-[150px_1fr] gap-5 items-center">
            <div className="max-w-[150px] mx-auto">
              <AdaptiveBodyMap
                mode="balance"
                data={items.map((i) => ({ muscle: i.muscle as never, deficitPct: i.deficitPct }))}
                view="front"
                showToggle={false}
              />
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {items.slice(0, 4).map((i) => (
                <li key={i.muscle} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-energy-hot shrink-0" />
                  {i.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
