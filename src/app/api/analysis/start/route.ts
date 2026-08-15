import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analysisRatelimit } from "@/lib/redis";
import { checkQuota, incrementUsage } from "@/lib/billing/gating";
import { captureError } from "@/lib/observability";
import { z } from "zod";

const schema = z.object({ exerciseId: z.string(), workoutSessionId: z.string().optional() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { success } = await analysisRatelimit.limit(session.user.id);
  if (!success) return NextResponse.json({ error: "Limite analisi raggiunto (5/ora)." }, { status: 429 });

  const gate = await checkQuota(session.user.id as string, "analysis_start");
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Hai esaurito le analisi video di questo mese. Passa a Premium per averle illimitate.", code: gate.reason, limit: gate.limit, resetAt: gate.resetAt },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "exerciseId richiesto" }, { status: 400 });

  const exercise = await prisma.exercise.findUnique({
    where: { id: parsed.data.exerciseId },
  });
  if (!exercise) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  // Se arriva da una sessione di allenamento guidata, colleghiamo l'analisi solo se la
  // sessione appartiene davvero a questo utente (altrimenti la ignoriamo silenziosamente).
  let workoutSessionId: string | undefined;
  if (parsed.data.workoutSessionId) {
    const ws = await prisma.workoutSession.findFirst({
      where: { id: parsed.data.workoutSessionId, userId: session.user.id as string },
      select: { id: true },
    });
    if (ws) workoutSessionId = ws.id;
  }

  const analysisSession = await prisma.analysisSession.create({
    data: { userId: session.user.id, exerciseId: exercise.id, status: "RECORDING", workoutSessionId },
  });

  if (!gate.premium) {
    await incrementUsage(session.user.id as string, "analysis_start").catch((e) =>
      captureError(e, { stage: "incrementUsage", feature: "analysis_start", userId: session.user?.id })
    );
  }

  return NextResponse.json({
    analysisSessionId: analysisSession.id,
    exercise: {
      id: exercise.id,
      name: exercise.name,
      slug: exercise.slug,
      videoUrl: exercise.videoUrl,
      explanationVideoUrl: exercise.explanationVideoUrl,
      professionalNotes: exercise.professionalNotes,
      recordingDurationSeconds: exercise.recordingDurationSeconds,
    },
  });
}
