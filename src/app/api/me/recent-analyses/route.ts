import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FinalReport } from "@/types/analysis";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const limit = Math.min(10, Math.max(1, parseInt(new URL(req.url).searchParams.get("limit") ?? "5", 10)));

  const analyses = await prisma.analysisSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: limit,
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
      exerciseName: a.exercise.name,
      score: a.combinedScore != null ? Math.round(a.combinedScore) : null,
      topImprovement: fr?.prioritizedImprovements?.[0] ?? null,
      completedAt: a.completedAt,
    };
  });

  return NextResponse.json({ items });
}
