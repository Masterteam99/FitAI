import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pubblica (nessun auth): elenco degli esercizi che un manager ha reso
// disponibili per la prova gratuita ospiti (Exercise.availableForFreeTrial).
export async function GET() {
  const exercises = await prisma.exercise.findMany({
    where: { availableForFreeTrial: true, isActive: true },
    select: { id: true, name: true, slug: true, muscleGroupPrimary: true, thumbnailUrl: true, videoUrl: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ exercises });
}
