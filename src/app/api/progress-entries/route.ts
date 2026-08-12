import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const entries = await prisma.userProgress.findMany({
    where: { userId: session.user.id as string },
    orderBy: { date: "asc" },
    take: 60,
    select: { id: true, date: true, weightKg: true, measurementWaistCm: true, notes: true },
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date.toISOString(),
      weightKg: e.weightKg,
      waistCm: e.measurementWaistCm,
      notes: e.notes,
    })),
  });
}

const Schema = z.object({
  weightKg: z.number().min(20).max(400).nullable().optional(),
  waistCm: z.number().min(30).max(300).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;
  if (d.weightKg == null && d.waistCm == null) {
    return NextResponse.json({ error: "Inserisci almeno un valore" }, { status: 400 });
  }

  const created = await prisma.userProgress.create({
    data: {
      userId: session.user.id as string,
      weightKg: d.weightKg ?? null,
      measurementWaistCm: d.waistCm ?? null,
      notes: d.notes ?? null,
    },
    select: { id: true, date: true, weightKg: true, measurementWaistCm: true },
  });

  return NextResponse.json(
    { id: created.id, date: created.date.toISOString(), weightKg: created.weightKg, waistCm: created.measurementWaistCm },
    { status: 201 },
  );
}
