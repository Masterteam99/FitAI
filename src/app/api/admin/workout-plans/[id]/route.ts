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

// GET: dati completi di un template (per precompilare il form di modifica).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const p = await prisma.workoutPlanTemplate.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ error: "Template non trovato" }, { status: 404 });

  return NextResponse.json({
    template: {
      id: p.id,
      name: p.name,
      description: p.description,
      difficulty: p.difficulty,
      targetGoals: p.targetGoals,
      requiredEquipment: p.requiredEquipment,
      durationWeeks: p.durationWeeks,
      workoutsPerWeek: p.workoutsPerWeek,
      rationale: p.rationale,
      daysJson: p.daysJson,
    },
  });
}

// PUT: aggiorna un template.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const existing = await prisma.workoutPlanTemplate.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Template non trovato" }, { status: 404 });

  const parsed = WorkoutTemplateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  await prisma.workoutPlanTemplate.update({
    where: { id },
    data: buildTemplateData(parsed.data),
  });

  return NextResponse.json({ id });
}
