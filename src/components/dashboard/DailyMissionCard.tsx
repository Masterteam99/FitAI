"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Dumbbell, Apple, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMission } from "@/lib/dailyMission-shared";
import { MOOD_EMOJI, CHECKIN_MOODS } from "@/lib/dailyMission-shared";
import { copy } from "@/content/copy";

const DATE_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function DailyMissionCard({ mission }: { mission: DailyMission }) {
  const router = useRouter();
  const [optimisticMood, setOptimisticMood] = useState<number | null>(mission.checkin.selectedMood);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const dateLabel = DATE_FORMATTER.format(new Date(`${mission.date}T00:00:00Z`));
  const allDone = mission.completedCount === 3;

  function handleMood(mood: number) {
    if (pending) return;
    setError("");
    const prev = optimisticMood;
    setOptimisticMood(mood);
    startTransition(async () => {
      const res = await fetch("/api/daily-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      if (!res.ok) {
        setOptimisticMood(prev);
        setError(copy.dailyMission.checkinSaveError);
        return;
      }
      router.refresh();
    });
  }

  const checkinDone = optimisticMood !== null;

  return (
    <Card className={cn("transition-colors", allDone && "border-primary/40 bg-primary/5")}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{dateLabel}</p>
            <h2 className="text-lg font-bold">
              {allDone ? copy.dailyMission.missionDoneTitle : copy.dailyMission.missionTitle}
            </h2>
          </div>
          <div className="flex items-center gap-1.5" aria-label={copy.dailyMission.tasksProgressAria(mission.completedCount)}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  i < mission.completedCount ? "bg-primary" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>

        <MissionRow
          icon={<Dumbbell className="w-5 h-5" />}
          status={mission.workout.status}
          label={mission.workout.label}
          subtitle={mission.workout.hasPlan ? undefined : copy.dailyMission.startHere}
          action={
            <Link href={mission.workout.ctaHref}>
              <Button size="sm" variant={mission.workout.status === "done" ? "outline" : "default"}>
                {mission.workout.status === "done" ? copy.dailyMission.ctaSee : mission.workout.hasPlan ? copy.dailyMission.ctaStart : copy.dailyMission.ctaCreate}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          }
        />

        <MissionRow
          icon={<Apple className="w-5 h-5" />}
          status={mission.nutrition.status}
          label={mission.nutrition.label}
          action={
            <Link href={mission.nutrition.ctaHref}>
              <Button size="sm" variant={mission.nutrition.status === "done" ? "outline" : "default"}>
                {mission.nutrition.status === "done" ? copy.dailyMission.ctaSee : copy.dailyMission.ctaLog}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          }
        />

        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              checkinDone ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary",
            )}
          >
            {checkinDone ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium", checkinDone && "text-muted-foreground")}>
              {checkinDone ? copy.dailyMission.checkinFeeling(MOOD_EMOJI[optimisticMood!]) : copy.dailyMission.checkinQuestion}
            </p>
            <div className="mt-2 flex gap-1.5">
              {CHECKIN_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-label={copy.dailyMission.moodAria(m)}
                  disabled={pending}
                  onClick={() => handleMood(m)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-xl transition-all",
                    optimisticMood === m
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-background hover:bg-secondary",
                    pending && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MissionRow({
  icon,
  status,
  label,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  status: "pending" | "in_progress" | "done";
  label: string;
  subtitle?: string;
  action: React.ReactNode;
}) {
  const done = status === "done";
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          done ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary",
        )}
      >
        {done ? <Check className="w-4 h-4" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", done && "line-through text-muted-foreground")}>{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
