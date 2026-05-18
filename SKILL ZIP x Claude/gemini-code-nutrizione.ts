// File: prisma/seed-nutrition-templates.ts

export type DietType = "onnivora" | "vegetariana" | "vegana" | "chetogenica" | "mediterranea" | "altro";
export type FitnessGoal = "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE" | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";
export type DayName = "lunedi" | "martedi" | "mercoledi" | "giovedi" | "venerdi" | "sabato" | "domenica";

export interface NutritionTemplateData {
  name: string;
  description: string;
  dietType: DietType;
  targetGoal: FitnessGoal;
  estimatedTargetProfile: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: "M" | "F";
    activityLevel: "sedentario" | "leggero" | "moderato" | "intenso";
  };
  targetMacros: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  weeklyPlan: Record<DayName, any>;
  rationale: string;
}

export const NUTRITION_TEMPLATES: NutritionTemplateData[] = [
  {
    name: "Mediterraneo Mantenimento 2200 kcal",
    description: "Piano mediterraneo bilanciato per uomo medio. Focus su grassi sani, cereali integrali e proteine magre.",
    dietType: "mediterranea",
    targetGoal: "GENERAL_FITNESS",
    estimatedTargetProfile: { weightKg: 75, heightCm: 175, age: 30, gender: "M", activityLevel: "leggero" },
    targetMacros: { kcal: 2200, proteinG: 130, carbsG: 250, fatG: 80 },
    rationale: "TDEE calcolato per mantenimento. Proteine a 1.7g/kg. Focus su olio EVO e omega-3 dal pesce.",
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Yogurt e Avena",
          ingredients: [
            { food: "yogurt greco bianco 0%", quantityG: 200 },
            { food: "avena in fiocchi", quantityG: 50 },
            { food: "mirtilli", quantityG: 80 }
          ],
          estimatedKcal: 400, estimatedProteinG: 25, estimatedCarbsG: 55, estimatedFatG: 6
        },
        lunch: {
          name: "Pasta Integrale al Tonno",
          ingredients: [
            { food: "pasta integrale", quantityG: 100 },
            { food: "tonno al naturale", quantityG: 112 },
            { food: "olio extravergine d'oliva", quantityG: 15 }
          ],
          estimatedKcal: 650, estimatedProteinG: 35, estimatedCarbsG: 75, estimatedFatG: 20
        },
        dinner: {
          name: "Salmone e Patate",
          ingredients: [
            { food: "filetto di salmone", quantityG: 150 },
            { food: "patate lesse", quantityG: 250 },
            { food: "zucchine grigliate", quantityG: 200 }
          ],
          estimatedKcal: 700, estimatedProteinG: 40, estimatedCarbsG: 50, estimatedFatG: 30
        },
        snacks: [
          { name: "Mandorle", ingredients: [{ food: "mandorle", quantityG: 30 }], estimatedKcal: 180, estimatedProteinG: 6, estimatedCarbsG: 6, estimatedFatG: 15 }
        ]
      },
      martedi: { /* simile a lunedi */ },
      mercoledi: { /* ... */ },
      giovedi: { /* ... */ },
      venerdi: { /* ... */ },
      sabato: { /* ... */ },
      domenica: { /* ... */ }
    }
  },
  {
    name: "Vegano Massa 2800 kcal",
    description: "Piano ipercalorico vegetale per la costruzione muscolare. Alta densità di nutrienti e legumi.",
    dietType: "vegana",
    targetGoal: "BUILD_MUSCLE",
    estimatedTargetProfile: { weightKg: 78, heightCm: 180, age: 28, gender: "M", activityLevel: "moderato" },
    targetMacros: { kcal: 2800, proteinG: 150, carbsG: 380, fatG: 75 },
    rationale: "Surplus calorico del 10%. Proteine vegetali da fonti complete (legumi + cereali) per ottimizzare la sintesi proteica.",
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Porridge proteico",
          ingredients: [
            { food: "latte di soia", quantityG: 300 },
            { food: "avena in fiocchi", quantityG: 80 },
            { food: "burro d'arachidi", quantityG: 20 }
          ],
          estimatedKcal: 550, estimatedProteinG: 25, estimatedCarbsG: 65, estimatedFatG: 20
        },
        lunch: {
          name: "Quinoa e Ceci",
          ingredients: [
            { food: "quinoa", quantityG: 120 },
            { food: "ceci cotti", quantityG: 200 },
            { food: "broccoli", quantityG: 150 }
          ],
          estimatedKcal: 850, estimatedProteinG: 35, estimatedCarbsG: 120, estimatedFatG: 15
        },
        dinner: {
          name: "Tofu e Riso Basmati",
          ingredients: [
            { food: "tofu alla piastra", quantityG: 200 },
            { food: "riso basmati", quantityG: 100 },
            { food: "mix verdure saltate", quantityG: 200 }
          ],
          estimatedKcal: 750, estimatedProteinG: 40, estimatedCarbsG: 80, estimatedFatG: 25
        },
        snacks: [
          { name: "Frullato proteico vegano", ingredients: [{ food: "proteine isolate pisello", quantityG: 30 }, { food: "banana", quantityG: 120 }], estimatedKcal: 300, estimatedProteinG: 25, estimatedCarbsG: 35, estimatedFatG: 2 }
        ]
      },
      martedi: { /* ... */ },
      mercoledi: { /* ... */ },
      giovedi: { /* ... */ },
      venerdi: { /* ... */ },
      sabato: { /* ... */ },
      domenica: { /* ... */ }
    }
  }
];