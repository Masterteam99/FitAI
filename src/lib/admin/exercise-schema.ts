import { z } from "zod";

// Schema di validazione condiviso per creazione (POST) e modifica (PUT) esercizi.
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
export const SpecSchema = z.object({ movements: z.array(Movement).default([]) });

export const ExerciseSchema = z.object({
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
  biomechanicalSpec: SpecSchema.nullable().optional(),
});

export type ExerciseInput = z.infer<typeof ExerciseSchema>;
export type SpecInput = z.infer<typeof SpecSchema>;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Costruisce il `data` interno della spec biomeccanica per Prisma
// (movimenti → fasi → trigger). Ritorna null se non ci sono movimenti.
// Uso: POST → `biomechanicalSpec: { create: buildSpecData(...) }`;
//      PUT → `exerciseBiomechanicalSpec.create({ data: { exerciseId, ...buildSpecData(...) } })`.
export function buildSpecData(spec: SpecInput | null | undefined) {
  if (!spec || !spec.movements.length) return null;
  return {
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
  };
}
