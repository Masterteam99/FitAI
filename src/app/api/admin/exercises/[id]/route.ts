import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ExerciseSchema, buildSpecData } from "@/lib/admin/exercise-schema";

// GET: dati completi di un esercizio (per precompilare il form di modifica),
// inclusa la spec biomeccanica nel formato { movements: [...] }.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const ex = await prisma.exercise.findUnique({
    where: { id },
    include: {
      biomechanicalSpec: {
        include: { movements: { include: { phases: { include: { triggers: true } } } } },
      },
    },
  });
  if (!ex) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  const spec = ex.biomechanicalSpec
    ? {
        movements: ex.biomechanicalSpec.movements.map((m) => ({
          joint: m.joint,
          movementType: m.movementType,
          phases: m.phases.map((p) => ({
            phase: p.phase,
            minAngle: p.minAngle,
            maxAngle: p.maxAngle,
            triggers: p.triggers.map((t) => ({ condition: t.condition, severity: t.severity, feedback: t.feedback, injuryRisk: t.injuryRisk })),
          })),
        })),
      }
    : null;

  return NextResponse.json({
    exercise: {
      id: ex.id,
      name: ex.name,
      slug: ex.slug,
      description: ex.description,
      instructions: ex.instructions,
      muscleGroupPrimary: ex.muscleGroupPrimary,
      muscleGroupsSecondary: ex.muscleGroupsSecondary,
      difficulty: ex.difficulty,
      equipment: ex.equipment,
      category: ex.category,
      videoUrl: ex.videoUrl,
      explanationVideoUrl: ex.explanationVideoUrl,
      thumbnailUrl: ex.thumbnailUrl,
      durationSeconds: ex.durationSeconds,
      recordingDurationSeconds: ex.recordingDurationSeconds,
      caloriesPerMinute: ex.caloriesPerMinute,
      professionalNotes: ex.professionalNotes,
      tags: ex.tags,
      isActive: ex.isActive,
      biomechanicalSpec: spec,
    },
  });
}

// PUT: aggiorna tutti i campi e RIMPIAZZA la spec biomeccanica (delete + recreate).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const existing = await prisma.exercise.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!existing) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  const parsed = ExerciseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;
  // In modifica manteniamo lo slug esistente se non fornito (non cambia gli URL).
  const slug = d.slug ?? existing.slug;

  const specData = buildSpecData(d.biomechanicalSpec);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.exercise.update({
        where: { id },
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
        },
      });
      // Rimpiazza la spec: elimina quella esistente (cascade su movements/phases/triggers) e ricrea.
      await tx.exerciseBiomechanicalSpec.deleteMany({ where: { exerciseId: id } });
      if (specData) {
        await tx.exerciseBiomechanicalSpec.create({
          data: { exerciseId: id, ...specData },
        });
      }
    });
    return NextResponse.json({ id, slug });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug già esistente" }, { status: 409 });
    }
    throw e;
  }
}
