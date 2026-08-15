import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { FoodSchema, buildFoodData } from "@/lib/admin/food-schema";

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

  const items = await prisma.food.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    items: items.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      caloriesPer100g: f.caloriesPer100g,
      proteinPer100g: f.proteinPer100g,
      carbsPer100g: f.carbsPer100g,
      fatPer100g: f.fatPer100g,
      fiberPer100g: f.fiberPer100g,
      source: f.source,
    })),
  });
}

export async function POST(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = FoodSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const nameNormalized = parsed.data.name.trim().toLowerCase();
  const existing = await prisma.food.findUnique({ where: { nameNormalized }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "Esiste già un alimento con questo nome" }, { status: 409 });

  const created = await prisma.food.create({ data: buildFoodData(parsed.data), select: { id: true } });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  await prisma.food.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
