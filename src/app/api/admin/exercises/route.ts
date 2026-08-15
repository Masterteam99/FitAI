import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ExerciseSchema, slugify, buildSpecData } from "@/lib/admin/exercise-schema";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const parsed = ExerciseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;
  const slug = d.slug ?? slugify(d.name);

  const specData = buildSpecData(d.biomechanicalSpec);

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
        ...(specData ? { biomechanicalSpec: { create: specData } } : {}),
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
