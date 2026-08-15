import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const sessions = await prisma.analysisSession.findMany({
    where: { userId: session.user.id, videoPath: { not: null } },
    orderBy: { completedAt: "desc" },
    select: { id: true, completedAt: true, exercise: { select: { name: true } } },
  });

  return NextResponse.json({
    count: sessions.length,
    items: sessions.map((s) => ({ id: s.id, exerciseName: s.exercise.name, completedAt: s.completedAt })),
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all") === "1";

  if (!id && !all) {
    return NextResponse.json({ error: "Specificare 'id' o 'all=1'" }, { status: 400 });
  }

  const targets = await prisma.analysisSession.findMany({
    where: { userId, videoPath: { not: null }, ...(id ? { id } : {}) },
    select: { id: true, videoPath: true },
  });
  if (targets.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const paths = targets.map((t) => t.videoPath as string);
  const { error } = await getSupabaseAdmin().storage.from(STORAGE_BUCKETS.ANALYSIS_VIDEOS).remove(paths);
  if (error) {
    console.error("Analysis video delete storage error:", error);
    return NextResponse.json({ error: "Errore durante l'eliminazione dei video" }, { status: 500 });
  }

  // L'analisi già ricevuta (report, punteggi) resta: si azzerano solo i riferimenti al video.
  await prisma.analysisSession.updateMany({
    where: { id: { in: targets.map((t) => t.id) } },
    data: { videoUrl: null, videoPath: null },
  });

  return NextResponse.json({ deleted: targets.length });
}
