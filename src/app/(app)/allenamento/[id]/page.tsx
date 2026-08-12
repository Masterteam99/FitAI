import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Dumbbell, Calendar, Clock, Zap, CheckCircle, Camera, Activity, AlertTriangle } from "lucide-react";
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

  const [imbalances, lastAnalysis] = await Promise.all([
    computeImbalances(userId, 30),
    prisma.analysisSession.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { finalReport: true },
    }),
  ]);
  const topImbalances = imbalances.slice(0, 3);
  const fr = (lastAnalysis?.finalReport ?? null) as FinalReport | null;

  const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);
  const estimatedMinutes = totalExercises * 4;

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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{copy.allenamentoDettaglio.dayLabel(day.dayNumber, day.name)}</CardTitle>
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
