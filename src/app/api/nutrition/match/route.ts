import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { primaryGoal: true, dietType: true },
  });
  if (!user) return NextResponse.json({ match: null });

  // Priorità: obiettivo + dieta → obiettivo → qualsiasi.
  const byGoalDiet = user.dietType
    ? await prisma.nutritionPlanTemplate.findFirst({ where: { targetGoal: user.primaryGoal, dietType: user.dietType }, orderBy: { createdAt: "desc" } })
    : null;
  const match =
    byGoalDiet ??
    (await prisma.nutritionPlanTemplate.findFirst({ where: { targetGoal: user.primaryGoal }, orderBy: { createdAt: "desc" } })) ??
    (await prisma.nutritionPlanTemplate.findFirst({ orderBy: { createdAt: "desc" } }));

  if (!match) return NextResponse.json({ match: null });

  const macros = (match.targetMacrosJson as { calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null } | null) ?? {};
  const weekly = (match.weeklyPlanJson as { text?: string } | null) ?? {};

  return NextResponse.json({
    match: {
      id: match.id,
      name: match.name,
      description: match.description,
      dietType: match.dietType,
      rationale: match.rationale,
      macros,
      weeklyText: weekly.text ?? "",
    },
  });
}
