import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Dumbbell, Calendar, Clock, Zap, CheckCircle, Camera, Activity, AlertTriangle, History, Target, Weight } from "lucide-react";
import { computeImbalances, muscleLabel } from "@/lib/body-map";
import { AdaptiveBodyMap } from "@/components/wow";
import { RevisionRequestForm } from "@/components/RevisionRequestForm";
import type { FinalReport } from "@/types/analysis";
import { copy } from "@/content/copy";
import type { Metadata } from "next";

export const metadata: Metadata = { title: copy.allenamentoDettaglio.meta.title };

interface Props { params: Promise<{ id: string }> }

const DIFFICULTY_LABELS: Record<string, string> = copy.allenamentoDettaglio.difficultyLabels;

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id as string;

  const plan = await prisma.workoutPlan.findFirst({
    where: { id, userId },
    include: {
      days: {
        include: {
          exercises: {
            include: { exercise: { select: { id: true, name: true, slug: true, muscleGroupPrimary: true, difficulty: true, equipment: true } } },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  if (!plan) notFound();

  const [imbalances, lastAnalysis, planSessions] = await Promise.all([
    computeImbalances(userId, 30),
    prisma.analysisSession.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { finalReport: true },
    }),
    prisma.workoutSession.findMany({
      where: { userId, planId: plan.id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { id: true, planDayId: true, completedAt: true, totalSeconds: true, totalVolumeKg: true },
    }),
  ]);
  const topImbalances = imbalances.slice(0, 3);
  const fr = (lastAnalysis?.finalReport ?? null) as FinalReport | null;

  const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);
  const estimatedMinutes = totalExercises * 4;

  // Progresso: quanti allenamenti pianificati (giorni non-riposo × settimane) vs completati.
  const workoutDays = plan.days.filter((d) => !d.restDay && d.exercises.length > 0);
  const totalPlannedSessions = workoutDays.length * plan.durationWeeks;
  const completedCount = planSessions.length;
  const progressPct = totalPlannedSessions > 0 ? Math.min(100, Math.round((completedCount / totalPlannedSessions) * 100)) : 0;
  const currentWeek = workoutDays.length > 0 ? Math.min(plan.durationWeeks, Math.floor(completedCount / workoutDays.length) + 1) : 1;

  // Prossimo giorno: quello successivo all'ultimo completato nel ciclo settimanale.
  const lastCompletedDayId = planSessions[0]?.planDayId ?? null;
  const lastIndex = lastCompletedDayId ? workoutDays.findIndex((d) => d.id === lastCompletedDayId) : -1;
  const nextDay = workoutDays.length > 0 ? workoutDays[(lastIndex + 1) % workoutDays.length] : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/allenamento">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            {copy.allenamentoDettaglio.backToPlans}
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            {plan.isActive && <Badge className="bg-primary/20 text-primary border-primary/30">{copy.allenamentoDettaglio.activeBadge}</Badge>}
            {plan.generatedByAI && <Badge variant="secondary" className="gap-1"><Zap className="w-3 h-3" />AI</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{plan.durationWeeks} {copy.allenamentoDettaglio.weeksSuffix}</span>
            <span className="flex items-center gap-1.5"><Dumbbell className="w-4 h-4" />{plan.workoutsPerWeek}{copy.allenamentoDettaglio.workoutsPerWeekSuffix}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{copy.allenamentoDettaglio.minutesPerSession(estimatedMinutes)}</span>
          </div>
        </div>
      </div>

      {/* Prossimo allenamento + progresso nel piano */}
      {nextDay && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  {copy.allenamentoDettaglio.nextSession.eyebrow}
                </p>
                <p className="text-lg font-bold">{nextDay.name}</p>
                <p className="text-sm text-muted-foreground">{copy.allenamentoDettaglio.nextSession.exercises(nextDay.exercises.length)}</p>
              </div>
              <Link href={`/allenamento/${plan.id}/sessione?day=${nextDay.id}`}>
                <Button className="gap-1.5"><Play className="w-4 h-4" />{copy.allenamentoDettaglio.startDay}</Button>
              </Link>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{copy.allenamentoDettaglio.nextSession.progress(completedCount, totalPlannedSessions)}</span>
                <span>{copy.allenamentoDettaglio.nextSession.week(currentWeek, plan.durationWeeks)}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Il tuo stato — heatmap corpo + rischi + suggerimenti (consolidato dalla dashboard) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            {copy.allenamentoDettaglio.statusTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!lastAnalysis && topImbalances.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.allenamentoDettaglio.statusNoData}</p>
          ) : (
            <div className="grid sm:grid-cols-[150px_1fr] gap-5 items-center">
              <div className="max-w-[150px] mx-auto">
                <AdaptiveBodyMap
                  mode="balance"
                  data={imbalances.map((i) => ({ muscle: i.muscle, deficitPct: i.deficitPct }))}
                  view="front"
                  showToggle={false}
                />
              </div>
              <div className="space-y-3">
                {fr?.injuryRiskAlert?.level && (
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-energy-hot mt-0.5 shrink-0" />
                    <span><strong>{copy.allenamentoDettaglio.statusRisk}:</strong> {fr.injuryRiskAlert.level}</span>
                  </div>
                )}
                {fr?.prioritizedImprovements?.[0] && (
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{copy.allenamentoDettaglio.statusSuggestion}:</strong> {fr.prioritizedImprovements[0]}
                  </p>
                )}
                {topImbalances.length > 0 ? (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {topImbalances.map((i) => (
                      <li key={i.muscle} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-energy-hot" />
                        {muscleLabel(i.muscle as never)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">{copy.allenamentoDettaglio.statusGoodBalance}</p>
                )}
                <p className="text-[11px] text-muted-foreground/80">{copy.allenamentoDettaglio.statusDisclaimer}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plan.days.map((day) => (
          <Card key={day.id} className={day.restDay ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{copy.allenamentoDettaglio.dayLabel(day.dayNumber, day.name)}</CardTitle>
                  {nextDay?.id === day.id && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{copy.allenamentoDettaglio.nextSession.badge}</Badge>
                  )}
                </div>
                {!day.restDay && day.exercises.length > 0 && (
                  <Link href={`/allenamento/${plan.id}/sessione?day=${day.id}`}>
                    <Button size="sm" className="gap-1.5">
                      <Play className="w-4 h-4" />
                      {copy.allenamentoDettaglio.startDay}
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {day.restDay ? (
                <p className="text-sm text-muted-foreground">{copy.allenamentoDettaglio.restDayNote}</p>
              ) : day.exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">{copy.allenamentoDettaglio.noExercises}</p>
              ) : (
                <div className="space-y-2">
                  {day.exercises.map((ex, i) => (
                    <div key={ex.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
                      <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/esercizi/${ex.exercise.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                          {ex.exercise.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{ex.exercise.muscleGroupPrimary}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        {ex.sets}×{ex.reps ?? (ex.durationSeconds ? `${ex.durationSeconds}s` : "—")}
                        {ex.restSeconds && <span className="block">{copy.allenamentoDettaglio.restPrefix} {ex.restSeconds}s</span>}
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
                        {DIFFICULTY_LABELS[ex.exercise.difficulty] ?? ex.exercise.difficulty}
                      </Badge>
                      <Link href={`/analisi/sessione?id=${ex.exercise.id}`} className="shrink-0" title={copy.allenamentoDettaglio.analyzeAction}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                          <Camera className="w-4 h-4" />
                          <span className="hidden sm:inline">{copy.allenamentoDettaglio.analyzeAction}</span>
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessioni completate in questo piano — passato */}
      {planSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              {copy.allenamentoDettaglio.history.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {planSessions.slice(0, 8).map((s) => {
              const dayName = plan.days.find((d) => d.id === s.planDayId)?.name ?? copy.allenamentoDettaglio.history.fallbackName;
              const minutes = s.totalSeconds ? Math.round(s.totalSeconds / 60) : null;
              const date = s.completedAt ? new Date(s.completedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : null;
              return (
                <Link key={s.id} href={`/allenamento/sessioni/${s.id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dayName}</p>
                    <p className="text-xs text-muted-foreground">{date}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {minutes != null && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{copy.allenamentoDettaglio.history.minutes(minutes)}</span>}
                    {s.totalVolumeKg != null && s.totalVolumeKg > 0 && (
                      <span className="flex items-center gap-1"><Weight className="w-3.5 h-3.5" />{copy.allenamentoDettaglio.history.volume(Math.round(s.totalVolumeKg))}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {plan.days.some((d) => !d.restDay && d.exercises.length > 0) && (
        <div className="flex items-center gap-3 pt-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm">{copy.allenamentoDettaglio.hintPre}<strong>{copy.allenamentoDettaglio.hintBold}</strong>{copy.allenamentoDettaglio.hintPost}</p>
        </div>
      )}

      <RevisionRequestForm type="FITNESS" />
    </div>
  );
}
