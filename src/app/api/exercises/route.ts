import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const muscolo = searchParams.get("muscolo");
  const difficolta = searchParams.get("difficolta");
  const cerca = searchParams.get("cerca");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const exercises = await prisma.exercise.findMany({
    where: {
      isActive: true,
      ...(muscolo && { muscleGroupPrimary: muscolo as never }),
      ...(difficolta && { difficulty: difficolta as never }),
      ...(cerca && { name: { contains: cerca, mode: "insensitive" } }),
    },
    include: {
      biomechanicalSpec: {
        include: { movements: { include: { phases: { include: { triggers: true } } } } },
      },
    },
    orderBy: { name: "asc" },
    take: limit,
  });

  return NextResponse.json(exercises);
}
