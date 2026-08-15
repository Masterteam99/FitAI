import { z } from "zod";

export const FOOD_CATEGORIES = [
  "cereali",
  "carne",
  "pesce",
  "uova_latticini",
  "legumi",
  "verdura",
  "frutta",
  "grassi_oli",
  "dolci_snack",
  "bevande",
] as const;

// Schema condiviso per creazione (POST) e modifica (PUT) di un alimento del pool.
// Valori sempre per 100g, coerenti col resto del pool (vedi seed-foods-data.ts).
export const FoodSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(FOOD_CATEGORIES),
  caloriesPer100g: z.number().min(0).max(1000),
  proteinPer100g: z.number().min(0).max(100),
  carbsPer100g: z.number().min(0).max(100),
  fatPer100g: z.number().min(0).max(100),
  fiberPer100g: z.number().min(0).max(100).optional().default(0),
});

export type FoodInput = z.infer<typeof FoodSchema>;

export function buildFoodData(d: FoodInput) {
  return {
    name: d.name.trim(),
    nameNormalized: d.name.trim().toLowerCase(),
    category: d.category,
    caloriesPer100g: d.caloriesPer100g,
    proteinPer100g: d.proteinPer100g,
    carbsPer100g: d.carbsPer100g,
    fatPer100g: d.fatPer100g,
    fiberPer100g: d.fiberPer100g ?? 0,
    source: "admin",
  };
}
