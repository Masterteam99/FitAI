import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guestAnalysisStartRatelimit } from "@/lib/redis";
import { getClientIp, hashIp, GUEST_SESSION_COOKIE, GUEST_SESSION_MAX_AGE_SECONDS } from "@/lib/guest-analysis";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email(),
  exerciseId: z.string().min(1),
  consent: z.boolean().refine((v) => v === true, "Devi accettare i termini per continuare"),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await guestAnalysisStartRatelimit.limit(`start:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Troppi tentativi da questa rete oggi. Riprova più tardi." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi" }, { status: 400 });
  }
  const { name, email, exerciseId } = parsed.data;

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, availableForFreeTrial: true, isActive: true },
  });
  if (!exercise) {
    return NextResponse.json({ error: "Esercizio non disponibile per la prova gratuita" }, { status: 404 });
  }

  const guestRequest = await prisma.guestAnalysisRequest.create({
    data: {
      name: name || null,
      email: email.toLowerCase(),
      exerciseId: exercise.id,
      ipHash: hashIp(ip),
      status: "RECORDING",
    },
  });

  const res = NextResponse.json({
    guestSessionId: guestRequest.id,
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
  res.cookies.set(GUEST_SESSION_COOKIE, guestRequest.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GUEST_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
