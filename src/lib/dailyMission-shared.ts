export const NUTRITION_TASK_THRESHOLD = 3;
export const CHECKIN_MOODS = [1, 2, 3, 4, 5] as const;
export const MOOD_EMOJI: Record<number, string> = {
  1: "😩",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "💪",
};

export type MissionTaskStatus = "pending" | "in_progress" | "done";

export type WorkoutMissionTask = {
  kind: "workout";
  status: MissionTaskStatus;
  label: string;
  ctaHref: string;
  restDay: boolean;
  hasPlan: boolean;
};

export type NutritionMissionTask = {
  kind: "nutrition";
  status: MissionTaskStatus;
  label: string;
  ctaHref: string;
  loggedCount: number;
  threshold: number;
};

export type CheckinMissionTask = {
  kind: "checkin";
  status: MissionTaskStatus;
  label: string;
  selectedMood: number | null;
};

export type DailyMission = {
  date: string;
  workout: WorkoutMissionTask;
  nutrition: NutritionMissionTask;
  checkin: CheckinMissionTask;
  completedCount: number;
};
