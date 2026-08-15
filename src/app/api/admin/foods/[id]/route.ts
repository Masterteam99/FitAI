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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const existing = await prisma.food.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Alimento non trovato" }, { status: 404 });

  const parsed = FoodSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const nameNormalized = parsed.data.name.trim().toLowerCase();
  const clash = await prisma.food.findUnique({ where: { nameNormalized }, select: { id: true } });
  if (clash && clash.id !== id) return NextResponse.json({ error: "Esiste già un alimento con questo nome" }, { status: 409 });

  await prisma.food.update({ where: { id }, data: buildFoodData(parsed.data) });
  return NextResponse.json({ id });
}
