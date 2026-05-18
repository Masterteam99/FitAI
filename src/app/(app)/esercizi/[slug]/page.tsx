import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS } from "@/types/exercise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle, AlertTriangle, PlayCircle, Target } from "lucide-react";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ex = await prisma.exercise.findUnique({ where: { slug }, select: { name: true } });
  return { title: ex?.name ?? "Esercizio" };
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
        <Link href="/esercizi"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Torna agli esercizi</Button></Link>
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
                <p className="text-sm text-muted-foreground">Video disponibile a breve</p>
              </div>
            )}
          </div>
          <Link href={`/analisi?esercizio=${exercise.slug}`}>
            <Button className="w-full gap-2">
              <Brain className="w-4 h-4" />
              Analizza la mia esecuzione con AI
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
              <p className="text-xs text-muted-foreground">Cal/min</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">{biomechanicalRules.length}</p>
              <p className="text-xs text-muted-foreground">Regole AI</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">{exercise.equipment.length}</p>
              <p className="text-xs text-muted-foreground">Attrezzature</p>
            </div>
          </div>

          {/* Attrezzatura */}
          <div>
            <p className="text-sm font-medium mb-2">Attrezzatura necessaria</p>
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
        <CardHeader><CardTitle>Istruzioni di Esecuzione</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {exercise.instructions.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Regole biomeccaniche */}
      {biomechanicalRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Parametri Biomeccanici AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Il sistema AI monitora questi parametri durante l&apos;analisi in tempo reale:</p>
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
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Note del Professionista</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{exercise.professionalNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
