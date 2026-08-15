import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FinalReport } from "@/types/analysis";

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;
  const { id } = await params;

  const analyses = await prisma.analysisSession.findMany({
    where: { workoutSessionId: id, userId, status: "COMPLETED" },
    orderBy: { completedAt: "asc" },
    select: {
      id: true,
      exerciseId: true,
      combinedScore: true,
      finalReport: true,
      completedAt: true,
      exercise: { select: { name: true } },
    },
  });

  const items = analyses.map((a) => {
    const fr = a.finalReport as FinalReport | null;
    return {
      id: a.id,
      exerciseId: a.exerciseId,
      exerciseName: a.exercise.name,
      score: a.combinedScore != null ? Math.round(a.combinedScore) : null,
      topImprovement: fr?.prioritizedImprovements?.[0] ?? null,
      completedAt: a.completedAt,
    };
  });

  return NextResponse.json({ items });
}
