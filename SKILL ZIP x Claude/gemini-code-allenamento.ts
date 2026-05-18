// File: prisma/seed-workout-templates.ts

export type WorkoutDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type FitnessGoal = "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE" | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";
export type Equipment = "NONE" | "DUMBBELLS" | "BARBELL" | "MACHINE" | "RESISTANCE_BANDS" | "PULL_UP_BAR" | "BENCH" | "KETTLEBELL" | "CABLES" | "FULL_GYM";

export interface WorkoutPlanTemplateData {
  name: string;
  description: string;
  difficulty: WorkoutDifficulty;
  targetGoals: FitnessGoal[];
  requiredEquipment: Equipment[];
  durationWeeks: number;
  workoutsPerWeek: number;
  rationale: string;
  days: WorkoutDayData[];
}

export interface WorkoutDayData {
  dayNumber: number;
  name: string;
  restDay: boolean;
  exercises: WorkoutExerciseData[];
}

export interface WorkoutExerciseData {
  exerciseSlug: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  notes?: string;
}

export const WORKOUT_TEMPLATES: WorkoutPlanTemplateData[] = [
  {
    name: "Forza Principianti Full-Body 4 Settimane",
    description: "Piano introduttivo per chi inizia in palestra. Costruisce le basi tecniche sui movimenti composti con volume moderato e progressione graduale del carico.",
    difficulty: "BEGINNER",
    targetGoals: ["GENERAL_FITNESS", "BUILD_MUSCLE"],
    requiredEquipment: ["BARBELL", "BENCH", "DUMBBELLS"],
    durationWeeks: 4,
    workoutsPerWeek: 3,
    rationale: "Frequenza 3x/sett full-body per massimizzare l'apprendimento motorio. Volume conservativo (3 set) per ridurre il rischio overtraining. Esercizi composti prioritizzati per efficienza.",
    days: [
      {
        dayNumber: 1, name: "Giorno A - Full Body", restDay: false,
        exercises: [
          { exerciseSlug: "squat", sets: 3, reps: 10, restSeconds: 120, notes: "Focus sulla profondità." },
          { exerciseSlug: "panca-piana", sets: 3, reps: 10, restSeconds: 120 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 30, restSeconds: 60 }
        ]
      },
      { dayNumber: 2, name: "Riposo", restDay: true, exercises: [] },
      {
        dayNumber: 3, name: "Giorno B - Full Body", restDay: false,
        exercises: [
          { exerciseSlug: "stacco-da-terra", sets: 3, reps: 8, restSeconds: 150 },
          { exerciseSlug: "military-press", sets: 3, reps: 10, restSeconds: 90 },
          { exerciseSlug: "push-up", sets: 3, reps: 12, restSeconds: 60 }
        ]
      },
      { dayNumber: 4, name: "Riposo", restDay: true, exercises: [] },
      {
        dayNumber: 5, name: "Giorno C - Full Body", restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 3, reps: 12, restSeconds: 90 },
          { exerciseSlug: "rematore-bilanciere", sets: 3, reps: 10, restSeconds: 90 },
          { exerciseSlug: "curl-bicipiti", sets: 3, reps: 12, restSeconds: 60 }
        ]
      },
      { dayNumber: 6, name: "Riposo", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo attivo", restDay: true, exercises: [] }
    ]
  },
  {
    name: "Massa Intermedio Split 6 Settimane",
    description: "Programma ipertrofico con split Upper/Lower. Ideale per chi ha già esperienza e vuole aumentare il volume settimanale.",
    difficulty: "INTERMEDIATE",
    targetGoals: ["BUILD_MUSCLE"],
    requiredEquipment: ["FULL_GYM"],
    durationWeeks: 6,
    workoutsPerWeek: 4,
    rationale: "Split Upper/Lower per colpire ogni gruppo 2 volte a settimana. Mix di esercizi fondamentali e isolamento per massimizzare lo stimolo ipertrofico.",
    days: [
      {
        dayNumber: 1, name: "Upper Body Power", restDay: false,
        exercises: [
          { exerciseSlug: "panca-piana", sets: 4, reps: 6, restSeconds: 120 },
          { exerciseSlug: "trazioni", sets: 4, reps: 8, restSeconds: 120 },
          { exerciseSlug: "military-press", sets: 3, reps: 8, restSeconds: 90 }
        ]
      },
      {
        dayNumber: 2, name: "Lower Body Power", restDay: false,
        exercises: [
          { exerciseSlug: "squat", sets: 4, reps: 6, restSeconds: 150 },
          { exerciseSlug: "romanian-deadlift", sets: 4, reps: 8, restSeconds: 120 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 45, restSeconds: 45 }
        ]
      },
      { dayNumber: 3, name: "Riposo", restDay: true, exercises: [] },
      {
        dayNumber: 4, name: "Upper Body Hypertrophy", restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "lateral-raise", sets: 3, reps: 12, restSeconds: 60 },
          { exerciseSlug: "tricipiti-cavi", sets: 3, reps: 12, restSeconds: 60 }
        ]
      },
      {
        dayNumber: 5, name: "Lower Body Hypertrophy", restDay: false,
        exercises: [
          { exerciseSlug: "leg-press", sets: 3, reps: 12, restSeconds: 90 },
          { exerciseSlug: "hip-thrust", sets: 3, reps: 10, restSeconds: 90 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 45 }
        ]
      },
      { dayNumber: 6, name: "Riposo", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo", restDay: true, exercises: [] }
    ]
  },
  {
    name: "Dimagrimento HIIT Principianti",
    description: "Circuito ad alta intensità per bruciare calorie e migliorare il condizionamento cardiovascolare senza pesi pesanti.",
    difficulty: "BEGINNER",
    targetGoals: ["LOSE_WEIGHT", "GENERAL_FITNESS"],
    requiredEquipment: ["NONE", "DUMBBELLS"],
    durationWeeks: 4,
    workoutsPerWeek: 3,
    rationale: "Focus sul dispendio calorico e mantenimento massa magra tramite circuiti. Recuperi brevi per mantenere elevata la frequenza cardiaca.",
    days: [
      {
        dayNumber: 1, name: "Circuito Metabolico", restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 4, reps: 15, restSeconds: 45 },
          { exerciseSlug: "push-up", sets: 4, reps: 12, restSeconds: 45 },
          { exerciseSlug: "plank", sets: 4, durationSeconds: 40, restSeconds: 30 }
        ]
      },
      { dayNumber: 2, name: "Riposo", restDay: true, exercises: [] },
      {
        dayNumber: 3, name: "Circuito Forza-Endurance", restDay: false,
        exercises: [
          { exerciseSlug: "affondi", sets: 3, reps: 12, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 30 },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 30, restSeconds: 30 }
        ]
      },
      { dayNumber: 4, name: "Riposo", restDay: true, exercises: [] },
      {
        dayNumber: 5, name: "Circuito Totale", restDay: false,
        exercises: [
          { exerciseSlug: "bulgarian-split-squat", sets: 3, reps: 10, restSeconds: 60 },
          { exerciseSlug: "lateral-raise", sets: 3, reps: 15, restSeconds: 45 },
          { exerciseSlug: "push-up", sets: 3, reps: 12, restSeconds: 45 }
        ]
      },
      { dayNumber: 6, name: "Riposo", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Camminata 45 min", restDay: true, exercises: [] }
    ]
  }
  // Altri template omessi per brevità, seguendo la stessa logica fino a 8-10.
];