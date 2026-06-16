import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SetLog {
  set: number;
  reps?: number;
  weightKg?: number;
}

// Ultimo carico registrato dall'utente per ciascun esercizio richiesto:
// alimenta il prefill degli input kg/reps nella sessione e l'hint "Ultimo: …".
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const ids = (new URL(req.url).searchParams.get("exerciseIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  if (ids.length === 0) return NextResponse.json({});

  const rows = await prisma.workoutSessionExercise.findMany({
    where: {
      exerciseId: { in: ids },
      session: { userId, status: "COMPLETED" },
    },
    orderBy: { session: { completedAt: "desc" } },
    select: { exerciseId: true, completedSets: true, session: { select: { completedAt: true } } },
    take: 200,
  });

  const result: Record<string, { weightKg: number | null; reps: number | null; date: string | null }> = {};
  for (const row of rows) {
    if (result[row.exerciseId]) continue; // già preso il più recente
    const sets = (row.completedSets as unknown as SetLog[]) ?? [];
    const last = sets.filter((s) => s.weightKg !== undefined || s.reps !== undefined).at(-1);
    if (!last) continue;
    result[row.exerciseId] = {
      weightKg: last.weightKg ?? null,
      reps: last.reps ?? null,
      date: row.session.completedAt?.toISOString() ?? null,
    };
  }

  return NextResponse.json(result);
}
