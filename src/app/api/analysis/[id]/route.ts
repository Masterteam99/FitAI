import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const report = await prisma.analysisSession.findFirst({
    where: { id, userId: session.user.id as string },
    include: { exercise: { select: { name: true, slug: true, videoUrl: true } } },
  });
  if (!report) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  return NextResponse.json({
    id: report.id,
    exerciseId: report.exerciseId,
    status: report.status,
    videoUrl: report.videoUrl,
    completedAt: report.completedAt,
    l1Result: report.l1Result,
    l2Result: report.l2Result,
    l3Result: report.l3Result,
    finalReport: report.finalReport,
    combinedScore: report.combinedScore,
    exercise: report.exercise,
  });
}
