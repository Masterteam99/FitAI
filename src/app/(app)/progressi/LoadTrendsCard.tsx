"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { copy } from "@/content/copy";

interface LoadPoint {
  date: string;
  weightKg: number;
  reps: number | null;
}

interface LoadExercise {
  id: string;
  name: string;
  slug: string;
  points: LoadPoint[];
  lastWeightKg: number;
  deltaKg: number;
}

export function LoadTrendsCard() {
  const [exercises, setExercises] = useState<LoadExercise[] | null>(null);

  useEffect(() => {
    fetch("/api/me/load-trends")
      .then((r) => r.json())
      .then((d) => setExercises(Array.isArray(d.exercises) ? d.exercises : []))
      .catch(() => setExercises([]));
  }, []);

  if (exercises === null) return null; // caricamento: la pagina mostra già il suo spinner globale
  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            {copy.progressi.loadTrendsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{copy.progressi.loadTrendsEmpty}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          {copy.progressi.loadTrendsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{copy.progressi.loadTrendsSubtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exercises.map((ex) => {
            const up = ex.deltaKg >= 0;
            const data = ex.points.map((p) => ({
              label: format(parseISO(p.date), "dd/MM"),
              kg: p.weightKg,
            }));
            return (
              <div key={ex.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{ex.name}</p>
                  {ex.points.length >= 2 && (
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      {up ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-orange-500" />
                      )}
                      {copy.progressi.loadTrendsDelta(ex.deltaKg)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {copy.progressi.loadTrendsLast(ex.lastWeightKg)}
                </p>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 9 }} width={32} domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [copy.progressi.loadTrendsTooltip(Number(v ?? 0)), ""]}
                    />
                    <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
