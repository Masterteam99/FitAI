import { z } from "zod";

// Schema condiviso per creazione (POST) e modifica (PUT) dei template di piani fitness.
const FitnessLevel = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"]);
const FitnessGoal = z.enum(["LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE"]);
const Equipment = z.enum(["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"]);

export const WorkoutTemplateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(4000),
  difficulty: FitnessLevel,
  targetGoals: z.array(FitnessGoal).min(1),
  requiredEquipment: z.array(Equipment).default(["NONE"]),
  durationWeeks: z.number().int().min(1).max(52),
  workoutsPerWeek: z.number().int().min(1).max(7),
  rationale: z.string().min(2).max(4000),
  // Struttura dei giorni/allenamenti: JSON libero (array o oggetto).
  daysJson: z.unknown().optional(),
});

export type WorkoutTemplateInput = z.infer<typeof WorkoutTemplateSchema>;

export function buildTemplateData(d: WorkoutTemplateInput) {
  const days = d.daysJson;
  const daysJson = days == null ? [] : days;
  return {
    name: d.name,
    description: d.description,
    difficulty: d.difficulty,
    targetGoals: d.targetGoals,
    requiredEquipment: d.requiredEquipment,
    durationWeeks: d.durationWeeks,
    workoutsPerWeek: d.workoutsPerWeek,
    rationale: d.rationale,
    daysJson: daysJson as object,
  };
}
