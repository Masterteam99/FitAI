import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: { id: true, slug: true, isActive: true },
  });
  if (!exercise) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  const newActive = !exercise.isActive;
  await prisma.exercise.update({ where: { id }, data: { isActive: newActive } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "TOGGLE_EXERCISE_ACTIVE",
    targetType: "exercise",
    targetId: id,
    payload: { slug: exercise.slug, from: exercise.isActive, to: newActive },
  });

  return NextResponse.json({ ok: true, isActive: newActive });
}
