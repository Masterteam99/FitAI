import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

  const items = await prisma.nutritionPlanTemplate.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, description: true, dietType: true, targetGoal: true, createdAt: true },
  });

  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      dietType: p.dietType,
      targetGoal: p.targetGoal,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

const CreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(2000),
  dietType: z.string().min(2).max(40),
  targetGoal: z.enum(["LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE"]),
  rationale: z.string().min(2).max(2000),
  weeklyPlanText: z.string().min(2).max(8000),
  calories: z.number().int().min(0).max(10000).nullable().optional(),
  protein: z.number().int().min(0).max(1000).nullable().optional(),
  carbs: z.number().int().min(0).max(1000).nullable().optional(),
  fat: z.number().int().min(0).max(1000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;

  const created = await prisma.nutritionPlanTemplate.create({
    data: {
      name: d.name,
      description: d.description,
      dietType: d.dietType,
      targetGoal: d.targetGoal,
      estimatedProfileJson: {},
      targetMacrosJson: { calories: d.calories ?? null, protein: d.protein ?? null, carbs: d.carbs ?? null, fat: d.fat ?? null },
      weeklyPlanJson: { text: d.weeklyPlanText },
      rationale: d.rationale,
    },
    select: { id: true },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  await prisma.nutritionPlanTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
