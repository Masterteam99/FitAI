import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { RecipeSchema, buildRecipeData } from "@/lib/admin/recipe-schema";

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

  const items = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, imageUrl: true, mealType: true, dietType: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      mealType: r.mealType,
      dietType: r.dietType,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = RecipeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const created = await prisma.recipe.create({ data: buildRecipeData(parsed.data), select: { id: true } });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
