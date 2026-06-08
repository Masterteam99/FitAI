import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// "Salta per il momento": sblocca l'app senza generare un piano. Salviamo i dati
// parziali eventualmente già inseriti e marchiamo onboardingCompleted=true. I campi
// del profilo sono nullable/con default, quindi un profilo minimo è valido e il
// resto dell'app funziona senza branching speciali (dashboard vuota ma navigabile).
const schema = z.object({
  primaryGoal: z.enum([
    "LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE",
  ]).optional(),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"]).optional(),
  availableEquipment: z.array(
    z.enum(["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"]),
  ).min(1).optional(),
  age: z.number().int().min(12).max(100).optional(),
  weightKg: z.number().min(30).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  gender: z.string().min(1).max(8).optional(),
  weeklyWorkoutDays: z.number().int().min(1).max(7).optional(),
  dietType: z.string().optional(),
  pastInjuries: z.array(z.string()).optional(),
  pastSports: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body ?? {});
  // I dati parziali sono best-effort: se non validano, saltiamo comunque salvando solo il flag.
  const data = parsed.success ? parsed.data : {};

  await prisma.user.update({
    where: { id: userId },
    data: { ...data, onboardingCompleted: true },
  });

  return NextResponse.json({ ok: true });
}
