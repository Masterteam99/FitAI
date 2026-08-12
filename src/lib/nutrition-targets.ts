// Target nutrizionali personalizzati (Mifflin-St Jeor, gender-neutral) con fallback.
export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_TARGETS: NutritionTargets = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export function computeNutritionTargets(input: {
  weightKg?: number | null;
  heightCm?: number | null;
  age?: number | null;
  goal?: string | null;
}): NutritionTargets {
  const { weightKg, heightCm, age, goal } = input;
  if (!weightKg || !heightCm || !age) return DEFAULT_TARGETS;

  // BMR (Mifflin-St Jeor), media tra formula maschile (+5) e femminile (-161) → -78.
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  let tdee = bmr * 1.5; // attività moderata (default)
  if (goal === "LOSE_WEIGHT") tdee *= 0.85;
  else if (goal === "BUILD_MUSCLE") tdee *= 1.1;

  const calories = Math.max(1200, Math.round(tdee / 10) * 10);
  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}
