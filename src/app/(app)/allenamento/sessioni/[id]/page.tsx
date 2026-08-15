import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Weight, ChevronRight, Camera, CheckCircle } from "lucide-react";
import type { FinalReport } from "@/types/analysis";
import { copy } from "@/content/copy";
import type { Metadata } from "next";

export const metadata: Metadata = { title: copy.sessioneStorico.meta.title };

interface Props { params: Promise<{ id: string }> }

interface SetLog { set: number; reps?: number; weightKg?: number }

export default async function PastSessionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id as string;

  const ws = await prisma.workoutSession.findFirst({
    where: { id, userId },
    include: {
      planDay: { select: { name: true } },
      plan: { select: { id: true, name: true } },
      exercises: {
        include: { exercise: { select: { id: true, name: true, slug: true, muscleGroupPrimary: true } } },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!ws) notFound();

  const analyses = await prisma.analysisSession.findMany({
    where: { workoutSessionId: id, userId, status: "COMPLETED" },
    select: { id: true, exerciseId: true, combinedScore: true, finalReport: true },
  });
  const analysisByExercise = new Map(analyses.map((a) => [a.exerciseId, a]));

  const minutes = ws.totalSeconds ? Math.round(ws.totalSeconds / 60) : null;
  const dateLabel = ws.completedAt
    ? new Date(ws.completedAt).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        {ws.plan ? (
          <Link href={`/allenamento/${ws.plan.id}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{copy.sessioneStorico.backToPlan}</Button>
          </Link>
        ) : (
          <Link href="/allenamento">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{copy.sessioneStorico.backToSessions}</Button>
          </Link>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{ws.planDay?.name ?? copy.sessioneStorico.fallbackName}</h1>
        {dateLabel && <p className="text-muted-foreground capitalize">{dateLabel}</p>}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
          {minutes != null && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{copy.sessioneStorico.minutes(minutes)}</span>}
          {ws.totalVolumeKg != null && ws.totalVolumeKg > 0 && (
            <span className="flex items-center gap-1.5"><Weight className="w-4 h-4" />{copy.sessioneStorico.volume(Math.round(ws.totalVolumeKg))}</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {ws.exercises.map((wse) => {
          const sets = (wse.completedSets as unknown as SetLog[]) ?? [];
          const analysis = analysisByExercise.get(wse.exerciseId);
          const fr = (analysis?.finalReport as FinalReport | null) ?? null;

          return (
            <Card key={wse.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-base">{wse.exercise.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{wse.exercise.muscleGroupPrimary}</p>
                  </div>
                  {analysis?.combinedScore != null && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                      <Camera className="w-3 h-3" />
                      {Math.round(analysis.combinedScore)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {sets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sets.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-secondary/50 rounded-md px-2 py-1">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        {copy.sessioneStorico.setSummary(s.reps, s.weightKg)}
                      </span>
                    ))}
                  </div>
                )}

                {analysis && (
                  <Link
                    href={`/analisi/report/${analysis.id}`}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-sm"
                  >
                    <Camera className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1 min-w-0 truncate">
                      {fr?.prioritizedImprovements?.[0] ?? copy.sessioneStorico.viewAnalysis}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
