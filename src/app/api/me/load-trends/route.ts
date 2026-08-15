import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SetLog {
  set: number;
  reps?: number;
  weightKg?: number;
}

interface Point {
  date: string;
  weightKg: number;
  reps: number | null;
}

// Andamento carichi principali: per ciascun esercizio più allenato, la serie
// temporale del carico massimo registrato in ogni sessione completata.
// Alimenta la card "Andamento carichi principali" nella pagina Progressi.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const rows = await prisma.workoutSessionExercise.findMany({
    where: { session: { userId, status: "COMPLETED", completedAt: { not: null } } },
    orderBy: { session: { completedAt: "asc" } },
    select: {
      exerciseId: true,
      completedSets: true,
      exercise: { select: { name: true, slug: true } },
      session: { select: { completedAt: true } },
    },
    take: 500,
  });

  // Raggruppa per esercizio, un punto per sessione = carico massimo di quella sessione.
  const byExercise = new Map<
    string,
    { name: string; slug: string; points: Point[] }
  >();

  for (const row of rows) {
    const completedAt = row.session.completedAt;
    if (!completedAt) continue;
    const sets = (row.completedSets as unknown as SetLog[]) ?? [];
    let maxWeight = -Infinity;
    let repsAtMax: number | null = null;
    for (const s of sets) {
      if (typeof s.weightKg === "number" && s.weightKg > maxWeight) {
        maxWeight = s.weightKg;
        repsAtMax = typeof s.reps === "number" ? s.reps : null;
      }
    }
    if (!Number.isFinite(maxWeight) || maxWeight <= 0) continue; // solo carichi reali (>0)

    const entry = byExercise.get(row.exerciseId) ?? {
      name: row.exercise.name,
      slug: row.exercise.slug,
      points: [],
    };
    entry.points.push({ date: completedAt.toISOString(), weightKg: maxWeight, reps: repsAtMax });
    byExercise.set(row.exerciseId, entry);
  }

  // Solo esercizi con almeno 2 punti (per mostrare un andamento), i 4 più allenati.
  const exercises = Array.from(byExercise.entries())
    .map(([id, e]) => {
      const first = e.points[0].weightKg;
      const last = e.points[e.points.length - 1].weightKg;
      return {
        id,
        name: e.name,
        slug: e.slug,
        points: e.points,
        lastWeightKg: last,
        deltaKg: Math.round((last - first) * 10) / 10,
      };
    })
    .filter((e) => e.points.length >= 2)
    .sort((a, b) => b.points.length - a.points.length)
    .slice(0, 4);

  return NextResponse.json({ exercises });
}
