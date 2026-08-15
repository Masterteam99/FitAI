"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { copy } from "@/content/copy";

interface PlanDay {
  id: string;
  dayNumber: number;
  name: string;
  restDay: boolean;
  exercises: { id: string }[];
}

interface CompletedThisWeek {
  id: string;
  planDayId: string | null;
  completedAt: string | null;
}

const WEEKDAY_LABELS = copy.allenamento.weeklyCalendar.weekdayLabels;

// Distribuisce N giorni di allenamento sui 7 slot della settimana (Lun=0..Dom=6), il più
// possibile equidistanti — non è un calendario reale con date fisse (il piano è un ciclo
// ricorrente), ma un'indicazione visiva di quando conviene allenarsi.
function distributeAcrossWeek(workoutDays: PlanDay[]): Array<PlanDay | null> {
  const slots: Array<PlanDay | null> = [null, null, null, null, null, null, null];
  const n = workoutDays.length;
  if (n === 0) return slots;
  workoutDays.forEach((day, i) => {
    const weekdayIndex = Math.min(6, Math.floor((i * 7) / n));
    slots[weekdayIndex] = day;
  });
  return slots;
}

export function WeeklyCalendarStrip({ planId, days }: { planId: string; days: PlanDay[] }) {
  const [completed, setCompleted] = useState<CompletedThisWeek[]>([]);

  useEffect(() => {
    fetch(`/api/workout-plans/${planId}/completed-this-week`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: CompletedThisWeek[] }) => setCompleted(d.items ?? []))
      .catch(() => {});
  }, [planId]);

  const workoutDays = days.filter((d) => !d.restDay && d.exercises.length > 0);
  const slots = distributeAcrossWeek(workoutDays);
  const completedByPlanDayId = new Map(completed.map((c) => [c.planDayId, c]));

  const todayIndex = (() => {
    const jsDay = new Date().getDay(); // 0 dom .. 6 sab
    return jsDay === 0 ? 6 : jsDay - 1; // 0 lun .. 6 dom
  })();

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {slots.map((day, i) => {
        const isToday = i === todayIndex;
        const isRest = !day;
        const completedEntry = day ? completedByPlanDayId.get(day.id) : undefined;
        const isDone = !!completedEntry;

        const content = (
          <div
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl p-2 sm:p-2.5 border transition-colors",
              isRest && "border-transparent bg-secondary/20",
              !isRest && !isDone && !isToday && "border-border bg-secondary/40",
              !isRest && !isDone && isToday && "border-primary bg-primary/10",
              isDone && "border-primary/40 bg-primary/15",
            )}
          >
            <span className={cn("text-[10px] uppercase tracking-wide", isToday ? "text-primary font-bold" : "text-muted-foreground")}>
              {WEEKDAY_LABELS[i]}
            </span>
            {isDone ? (
              <CheckCircle className="w-4 h-4 text-primary" />
            ) : isRest ? (
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
            ) : (
              <span className={cn("w-2 h-2 rounded-full", isToday ? "bg-primary" : "bg-muted-foreground/50")} />
            )}
          </div>
        );

        if (isDone && completedEntry) {
          return (
            <Link key={i} href={`/allenamento/sessioni/${completedEntry.id}`} className="block" title={day?.name}>
              {content}
            </Link>
          );
        }

        return (
          <div key={i} title={day?.name ?? copy.allenamento.weeklyCalendar.restDayTitle}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
