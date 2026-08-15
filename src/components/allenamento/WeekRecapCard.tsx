"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Flame, Weight, Dumbbell } from "lucide-react";
import { copy } from "@/content/copy";

interface WeekSession {
  id: string;
  totalSeconds: number | null;
  totalVolumeKg: number | null;
}

export function WeekRecapCard({ planId, plannedPerWeek }: { planId: string; plannedPerWeek: number }) {
  const c = copy.allenamento.weekRecap;
  const [sessions, setSessions] = useState<WeekSession[]>([]);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/workout-plans/${planId}/completed-this-week`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: WeekSession[] }) => setSessions(d.items ?? []))
      .catch(() => {});
    fetch("/api/profilo")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { currentStreak?: number } | null) => setStreak(d?.currentStreak ?? null))
      .catch(() => {});
  }, [planId]);

  const totalVolume = sessions.reduce((a, s) => a + (s.totalVolumeKg ?? 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/40 rounded-lg p-3 text-center">
            <Dumbbell className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{sessions.length}/{plannedPerWeek}</div>
            <div className="text-[11px] text-muted-foreground">{c.sessionsLabel}</div>
          </div>
          <div className="bg-secondary/40 rounded-lg p-3 text-center">
            <Weight className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold">{Math.round(totalVolume)}</div>
            <div className="text-[11px] text-muted-foreground">{c.volumeLabel}</div>
          </div>
          <div className="bg-secondary/40 rounded-lg p-3 text-center">
            <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
            <div className="text-lg font-bold">{streak ?? "—"}</div>
            <div className="text-[11px] text-muted-foreground">{c.streakLabel}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
