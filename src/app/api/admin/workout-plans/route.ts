import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { WorkoutTemplateSchema, buildTemplateData } from "@/lib/admin/workout-template-schema";

async function guard() {
  try {
    await requireAdmin();
    return null;
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;

  const items = await prisma.workoutPlanTemplate.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, description: true, difficulty: true, targetGoals: true,
      requiredEquipment: true, durationWeeks: true, workoutsPerWeek: true, createdAt: true,
    },
  });

  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      difficulty: p.difficulty,
      targetGoals: p.targetGoals,
      requiredEquipment: p.requiredEquipment,
      durationWeeks: p.durationWeeks,
      workoutsPerWeek: p.workoutsPerWeek,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = WorkoutTemplateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const created = await prisma.workoutPlanTemplate.create({
    data: buildTemplateData(parsed.data),
    select: { id: true },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  await prisma.workoutPlanTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
