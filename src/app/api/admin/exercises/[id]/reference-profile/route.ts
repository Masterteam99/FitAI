import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";
import { REFERENCE_PROFILE_VERSION } from "@/services/analysis/referenceProfile";
import { z } from "zod";

const movementSchema = z.object({
  joint: z.string(),
  phase: z.string(),
  minAngle: z.number(),
  maxAngle: z.number(),
  meanAngle: z.number(),
  sampleCount: z.number(),
});
const schema = z.object({
  movements: z.array(movementSchema),
  meta: z.object({ fps: z.number(), totalFrames: z.number(), detectedReps: z.number() }),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Profilo non valido" }, { status: 400 });
  if (parsed.data.movements.length === 0) {
    return NextResponse.json({ error: "Nessun movimento rilevato dal video PT" }, { status: 422 });
  }

  const exercise = await prisma.exercise.findUnique({ where: { id }, select: { id: true } });
  if (!exercise) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  await prisma.exercise.update({
    where: { id },
    data: {
      referenceProfile: parsed.data as object,
      referenceProfileAt: new Date(),
      referenceProfileVersion: REFERENCE_PROFILE_VERSION,
    },
  });

  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "UPLOAD_PT_VIDEO",
    targetType: "Exercise",
    targetId: id,
    payload: { movements: parsed.data.movements.length, detectedReps: parsed.data.meta.detectedReps },
  });

  return NextResponse.json({ ok: true, movements: parsed.data.movements.length });
}
