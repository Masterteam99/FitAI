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

// GET: dati completi di un piano del pool (per precompilare il form di modifica).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const p = await prisma.nutritionPlanTemplate.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ error: "Piano non trovato" }, { status: 404 });

  // Tollerante a due forme di macro: quella del form admin ({calories,protein,carbs,fat})
  // e quella dei piani seedati ({kcal,proteinG,carbsG,fatG}).
  const m = (p.targetMacrosJson as Record<string, unknown> | null) ?? {};
  const numOrNull = (v: unknown) => (typeof v === "number" ? v : null);
  const calories = numOrNull(m.calories) ?? numOrNull(m.kcal);
  const protein = numOrNull(m.protein) ?? numOrNull(m.proteinG);
  const carbs = numOrNull(m.carbs) ?? numOrNull(m.carbsG);
  const fat = numOrNull(m.fat) ?? numOrNull(m.fatG);

  // Piano settimanale: se è già testo lo usiamo, altrimenti serializziamo la
  // struttura (piani seedati) in JSON leggibile così è comunque modificabile.
  const w = p.weeklyPlanJson as Record<string, unknown> | null;
  let weeklyPlanText = "";
  if (w && typeof w === "object") {
    weeklyPlanText = typeof w.text === "string" ? w.text : JSON.stringify(w, null, 2);
  }

  return NextResponse.json({
    plan: {
      id: p.id,
      name: p.name,
      description: p.description,
      dietType: p.dietType,
      targetGoal: p.targetGoal,
      rationale: p.rationale,
      weeklyPlanText,
      calories,
      protein,
      carbs,
      fat,
    },
  });
}

// PUT: aggiorna un piano del pool.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { id } = await params;

  const existing = await prisma.nutritionPlanTemplate.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Piano non trovato" }, { status: 404 });

  const parsed = NutritionPlanSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  await prisma.nutritionPlanTemplate.update({
    where: { id },
    data: buildPlanData(parsed.data),
  });

  return NextResponse.json({ id });
}
