export type MuscleGroupLabel = {
  CHEST: "Petto";
  BACK: "Schiena";
  SHOULDERS: "Spalle";
  BICEPS: "Bicipiti";
  TRICEPS: "Tricipiti";
  FOREARMS: "Avambracci";
  CORE: "Core";
  QUADRICEPS: "Quadricipiti";
  HAMSTRINGS: "Femorali";
  GLUTES: "Glutei";
  CALVES: "Polpacci";
  FULL_BODY: "Corpo Completo";
};

export const MUSCLE_GROUP_LABELS: MuscleGroupLabel = {
  CHEST: "Petto",
  BACK: "Schiena",
  SHOULDERS: "Spalle",
  BICEPS: "Bicipiti",
  TRICEPS: "Tricipiti",
  FOREARMS: "Avambracci",
  CORE: "Core",
  QUADRICEPS: "Quadricipiti",
  HAMSTRINGS: "Femorali",
  GLUTES: "Glutei",
  CALVES: "Polpacci",
  FULL_BODY: "Corpo Completo",
};

export const DIFFICULTY_LABELS = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzato",
} as const;

export const EQUIPMENT_LABELS = {
  NONE: "Nessuna attrezzatura",
  DUMBBELLS: "Manubri",
  BARBELL: "Bilanciere",
  MACHINE: "Macchina",
  RESISTANCE_BANDS: "Elastici",
  PULL_UP_BAR: "Sbarra trazioni",
  BENCH: "Panca",
  KETTLEBELL: "Kettlebell",
  CABLES: "Cavi",
  FULL_GYM: "Palestra completa",
} as const;

export const CATEGORY_LABELS = {
  STRENGTH: "Forza",
  CARDIO: "Cardio",
  FLEXIBILITY: "Flessibilità",
  BALANCE: "Equilibrio",
  PLYOMETRIC: "Pliometrico",
  FUNCTIONAL: "Funzionale",
} as const;

export const FITNESS_GOAL_LABELS = {
  LOSE_WEIGHT: "Perdita di peso",
  BUILD_MUSCLE: "Aumento massa muscolare",
  ENDURANCE: "Resistenza",
  FLEXIBILITY: "Flessibilità",
  GENERAL_FITNESS: "Forma fisica generale",
  ATHLETIC_PERFORMANCE: "Performance atletica",
} as const;
