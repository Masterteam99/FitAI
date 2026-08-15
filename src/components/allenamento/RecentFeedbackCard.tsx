"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ChevronRight } from "lucide-react";
import { copy } from "@/content/copy";

interface RecentAnalysis {
  id: string;
  exerciseName: string;
  score: number | null;
  topImprovement: string | null;
}

export function RecentFeedbackCard() {
  const c = copy.allenamento.recentFeedback;
  const [items, setItems] = useState<RecentAnalysis[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/me/recent-analyses?limit=5")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: RecentAnalysis[] }) => setItems(d.items ?? []))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((a) => (
          <Link
            key={a.id}
            href={`/analisi/report/${a.id}`}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.exerciseName}</p>
              {a.topImprovement && <p className="text-xs text-muted-foreground truncate">{a.topImprovement}</p>}
            </div>
            {a.score != null && <span className="shrink-0 text-lg font-display font-bold text-primary">{a.score}</span>}
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
