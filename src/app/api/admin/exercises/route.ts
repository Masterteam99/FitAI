import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MuscleGroup = z.enum(["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES", "FULL_BODY"]);
const Equipment = z.enum(["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"]);
const Category = z.enum(["STRENGTH", "CARDIO", "FLEXIBILITY", "BALANCE", "PLYOMETRIC", "FUNCTIONAL"]);
const Difficulty = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

const Trigger = z.object({
  condition: z.enum(["BELOW_MIN", "ABOVE_MAX", "OUT_OF_RANGE"]),
  severity: z.enum(["WARNING", "ERROR", "CRITICAL"]),
  feedback: z.string().min(1),
  injuryRisk: z.boolean().optional().default(false),
});
const Phase = z.object({
  phase: z.enum(["CONCENTRIC", "ECCENTRIC", "ISOMETRIC", "TOP", "BOTTOM", "THROUGHOUT"]),
  minAngle: z.number(),
  maxAngle: z.number(),
  triggers: z.array(Trigger).default([]),
});
const Movement = z.object({
  joint: z.string().min(1),
  movementType: z.string().min(1),
  phases: z.array(Phase).default([]),
});
const Spec = z.object({ movements: z.array(Movement).default([]) });

const Schema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(2).max(4000),
  instructions: z.array(z.string().min(1)).default([]),
  muscleGroupPrimary: MuscleGroup,
  muscleGroupsSecondary: z.array(MuscleGroup).default([]),
  difficulty: Difficulty,
  equipment: z.array(Equipment).default(["NONE"]),
  category: Category,
  videoUrl: z.string().url().nullable().optional(),
  explanationVideoUrl: z.string().url().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  durationSeconds: z.number().int().min(0).max(3600).nullable().optional(),
  recordingDurationSeconds: z.number().int().min(5).max(60).default(20),
  caloriesPerMinute: z.number().min(0).max(50).default(5),
  professionalNotes: z.string().max(4000).nullable().optional(),
  tags: z.array(z.string().max(60)).default([]),
  biomechanicalSpec: Spec.nullable().optional(),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;
  const slug = d.slug ?? slugify(d.name);

  const spec = d.biomechanicalSpec;
  const specCreate = spec && spec.movements.length
    ? {
        biomechanicalSpec: {
          create: {
            movements: {
              create: spec.movements.map((m) => ({
                joint: m.joint,
                movementType: m.movementType,
                phases: {
                  create: m.phases.map((p) => ({
                    phase: p.phase,
                    minAngle: p.minAngle,
                    maxAngle: p.maxAngle,
                    triggers: { create: p.triggers.map((t) => ({ condition: t.condition, severity: t.severity, feedback: t.feedback, injuryRisk: t.injuryRisk })) },
                  })),
                },
              })),
            },
          },
        },
      }
    : {};

  try {
    const created = await prisma.exercise.create({
      data: {
        name: d.name,
        slug,
        description: d.description,
        instructions: d.instructions,
        muscleGroupPrimary: d.muscleGroupPrimary,
        muscleGroupsSecondary: d.muscleGroupsSecondary,
        difficulty: d.difficulty,
        equipment: d.equipment,
        category: d.category,
        videoUrl: d.videoUrl ?? null,
        explanationVideoUrl: d.explanationVideoUrl ?? null,
        thumbnailUrl: d.thumbnailUrl ?? null,
        durationSeconds: d.durationSeconds ?? null,
        recordingDurationSeconds: d.recordingDurationSeconds,
        caloriesPerMinute: d.caloriesPerMinute,
        professionalNotes: d.professionalNotes ?? null,
        tags: d.tags,
        ...specCreate,
      },
      select: { id: true, slug: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug già esistente" }, { status: 409 });
    }
    throw e;
  }
}
