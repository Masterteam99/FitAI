import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NutritionPlanSchema, buildPlanData } from "@/lib/admin/nutrition-plan-schema";

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

export async function POST(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = NutritionPlanSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const created = await prisma.nutritionPlanTemplate.create({
    data: { ...buildPlanData(parsed.data), estimatedProfileJson: {} },
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
