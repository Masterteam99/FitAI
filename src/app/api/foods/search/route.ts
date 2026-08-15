import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Ricerca alimenti per il diario nutrizionale: usata dall'autocomplete del
// form "nuovo alimento" (grammatura + ricerca invece di calorie/macro a mano).
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  const items = await prisma.food.findMany({
    where: { nameNormalized: { contains: q } },
    orderBy: { name: "asc" },
    take: 15,
    select: {
      id: true,
      name: true,
      category: true,
      caloriesPer100g: true,
      proteinPer100g: true,
      carbsPer100g: true,
      fatPer100g: true,
      fiberPer100g: true,
    },
  });

  return NextResponse.json({ items });
}
