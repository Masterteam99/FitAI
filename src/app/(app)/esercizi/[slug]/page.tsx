import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS } from "@/types/exercise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle, AlertTriangle, PlayCircle, Target, History } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AnimatedArea } from "@/components/wow";
import { copy } from "@/content/copy";

interface SetLog { set: number; reps?: number; weightKg?: number }

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ex = await prisma.exercise.findUnique({ where: { slug }, select: { name: true } });
  return { title: ex?.name ?? copy.esercizioDettaglio.fallbackTitle };
}

export default async function EsercizioPage({ params }: Props) {
  const { slug } = await params;
  const exercise = await prisma.exercise.findUnique({
    where: { slug },
    include: {
      biomechanicalSpec: {
        include: { movements: { include: { phases: { include: { triggers: true } } } } },
      },
    },
  });
  if (!exercise) notFound();

  // Storico carichi dell'utente per questo esercizio (ultime 5 sessioni con log)
  const session = await auth();
  const loadHistory = session?.user?.id
    ? (await prisma.workoutSessionExercise.findMany({
        where: { exerciseId: exercise.id, session: { userId: session.user.id as string, status: "COMPLETED" } },
        orderBy: { session: { completedAt: "desc" } },
        take: 5,
        select: { id: true, completedSets: true, session: { select: { completedAt: true } } },
      }))
        .map((row) => {
          const sets = (row.completedSets as unknown as SetLog[]) ?? [];
          const logged = sets.filter((s) => s.weightKg !== undefined);
          if (logged.length === 0) return null;
          const best = logged.reduce((a, b) => ((b.weightKg ?? 0) > (a.weightKg ?? 0) ? b : a));
          const e1rm = Math.round(Math.max(...logged.map((s) => (s.weightKg ?? 0) * (1 + (s.reps ?? 0) / 30))));
          return { id: row.id, date: row.session.completedAt, best, e1rm, totalSets: sets.length };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
    : [];

  // Curva 1RM stimato (Epley) in ordine cronologico crescente + record
  const e1rmSeries = [...loadHistory].reverse().map((h) => h.e1rm);
  const e1rmPr = e1rmSeries.length > 0 ? Math.max(...e1rmSeries) : 0;

  const biomechanicalRules = exercise.biomechanicalSpec?.movements.flatMap((m) =>
    m.phases.flatMap((p) =>
      p.triggers.map((t) => ({
        id: t.id,
        joint: m.joint,
        movement: m.movementType,
        phase: p.phase,
        minAngle: p.minAngle,
        maxAngle: p.maxAngle,
        severity: t.severity,
        feedback: t.feedback,
      }))
    )
  ) ?? [];

  const severityIcon = { CRITICAL: "🔴", ERROR: "🟠", WARNING: "🟡" };
  const difficultyColor = { BEGINNER: "success", INTERMEDIATE: "warning", ADVANCED: "destructive" } as const;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/esercizi"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{copy.esercizioDettaglio.backToExercises}</Button></Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video / thumbnail */}
        <div className="space-y-4">
          <div className="aspect-video rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
            {exercise.videoUrl ? (
              <video src={exercise.videoUrl} controls className="w-full h-full object-cover rounded-xl" poster={exercise.thumbnailUrl ?? undefined} />
            ) : (
              <div className="text-center space-y-2">
                <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">{copy.esercizioDettaglio.videoComingSoon}</p>
              </div>
            )}
          </div>
          <Link href={`/analisi?esercizio=${exercise.slug}`}>
            <Button className="w-full gap-2">
              <Brain className="w-4 h-4" />
              {copy.esercizioDettaglio.analyzeWithAi}
            </Button>
          </Link>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{exercise.name}</h1>
            <p className="text-muted-foreground mt-1">{exercise.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={difficultyColor[exercise.difficulty]}>{DIFFICULTY_LABELS[exercise.difficulty]}</Badge>
            <Badge variant="outline">{MUSCLE_GROUP_LABELS[exercise.muscleGroupPrimary as keyof typeof MUSCLE_GROUP_LABELS]}</Badge>
            <Badge variant="secondary">{CATEGORY_LABELS[exercise.category as keyof typeof CATEGORY_LABELS]}</Badge>
            {exercise.muscleGroupsSecondary.map((mg) => (
              <Badge key={mg} variant="outline" className="text-muted-foreground">{MUSCLE_GROUP_LABELS[mg as keyof typeof MUSCLE_GROUP_LABELS]}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">{exercise.caloriesPerMinute}</p>
              <p className="text-xs text-muted-foreground">{copy.esercizioDettaglio.statCalPerMin}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">{biomechanicalRules.length}</p>
              <p className="text-xs text-muted-foreground">{copy.esercizioDettaglio.statAiRules}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">{exercise.equipment.length}</p>
              <p className="text-xs text-muted-foreground">{copy.esercizioDettaglio.statEquipment}</p>
            </div>
          </div>

          {/* Attrezzatura */}
          <div>
            <p className="text-sm font-medium mb-2">{copy.esercizioDettaglio.equipmentNeeded}</p>
            <div className="flex flex-wrap gap-2">
              {exercise.equipment.map((eq) => (
                <span key={eq} className="text-xs bg-secondary/50 border border-border rounded-full px-2.5 py-1">
                  {EQUIPMENT_LABELS[eq as keyof typeof EQUIPMENT_LABELS] ?? eq}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Istruzioni */}
      <Card>
        <CardHeader><CardTitle>{copy.esercizioDettaglio.instructionsTitle}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {exercise.instructions.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Curva 1RM stimato nel tempo */}
      {e1rmSeries.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="w-4 h-4 text-primary" />
              Stima 1RM nel tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-3xl" style={{ color: "var(--organic-espresso)" }}>{e1rmPr}</span>
              <span className="text-sm text-muted-foreground">kg · record stimato (Epley)</span>
            </div>
            <AnimatedArea values={e1rmSeries} color="#3fae5a" className="w-full h-[140px] block" />
          </CardContent>
        </Card>
      )}

      {/* Storico carichi utente */}
      {loadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="w-4 h-4 text-primary" />
              {copy.esercizioDettaglio.loadHistoryTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadHistory.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-secondary/30">
                <span className="text-muted-foreground">{h.date ? formatDate(h.date) : "—"}</span>
                <span className="font-semibold">
                  {copy.esercizioDettaglio.loadHistoryBest(h.best.weightKg ?? 0, h.best.reps ?? null, h.totalSets)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Regole biomeccaniche */}
      {biomechanicalRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {copy.esercizioDettaglio.biomechanicalTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{copy.esercizioDettaglio.biomechanicalIntro}</p>
            {biomechanicalRules.map((r) => (
              <div key={r.id} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                <span className="text-lg shrink-0">{severityIcon[r.severity]}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium capitalize">{r.joint.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">— {r.movement} ({r.phase.toLowerCase()})</span>
                    <Badge variant="outline" className="text-xs">{r.minAngle}°–{r.maxAngle}°</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.feedback}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Note professionali */}
      {exercise.professionalNotes && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />{copy.esercizioDettaglio.professionalNotesTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{exercise.professionalNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
