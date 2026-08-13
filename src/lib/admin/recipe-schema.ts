import { z } from "zod";

// Schema condiviso per creazione (POST) e modifica (PUT) delle ricette curate.
const MealType = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);

export const RecipeSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(2).max(2000),
  mealType: MealType.nullable().optional(),
  dietType: z.string().max(40).nullable().optional(), // null = adatta a tutte
  calories: z.number().int().min(0).max(5000).nullable().optional(),
  proteinG: z.number().int().min(0).max(500).nullable().optional(),
  carbsG: z.number().int().min(0).max(500).nullable().optional(),
  fatG: z.number().int().min(0).max(500).nullable().optional(),
  ingredients: z.array(z.string().min(1)).default([]),
  steps: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().max(60)).default([]),
  isActive: z.boolean().default(true),
});

export type RecipeInput = z.infer<typeof RecipeSchema>;

export function buildRecipeData(d: RecipeInput) {
  return {
    title: d.title,
    description: d.description,
    mealType: d.mealType ?? null,
    dietType: d.dietType && d.dietType.trim() ? d.dietType.trim() : null,
    calories: d.calories ?? null,
    proteinG: d.proteinG ?? null,
    carbsG: d.carbsG ?? null,
    fatG: d.fatG ?? null,
    ingredients: d.ingredients,
    steps: d.steps,
    tags: d.tags,
    isActive: d.isActive,
  };
}
