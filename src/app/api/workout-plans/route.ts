import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const FitnessGoalEnum = z.enum([
  "LOSE_WEIGHT",
  "BUILD_MUSCLE",
  "ENDURANCE",
  "FLEXIBILITY",
  "GENERAL_FITNESS",
  "ATHLETIC_PERFORMANCE",
]);

const CreatePlanSchema = z.object({
  name: z.string().min(1).max(100),
  durationWeeks: z.number().int().min(1).max(52),
  workoutsPerWeek: z.number().int().min(1).max(7),
  primaryGoal: FitnessGoalEnum,
  generatedByAI: z.boolean().optional().default(false),
  days: z.array(z.object({
    dayNumber: z.number().int().min(1).max(7),
    name: z.string(),
    restDay: z.boolean().optional().default(false),
    exercises: z.array(z.object({
      exerciseId: z.string(),
      orderIndex: z.number().int(),
      sets: z.number().int().min(1).max(20),
      reps: z.number().int().min(1).max(100).optional(),
      durationSeconds: z.number().int().optional().nullable(),
      restSeconds: z.number().int().optional().default(60),
      notes: z.string().optional(),
    })),
  })),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await prisma.workoutPlan.findMany({
    where: { userId: session.user.id as string },
    include: {
      days: {
        include: {
          exercises: { include: { exercise: { select: { id: true, name: true, slug: true, muscleGroupPrimary: true, difficulty: true } } }, orderBy: { orderIndex: "asc" } },
        },
        orderBy: { dayNumber: "asc" },
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreatePlanSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { days, ...planData } = parsed.data;
  const userId = session.user.id as string;

  // Deactivate other plans if this is set active
  if (body.setActive) {
    await prisma.workoutPlan.updateMany({ where: { userId }, data: { isActive: false } });
  }

  const plan = await prisma.workoutPlan.create({
    data: {
      ...planData,
      userId,
      isActive: !!body.setActive,
      days: {
        create: days.map((day) => ({
          dayNumber: day.dayNumber,
          name: day.name,
          restDay: day.restDay,
          exercises: {
            create: day.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              orderIndex: ex.orderIndex,
              sets: ex.sets,
              reps: ex.reps,
              durationSeconds: ex.durationSeconds ?? null,
              restSeconds: ex.restSeconds ?? 60,
              notes: ex.notes,
            })),
          },
        })),
      },
    },
    include: {
      days: {
        include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: "asc" } } },
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
