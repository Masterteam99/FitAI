import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  primaryGoal: z.enum([
    "LOSE_WEIGHT",
    "BUILD_MUSCLE",
    "ENDURANCE",
    "FLEXIBILITY",
    "GENERAL_FITNESS",
    "ATHLETIC_PERFORMANCE",
  ]),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"]),
  availableEquipment: z.array(
    z.enum([
      "NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS",
      "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM",
    ]),
  ).min(1),
  age: z.number().int().min(12).max(100),
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  gender: z.string().min(1).max(8),
  weeklyWorkoutDays: z.number().int().min(1).max(7),
  dietType: z.string().optional(),
  pastInjuries: z.array(z.string()).optional(),
  pastSports: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { ...parsed.data, onboardingCompleted: true },
  });

  return NextResponse.json({ ok: true });
}
