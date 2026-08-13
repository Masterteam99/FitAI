import { z } from "zod";

// Schema condiviso per creazione (POST) e modifica (PUT) dei piani del pool nutrizionale.
export const NutritionPlanSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(2000),
  dietType: z.string().min(2).max(40),
  targetGoal: z.enum(["LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE"]),
  rationale: z.string().min(2).max(2000),
  weeklyPlanText: z.string().min(2).max(8000),
  calories: z.number().int().min(0).max(10000).nullable().optional(),
  protein: z.number().int().min(0).max(1000).nullable().optional(),
  carbs: z.number().int().min(0).max(1000).nullable().optional(),
  fat: z.number().int().min(0).max(1000).nullable().optional(),
});

export type NutritionPlanInput = z.infer<typeof NutritionPlanSchema>;

// Costruisce i JSON persistiti dal payload validato.
export function buildPlanData(d: NutritionPlanInput) {
  return {
    name: d.name,
    description: d.description,
    dietType: d.dietType,
    targetGoal: d.targetGoal,
    targetMacrosJson: { calories: d.calories ?? null, protein: d.protein ?? null, carbs: d.carbs ?? null, fat: d.fat ?? null },
    weeklyPlanJson: { text: d.weeklyPlanText },
    rationale: d.rationale,
  };
}
