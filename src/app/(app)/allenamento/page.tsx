"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Zap, Calendar, ChevronRight, CheckCircle, Loader2, Trash2, Play, History, Clock, Weight } from "lucide-react";
import { WeeklyCalendarStrip } from "@/components/allenamento/WeeklyCalendarStrip";
import { WeekRecapCard } from "@/components/allenamento/WeekRecapCard";
import { RecentFeedbackCard } from "@/components/allenamento/RecentFeedbackCard";
import { BodyBalanceCard } from "@/components/allenamento/BodyBalanceCard";
import { ProfessionalNotesCard } from "@/components/allenamento/ProfessionalNotesCard";
import { copy } from "@/content/copy";

interface WorkoutPlan {
  id: string;
  name: string;
  durationWeeks: number;
  workoutsPerWeek: number;
  primaryGoal: string;
  isActive: boolean;
  generatedByAI: boolean;
  days: { id: string; dayNumber: number; name: string; restDay: boolean; exercises: { id: string }[] }[];
}

interface PastSession {
  id: string;
  completedAt: string | null;
  totalSeconds: number | null;
  totalVolumeKg: number | null;
  planDay: { name: string } | null;
}

const GOAL_LABELS: Record<string, string> = copy.allenamento.goalLabels;

export default function AllenamentoPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workout-plans")
      .then((r) => r.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
    fetch("/api/workout-sessions?limit=6")
      .then((r) => r.json())
      .then((data) => setPastSessions(Array.isArray(data) ? data : []))
      .catch(() => undefined);
  }, []);

  async function setActive(id: string) {
    await fetch(`/api/workout-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setActive: true, isActive: true }),
    });
    setPlans((prev) => prev.map((p) => ({ ...p, isActive: p.id === id })));
  }

  async function deletePlan(id: string) {
    await fetch(`/api/workout-plans/${id}`, { method: "DELETE" });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  const activePlan = plans.find((p) => p.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-primary" />
            {copy.allenamento.title}
          </h1>
          <p className="text-muted-foreground">{copy.allenamento.subtitle}</p>
        </div>
        <Link href="/allenamento/nuovo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {copy.allenamento.newPlan}
          </Button>
        </Link>
      </div>

      <ProfessionalNotesCard />

      {plans.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center space-y-4">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-semibold">{copy.allenamento.emptyTitle}</p>
              <p className="text-sm text-muted-foreground">{copy.allenamento.emptySubtitle}</p>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/allenamento/genera-ai">
                <Button className="gap-2">
                  <Zap className="w-4 h-4" />
                  {copy.allenamento.generateWithAi}
                </Button>
              </Link>
              <Link href="/allenamento/nuovo">
                <Button variant="outline">{copy.allenamento.createManually}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {activePlan && <WeeklyCalendarStrip planId={activePlan.id} days={activePlan.days} />}
          {activePlan && <WeekRecapCard planId={activePlan.id} plannedPerWeek={activePlan.workoutsPerWeek} />}
          {activePlan && <ActiveSessionBlock plan={activePlan} />}

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{copy.allenamento.plansSectionTitle}</h2>
            <div className="space-y-3">
              {activePlan && <PlanCard plan={activePlan} onSetActive={setActive} onDelete={deletePlan} />}
              {plans.filter((p) => !p.isActive).map((plan) => (
                <PlanCard key={plan.id} plan={plan} onSetActive={setActive} onDelete={deletePlan} />
              ))}
            </div>
          </div>

          <PastSessionsCard sessions={pastSessions} />

          <RecentFeedbackCard />

          <BodyBalanceCard />

          <div className="pt-2">
            <Link href="/allenamento/genera-ai">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Zap className="w-4 h-4 text-primary" />
                {copy.allenamento.generateNewWithAi}
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function PastSessionsCard({ sessions }: { sessions: PastSession[] }) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {copy.allenamento.recentSessions.title}
          </CardTitle>
          <Link href="/progressi" className="text-xs text-primary hover:underline shrink-0">
            {copy.allenamento.recentSessions.seeAll}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.map((s) => {
          const minutes = s.totalSeconds ? Math.round(s.totalSeconds / 60) : null;
          const date = s.completedAt
            ? new Date(s.completedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
            : null;
          return (
            <Link key={s.id} href={`/allenamento/sessioni/${s.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.planDay?.name ?? copy.allenamento.recentSessions.fallbackName}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                {minutes != null && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {copy.allenamento.recentSessions.minutes(minutes)}
                  </span>
                )}
                {s.totalVolumeKg != null && s.totalVolumeKg > 0 && (
                  <span className="flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5" />
                    {copy.allenamento.recentSessions.volume(Math.round(s.totalVolumeKg))}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActiveSessionBlock({ plan }: { plan: WorkoutPlan }) {
  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-0.5">{copy.allenamento.sessionEyebrow}</p>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
          </div>
          <Link href={`/allenamento/${plan.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              {copy.allenamento.openFullSession} <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {plan.days.map((day) => (
          <div key={day.id} className={`flex items-center gap-3 p-3 rounded-lg ${day.restDay ? "bg-secondary/30" : "bg-secondary/50"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${day.restDay ? "bg-border" : "bg-primary/20 text-primary"}`}>
              {day.dayNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{day.name}</p>
              <p className="text-xs text-muted-foreground">
                {day.restDay ? copy.allenamento.restDayLabel : copy.allenamento.dayExercises(day.exercises.length)}
              </p>
            </div>
            {!day.restDay && day.exercises.length > 0 && (
              <Link href={`/allenamento/${plan.id}/sessione?day=${day.id}`} className="shrink-0">
                <Button size="sm" className="gap-1.5">
                  <Play className="w-4 h-4" />
                  {copy.allenamento.startDayCta}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PlanCard({ plan, onSetActive, onDelete }: {
  plan: WorkoutPlan;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);
  const workoutDays = plan.days.filter((d) => !d.restDay);

  return (
    <Card className={plan.isActive ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              {plan.isActive && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{copy.allenamento.activeBadge}</Badge>}
              {plan.generatedByAI && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Zap className="w-3 h-3" />{copy.allenamento.generatedBadge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{GOAL_LABELS[plan.primaryGoal] ?? plan.primaryGoal}</p>
          </div>
          <button
            onClick={() => onDelete(plan.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
            aria-label={copy.allenamento.deletePlanAria}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {plan.durationWeeks} {copy.allenamento.weeksSuffix}
          </span>
          <span className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" />
            {plan.workoutsPerWeek}{copy.allenamento.workoutsPerWeekSuffix}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {totalExercises} {copy.allenamento.exercisesSuffix}
          </span>
        </div>

        {workoutDays.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {workoutDays.slice(0, 4).map((day) => (
              <span key={day.id} className="text-xs bg-secondary rounded-md px-2 py-1">{day.name}</span>
            ))}
            {workoutDays.length > 4 && (
              <span className="text-xs text-muted-foreground px-1 py-1">{copy.allenamento.moreDays(workoutDays.length - 4)}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Link href={`/allenamento/${plan.id}`} className="flex-1 min-w-[120px]">
            <Button size="sm" className="w-full gap-1.5">
              {copy.allenamento.goToPlan} <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          {!plan.isActive && (
            <Button size="sm" variant="outline" onClick={() => onSetActive(plan.id)} className="gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {copy.allenamento.setActive}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
