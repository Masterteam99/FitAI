import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Ricette curate mostrate all'utente: quelle attive adatte alla sua dieta
// (o senza dieta specifica = adatte a tutte). Se vuoto, la UI usa l'AI come fallback.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { dietType: true },
  });
  const diet = user?.dietType ?? null;

  const items = await prisma.recipe.findMany({
    where: {
      isActive: true,
      OR: [{ dietType: null }, ...(diet ? [{ dietType: diet }] : [])],
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, title: true, description: true, imageUrl: true, mealType: true, dietType: true,
      calories: true, proteinG: true, carbsG: true, fatG: true, ingredients: true, steps: true, tags: true,
    },
  });

  return NextResponse.json({ recipes: items });
}
