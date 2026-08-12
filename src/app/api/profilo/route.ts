import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      name: true,
      email: true,
      fitnessLevel: true,
      primaryGoal: true,
      age: true,
      weightKg: true,
      heightCm: true,
      profileVisibility: true,
      medicalNotes: true,
      totalPoints: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

const PatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(10).max(99).nullable().optional(),
  weightKg: z.number().min(30).max(300).nullable().optional(),
  heightCm: z.number().min(100).max(250).nullable().optional(),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"]).optional(),
  primaryGoal: z.enum(["LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE"]).optional(),
  profileVisibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  medicalNotes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.user.id as string },
    data: parsed.data,
    select: { name: true, age: true, weightKg: true, heightCm: true },
  });

  return NextResponse.json(updated);
}
