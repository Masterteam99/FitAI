export interface CompletedSet {
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion 1-10
}

export interface WorkoutSessionState {
  sessionId: string | null;
  planId: string | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restSecondsRemaining: number;
  totalElapsedSeconds: number;
  completedSets: Record<string, CompletedSet[]>;
  status: "idle" | "active" | "resting" | "paused" | "completed";
}

export interface GeneratePlanRequest {
  goals: string[];
  currentLevel: string;
  equipment: string[];
  daysPerWeek: number;
  focusAreas: string[];
  restrictions?: string;
  durationWeeks?: number;
}

export interface GeneratedPlanExercise {
  exerciseSlug: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  notes?: string;
}

export interface GeneratedPlanDay {
  dayNumber: number;
  name: string;
  restDay: boolean;
  exercises: GeneratedPlanExercise[];
}

export interface GeneratedPlan {
  name: string;
  description: string;
  difficulty: string;
  durationWeeks: number;
  workoutsPerWeek: number;
  days: GeneratedPlanDay[];
  rationale: string;
}
