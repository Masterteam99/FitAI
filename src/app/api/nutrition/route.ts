import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const LogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  foodName: z.string().min(1).max(200),
  foodId: z.string().optional(),
  calories: z.number().min(0).max(9999),
  proteinG: z.number().min(0).max(999).optional().default(0),
  carbsG: z.number().min(0).max(999).optional().default(0),
  fatG: z.number().min(0).max(999).optional().default(0),
  fiberG: z.number().min(0).max(200).optional().default(0),
  quantity: z.number().min(0).default(1),
  unit: z.string().default("g"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const logs = await prisma.nutritionLog.findMany({
    where: { userId: session.user.id as string, date: new Date(date) },
    orderBy: { date: "asc" },
  });

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.proteinG,
      carbs: acc.carbs + l.carbsG,
      fat: acc.fat + l.fatG,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return NextResponse.json({ logs, totals, date });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = LogSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const log = await prisma.nutritionLog.create({
    data: { ...parsed.data, date: new Date(parsed.data.date), userId: session.user.id as string },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID richiesto" }, { status: 400 });

  await prisma.nutritionLog.deleteMany({ where: { id, userId: session.user.id as string } });
  return NextResponse.json({ success: true });
}
