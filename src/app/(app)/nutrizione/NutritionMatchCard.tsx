"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { copy } from "@/content/copy";

interface Match {
  id: string;
  name: string;
  description: string;
  dietType: string;
  rationale: string;
  macros: { calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null };
  weeklyText: string;
}

export function NutritionMatchCard() {
  const c = copy.nutrizione;
  const [match, setMatch] = useState<Match | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/nutrition/match")
      .then((r) => r.json())
      .then((d: { match: Match | null }) => setMatch(d.match ?? null))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !match) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{c.matchTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{c.matchSubtitle}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{match.name}</span>
          <Badge variant="secondary" className="text-xs">{match.dietType}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{match.description}</p>
        {match.macros.calories != null && (
          <p className="text-xs text-muted-foreground">
            {c.matchMacros}: {match.macros.calories} kcal · P {match.macros.protein ?? "—"} · C {match.macros.carbs ?? "—"} · G {match.macros.fat ?? "—"}
          </p>
        )}
        {match.weeklyText && <p className="text-sm whitespace-pre-wrap">{match.weeklyText}</p>}
      </CardContent>
    </Card>
  );
}
