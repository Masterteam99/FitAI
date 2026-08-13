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

// GET: dati completi di una ricetta (per precompilare il form di modifica).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const r = await prisma.recipe.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ error: "Ricetta non trovata" }, { status: 404 });

  return NextResponse.json({
    recipe: {
      id: r.id,
      title: r.title,
      description: r.description,
      mealType: r.mealType,
      dietType: r.dietType,
      calories: r.calories,
      proteinG: r.proteinG,
      carbsG: r.carbsG,
      fatG: r.fatG,
      ingredients: r.ingredients,
      steps: r.steps,
      tags: r.tags,
      isActive: r.isActive,
    },
  });
}

// PUT: aggiorna una ricetta.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const existing = await prisma.recipe.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Ricetta non trovata" }, { status: 404 });

  const parsed = RecipeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  await prisma.recipe.update({ where: { id }, data: buildRecipeData(parsed.data) });
  return NextResponse.json({ id });
}
