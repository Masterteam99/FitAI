import { create } from "zustand";
import type { WorkoutSessionState, CompletedSet } from "@/types/workout";

interface WorkoutStore extends WorkoutSessionState {
  startSession: (sessionId: string, planId?: string) => void;
  endSession: () => void;
  setCurrentExercise: (index: number) => void;
  completeSet: (exerciseId: string, set: CompletedSet) => void;
  startRest: (seconds: number) => void;
  tickRest: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  tickElapsed: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessionId: null,
  planId: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  isResting: false,
  restSecondsRemaining: 0,
  totalElapsedSeconds: 0,
  completedSets: {},
  status: "idle",

  startSession: (sessionId, planId) =>
    set({ sessionId, planId: planId ?? null, status: "active", totalElapsedSeconds: 0, currentExerciseIndex: 0, completedSets: {} }),

  endSession: () =>
    set({ sessionId: null, planId: null, status: "idle", completedSets: {}, currentExerciseIndex: 0 }),

  setCurrentExercise: (index) => set({ currentExerciseIndex: index, currentSetIndex: 0 }),

  completeSet: (exerciseId, set_) =>
    set((state) => ({
      completedSets: {
        ...state.completedSets,
        [exerciseId]: [...(state.completedSets[exerciseId] ?? []), set_],
      },
      currentSetIndex: state.currentSetIndex + 1,
    })),

  startRest: (seconds) => set({ isResting: true, restSecondsRemaining: seconds, status: "resting" }),

  tickRest: () => {
    const { restSecondsRemaining } = get();
    if (restSecondsRemaining <= 1) {
      set({ isResting: false, restSecondsRemaining: 0, status: "active" });
    } else {
      set({ restSecondsRemaining: restSecondsRemaining - 1 });
    }
  },

  pauseSession: () => set({ status: "paused" }),
  resumeSession: () => set({ status: "active" }),
  tickElapsed: () => set((state) => ({ totalElapsedSeconds: state.totalElapsedSeconds + 1 })),
}));
